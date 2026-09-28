"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Home, Minimize2 } from "lucide-react";
import FameCharacter from "./FameCharacter";
import styles from "./WallOfFame.module.css";

const BLINK_INTERVAL = [1.55, 2.95];
const LIKED_STORAGE_KEY = "wall-of-fame-liked-v1";
const VISITOR_STORAGE_KEY = "wall-of-fame-visitor-v1";
const STREAM_OFFSETS = [-2, -1, 0, 1, 2];
const NODE_LAYOUT = [
  { x: 5, y: 18, size: 8, dx: 34, dy: 22, duration: 14, delay: -2 },
  { x: 15, y: 35, size: 13, dx: -26, dy: 38, duration: 17, delay: -9 },
  { x: 27, y: 12, size: 7, dx: 22, dy: -20, duration: 11, delay: -4 },
  { x: 41, y: 27, size: 10, dx: -38, dy: 17, duration: 19, delay: -12 },
  { x: 61, y: 14, size: 8, dx: 31, dy: 29, duration: 13, delay: -6 },
  { x: 78, y: 30, size: 14, dx: -24, dy: -33, duration: 18, delay: -3 },
  { x: 93, y: 17, size: 7, dx: -35, dy: 25, duration: 15, delay: -11 },
  { x: 8, y: 58, size: 11, dx: 28, dy: -31, duration: 20, delay: -7 },
  { x: 20, y: 76, size: 7, dx: -21, dy: -27, duration: 12, delay: -5 },
  { x: 34, y: 52, size: 9, dx: 30, dy: 35, duration: 16, delay: -13 },
  { x: 50, y: 70, size: 12, dx: -36, dy: 19, duration: 21, delay: -8 },
  { x: 66, y: 55, size: 7, dx: 26, dy: -37, duration: 14, delay: -10 },
  { x: 81, y: 78, size: 10, dx: -30, dy: 24, duration: 18, delay: -1 },
  { x: 95, y: 61, size: 8, dx: -24, dy: -34, duration: 16, delay: -14 },
];

function wrap(index, length) {
  return ((index % length) + length) % length;
}

function createVisitorId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function feedbackSize(text) {
  if (text.length > 520) return "long";
  if (text.length > 230) return "medium";
  return "short";
}

function FeedbackContent({ feedback, liked, pending, interactive = true, onLike }) {
  return (
    <>
      <div className={styles.feedbackCopy} data-feedback-copy>
        <p>“{feedback.text}”</p>
      </div>
      <button
        type="button"
        className={styles.heartButton}
        data-liked={liked}
        aria-label={liked ? "You liked this appreciation" : "Like this appreciation"}
        aria-pressed={liked}
        aria-busy={pending}
        tabIndex={interactive ? 0 : -1}
        onClick={(event) => { event.stopPropagation(); onLike(feedback); }}
      >
        <Heart aria-hidden="true" fill={liked ? "currentColor" : "none"} />
      </button>
    </>
  );
}

