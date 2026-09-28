"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./FeedbackWheel.module.css";

function wrap(index, count) {
  return ((index % count) + count) % count;
}

export default function FeedbackWheel({ feedbacks, reduceMotion = false, onActiveChange }) {
  const count = feedbacks.length;
  const cycleCount = count > 1 ? 3 : 1;
  const initialRaw = count > 1 ? count : 0;
  const viewportRef = useRef(null);
  const itemRefs = useRef([]);
  const cycleRefs = useRef([]);
  const layoutRef = useRef({ centers: [], cycleHeight: 0 });
  const focusedRef = useRef(initialRaw);
  const activeIndexRef = useRef(-1);
  const callbackRef = useRef(onActiveChange);
  const scrollFrameRef = useRef(null);
  const [focusedRaw, setFocusedRaw] = useState(initialRaw);
  const hintId = useId();

  useEffect(() => {
    callbackRef.current = onActiveChange;
  }, [onActiveChange]);

  const publishFocus = useCallback((rawIndex) => {
    if (!count) return;
    focusedRef.current = rawIndex;
    setFocusedRaw((current) => current === rawIndex ? current : rawIndex);
    const index = wrap(rawIndex, count);
    if (activeIndexRef.current !== index) {
      activeIndexRef.current = index;
      callbackRef.current?.(index);
    }
  }, [count]);

  const syncFocus = useCallback(() => {
    const viewport = viewportRef.current;
    const { centers, cycleHeight } = layoutRef.current;
    if (!viewport || !centers.length) return;

    let center = viewport.scrollTop + viewport.clientHeight / 2;
    if (count > 1 && cycleHeight > 0) {
      // The cycles have identical, variable-height rows. Moving by their measured
      // height preserves the exact position inside a quote, including long notes.
      // Let arrow navigation finish centering the adjacent quote before wrapping.
      const shift = center <= centers[count - 1] + 1
        ? cycleHeight
        : center >= centers[count * 2] - 1 ? -cycleHeight : 0;
      if (shift) {
        viewport.scrollTop += shift;
        center += shift;
      }
    }

    let low = 0;
    let high = centers.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (centers[middle] < center) low = middle + 1;
      else high = middle;
    }
    const nearest = low > 0 && center - centers[low - 1] < centers[low] - center ? low - 1 : low;
    publishFocus(nearest);
  }, [count, publishFocus]);

  const centerItem = useCallback((rawIndex, behavior = "auto") => {
    const viewport = viewportRef.current;
    const center = layoutRef.current.centers[rawIndex];
    if (!viewport || center === undefined) return;
    // scrollIntoView can move the document and would pull the character away.
    viewport.scrollTo({ top: center - viewport.clientHeight / 2, behavior });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !count) return undefined;
    let disposed = false;

    function measureAndCenter() {
      if (disposed) return;
      const activeIndex = activeIndexRef.current < 0 ? 0 : wrap(activeIndexRef.current, count);
      viewport.style.setProperty("--wheel-edge", `${viewport.clientHeight / 2}px`);
      const centers = itemRefs.current.slice(0, count * cycleCount).map((item) => item.offsetTop + item.offsetHeight / 2);
      const firstCycle = cycleRefs.current[0];
      const middleCycle = cycleRefs.current[1];
      layoutRef.current = {
        centers,
        cycleHeight: middleCycle ? middleCycle.offsetTop - firstCycle.offsetTop : 0,
      };
      const rawIndex = (count > 1 ? count : 0) + activeIndex;
      centerItem(rawIndex);
      publishFocus(rawIndex);
    }

    const frame = window.requestAnimationFrame(measureAndCenter);
    const observer = new ResizeObserver(measureAndCenter);
    observer.observe(viewport);
    // Font loading or a responsive width change can alter individual quote heights.
    if (cycleRefs.current[0]) observer.observe(cycleRefs.current[0]);
    document.fonts?.ready.then(measureAndCenter);

    return () => {
      disposed = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    };
  }, [centerItem, count, cycleCount, feedbacks, publishFocus]);

  function queueScrollSync() {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      syncFocus();
    });
  }

  function move(direction) {
    if (count < 2) return;
    const next = focusedRef.current + direction;
    centerItem(next, reduceMotion ? "auto" : "smooth");
  }

  const activeIndex = count ? wrap(focusedRaw, count) : 0;

  if (!count) {
    return <p className={styles.empty}>Your kind words will find a home here.</p>;
  }

  return (
    <div className={styles.wheel} data-reduced-motion={reduceMotion ? "true" : undefined}>
      <div className={styles.viewportFrame}>
        <div
          ref={viewportRef}
          className={styles.viewport}
          role="region"
          aria-label="Every learner note"
          aria-describedby={hintId}
          tabIndex={0}
          onScroll={queueScrollSync}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              move(event.key === "ArrowDown" ? 1 : -1);
            }
            if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              centerItem((count > 1 ? count : 0) + (event.key === "End" ? count - 1 : 0), reduceMotion ? "auto" : "smooth");
            }
          }}
        >
          <div className={styles.track}>
            {Array.from({ length: cycleCount }, (_, cycle) => (
              <div
                className={styles.cycle}
                key={cycle}
                ref={(element) => { cycleRefs.current[cycle] = element; }}
                aria-hidden={cycleCount > 1 && cycle !== 1 ? true : undefined}
              >
                {feedbacks.map((feedback, index) => {
                  const rawIndex = cycle * count + index;
                  const distance = Math.min(Math.abs(rawIndex - focusedRaw), 3);
                  return (
                    <article
                      className={styles.item}
                      key={index}
                      ref={(element) => { itemRefs.current[rawIndex] = element; }}
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        className={styles.note}
                        data-distance={distance}
                        aria-current={rawIndex === focusedRaw ? "true" : undefined}
                        onClick={() => centerItem(rawIndex, reduceMotion ? "auto" : "smooth")}
                      >
                        <span className={styles.quoteMark} aria-hidden="true">“</span>
                        <span className={styles.quote}>{feedback}</span>
                        <span className={styles.signature}>Anonymous learner</span>
                      </button>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.control} aria-label="Previous learner note" disabled={count < 2} onClick={() => move(-1)}>
          <ChevronUp size={17} aria-hidden="true" />
        </button>
        <p className={styles.counter}><strong>{activeIndex + 1}</strong><span aria-hidden="true"> / </span><span className={styles.srOnly}> of </span>{count} notes</p>
        <button type="button" className={styles.control} aria-label="Next learner note" disabled={count < 2} onClick={() => move(1)}>
          <ChevronDown size={17} aria-hidden="true" />
        </button>
      </div>
      <p id={hintId} className={styles.hint}>Scroll to discover. Use ↑ ↓ to take your time.</p>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">Note {activeIndex + 1} of {count}. {feedbacks[activeIndex]}</p>
    </div>
  );
}