export default function WallOfFameClient({ feedbacks }) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [reaction, setReaction] = useState({ name: "idle", key: 0 });
  const [announcement, setAnnouncement] = useState("");
  const likedRef = useRef(likedIds);
  const pendingRef = useRef(new Set());
  const visitorIdRef = useRef("");
  const reactionTimerRef = useRef();
  const wheelTotalRef = useRef(0);
  const lastWheelShiftRef = useRef(0);
  const touchStartRef = useRef(null);
  const feedbackCount = feedbacks.length;

  const shiftFeedback = useCallback((direction) => {
    if (feedbackCount < 2) return;
    setActiveIndex((current) => wrap(current + direction, feedbackCount));
  }, [feedbackCount]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    try {
      const stored = JSON.parse(window.localStorage.getItem(LIKED_STORAGE_KEY) || "[]");
      const nextLiked = new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === "string") : []);
      likedRef.current = nextLiked;
      setLikedIds(nextLiked);
      visitorIdRef.current = window.localStorage.getItem(VISITOR_STORAGE_KEY) || createVisitorId();
      window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorIdRef.current);
    } catch {
      visitorIdRef.current = createVisitorId();
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      window.clearTimeout(reactionTimerRef.current);
    };
  }, []);

  const triggerReaction = useCallback(() => {
    window.clearTimeout(reactionTimerRef.current);
    setReaction((current) => ({ name: "liked", key: current.key + 1 }));
    reactionTimerRef.current = window.setTimeout(() => {
      setReaction((current) => ({ name: "idle", key: current.key + 1 }));
    }, 2000);
  }, []);

  const updateLikedIds = useCallback((next) => {
    likedRef.current = next;
    setLikedIds(next);
    try { window.localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([...next])); } catch { /* Storage is optional. */ }
  }, []);

  const likeFeedback = useCallback(async (feedback) => {
    triggerReaction();
    if (likedRef.current.has(feedback.id) || pendingRef.current.has(feedback.id)) return;

    const nextLiked = new Set(likedRef.current);
    nextLiked.add(feedback.id);
    updateLikedIds(nextLiked);
    pendingRef.current.add(feedback.id);
    setPendingIds(new Set(pendingRef.current));
    setAnnouncement("Appreciation liked.");

    try {
      if (!visitorIdRef.current) visitorIdRef.current = createVisitorId();
      const response = await fetch("/api/walloffame/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: feedback.id, visitorId: visitorIdRef.current }),
      });
      if (!response.ok) throw new Error("Like could not be saved");
    } catch {
      const reverted = new Set(likedRef.current);
      reverted.delete(feedback.id);
      updateLikedIds(reverted);
      setAnnouncement("The reaction could not be saved. Please try again.");
    } finally {
      pendingRef.current.delete(feedback.id);
      setPendingIds(new Set(pendingRef.current));
    }
  }, [triggerReaction, updateLikedIds]);

  const visibleFeedbacks = useMemo(() => {
    if (!feedbackCount) return [];
    return STREAM_OFFSETS.map((offset) => ({
      feedback: feedbacks[wrap(activeIndex + offset, feedbackCount)],
      offset,
    }));
  }, [activeIndex, feedbackCount, feedbacks]);

  const nodes = useMemo(() => {
    if (!feedbackCount) return [];
    return NODE_LAYOUT.map((layout, index) => ({
      layout,
      feedback: feedbacks[Math.floor(index * feedbackCount / NODE_LAYOUT.length)],
    }));
  }, [feedbackCount, feedbacks]);

  useEffect(() => {
    if (reduceMotion || expanded || feedbackCount < 2) return undefined;
    const currentLength = feedbacks[activeIndex]?.text.length || 0;
    const delay = Math.min(11500, 4300 + currentLength * 6);
    const timer = window.setTimeout(() => shiftFeedback(1), delay);
    return () => window.clearTimeout(timer);
  }, [activeIndex, expanded, feedbackCount, feedbacks, reduceMotion, shiftFeedback]);

  function handleWheel(event) {
    const copy = event.target.closest?.("[data-feedback-copy]");
    if (copy) {
      const canMoveDown = event.deltaY > 0 && copy.scrollTop + copy.clientHeight < copy.scrollHeight - 1;
      const canMoveUp = event.deltaY < 0 && copy.scrollTop > 1;
      if (canMoveDown || canMoveUp) return;
    }
    const now = performance.now();
    if (now - lastWheelShiftRef.current < 620) return;
    wheelTotalRef.current += event.deltaY;
    if (Math.abs(wheelTotalRef.current) < 38) return;
    shiftFeedback(wheelTotalRef.current > 0 ? 1 : -1);
    wheelTotalRef.current = 0;
    lastWheelShiftRef.current = now;
  }

  function handleTouchStart(event) {
    const copy = event.target.closest?.("[data-feedback-copy]");
    touchStartRef.current = {
      y: event.touches[0]?.clientY ?? null,
      contentScrolls: Boolean(copy && copy.scrollHeight > copy.clientHeight + 1),
    };
  }

  function handleTouchEnd(event) {
    if (!touchStartRef.current || touchStartRef.current.y === null) return;
    const end = event.changedTouches[0]?.clientY ?? touchStartRef.current.y;
    const distance = touchStartRef.current.y - end;
    const contentScrolls = touchStartRef.current.contentScrolls;
    touchStartRef.current = null;
    if (!contentScrolls && Math.abs(distance) > 34) shiftFeedback(distance > 0 ? 1 : -1);
  }

  if (!feedbackCount) return null;

  return (
    <main
      className={styles.page}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") shiftFeedback(1);
        if (event.key === "ArrowUp") shiftFeedback(-1);
      }}
    >
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.nodes}>
        {nodes.map(({ feedback, layout }) => (
          <span
            key={feedback.id}
            className={styles.nodePath}
            style={{
              "--node-x": `${layout.x}%`,
              "--node-y": `${layout.y}%`,
              "--node-size": `${layout.size}px`,
              "--node-dx": `${layout.dx}px`,
              "--node-dy": `${layout.dy}px`,
              "--node-duration": `${layout.duration}s`,
              "--node-delay": `${layout.delay}s`,
            }}
          >
            {expanded?.id !== feedback.id && (
              <motion.button
                layoutId={`feedback-node-${feedback.id}`}
                type="button"
                className={styles.node}
                aria-label={`Open appreciation: ${feedback.text.slice(0, 72)}`}
                onClick={() => setExpanded(feedback)}
                transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </span>
        ))}
      </div>

      <nav className={styles.nav} aria-label="Wall of Fame navigation">
        <Link href="/" className={styles.homeButton} aria-label="Go to the landing page">
          <Home aria-hidden="true" />
        </Link>
        <div className={styles.nameChip}>
          <Image src="/parampreet.png" alt="" width={30} height={30} priority />
          <span>Parampreet Singh</span>
        </div>
      </nav>

      <section className={styles.intro} aria-labelledby="wall-heading">
        <header className={styles.heading}>
          <h1 id="wall-heading">Wall of <em>Fame.</em></h1>
          <p>A few kind words &amp; appreciations received from the students.</p>
        </header>
        <div className={styles.avatar} data-reacting={reaction.name === "liked"}>
          <FameCharacter
            eager
            background
            reaction={reaction.name}
            reactionKey={reaction.key}
            reduceMotion={Boolean(reduceMotion)}
            blinkInterval={BLINK_INTERVAL}
          />
        </div>
      </section>

      <section
        className={styles.stream}
        aria-label="Student appreciations"
        tabIndex={0}
      >
        <div className={styles.streamStage}>
          {visibleFeedbacks.map(({ feedback, offset }) => (
            <motion.article
              layout
              key={feedback.id}
              className={styles.feedbackCard}
              data-active={offset === 0}
              data-distance={Math.abs(offset)}
              data-size={feedbackSize(feedback.text)}
              aria-hidden={offset !== 0}
              style={{ "--offset": offset, "--card-scale": 1 - Math.abs(offset) * 0.055, zIndex: 10 - Math.abs(offset) }}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: Math.abs(offset) === 0 ? 1 : Math.abs(offset) === 1 ? 0.42 : 0.12 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <FeedbackContent
                feedback={feedback}
                liked={likedIds.has(feedback.id)}
                pending={pendingIds.has(feedback.id)}
                interactive={offset === 0}
                onLike={likeFeedback}
              />
            </motion.article>
          ))}
        </div>
      </section>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className={styles.spotlightLayer}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
          >
            <motion.article
              layoutId={`feedback-node-${expanded.id}`}
              className={`${styles.feedbackCard} ${styles.spotlightCard}`}
              data-size={feedbackSize(expanded.text)}
              transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              <button type="button" className={styles.minimizeButton} onClick={() => setExpanded(null)} aria-label="Minimize this appreciation">
                <Minimize2 aria-hidden="true" />
              </button>
              <FeedbackContent
                feedback={expanded}
                liked={likedIds.has(expanded.id)}
                pending={pendingIds.has(expanded.id)}
                interactive
                onLike={likeFeedback}
              />
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      <p className={styles.srOnly} aria-live="polite">{announcement}</p>
    </main>
  );
}
