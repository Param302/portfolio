"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import FameCharacter from "@/app/walloffame/FameCharacter";
import HeroAccent from "./HeroAccent";
import styles from "./HomeIntro.module.css";

const ENTER_MS = 850;
const HOLD_MS = 500;
const FLIGHT_MS = 850;
const IntroContext = createContext(null);

export function useHomeIntro() {
  return useContext(IntroContext);
}

function visibleTarget(parent, selector) {
  return [...(parent?.querySelectorAll(selector) || [])].find((element) => element.getBoundingClientRect().width > 0);
}

function flightTo(source, target) {
  if (!source || !target) return null;
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width || !from.height || !to.width || !to.height) return null;
  return {
    x: to.left + to.width / 2 - from.left - from.width / 2,
    y: to.top + to.height / 2 - from.top - from.height / 2,
    scale: Math.min(to.width / from.width, to.height / from.height),
  };
}

function flightStyle(flight) {
  return flight ? { transform: `translate3d(${flight.x}px, ${flight.y}px, 0) scale(${flight.scale})` } : undefined;
}

export default function HomeIntro({ children }) {
  const [phase, setPhase] = useState("greeting");
  const [flight, setFlight] = useState(null);
  const chipRef = useRef(null);
  const overlayRef = useRef(null);
  const portraitRef = useRef(null);
  const nameRef = useRef(null);
  const finished = useRef(false);
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setPhase("complete");
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The CSS fallback may already have revealed the page before hydration.
    // Never reintroduce the greeting once that fallback has hidden it.
    const greetingExpired = () => !overlayRef.current || window.getComputedStyle(overlayRef.current).visibility === "hidden";
    if (greetingExpired() || motionPreference.matches || document.hidden || window.scrollY > 48 || (window.location.hash && window.location.hash !== "#home")) {
      finish();
      return;
    }

    // CSS starts the entrance with the first HTML paint. Count that elapsed
    // time too, so hydration does not add another full greeting or miss the fuse.
    const entranceClock = overlayRef.current.getAnimations?.()[0]?.currentTime;
    const elapsed = typeof entranceClock === "number" ? entranceClock : 0;
    // The same buttons become positionable at hydration. Give visitors the
    // full hold with those controls visible even on a slow first JS load.
    const greetingRemaining = Math.max(HOLD_MS, ENTER_MS + HOLD_MS - elapsed);
    let arrivalTimer;
    const holdTimer = window.setTimeout(() => {
      if (finished.current) return;
      if (greetingExpired()) { finish(); return; }
      const avatar = flightTo(portraitRef.current, visibleTarget(chipRef.current, "[data-intro-avatar-target]"));
      const name = flightTo(nameRef.current, visibleTarget(chipRef.current, "[data-intro-name-target]"));
      if (!avatar || !name) { finish(); return; }
      setFlight({ avatar, name });
      setPhase("docking");
      arrivalTimer = window.setTimeout(finish, FLIGHT_MS);
    }, greetingRemaining);
    // Never leave the actual page hidden if an animation or layout target fails.
    const fallbackTimer = window.setTimeout(finish, greetingRemaining + FLIGHT_MS + 500);
    const onScroll = () => { if (window.scrollY > 48) finish(); };
    const onVisibility = () => { if (document.hidden) finish(); };
    const onKeyDown = (event) => { if (event.key === "Escape" || event.key === "Tab") finish(); };
    const onNavigate = (event) => { if (event.target.closest?.("a, button")) finish(); };
    const onMotionChange = (event) => { if (event.matches) finish(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", finish, { passive: true });
    window.addEventListener("hashchange", finish);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("click", onNavigate, true);
    motionPreference.addEventListener?.("change", onMotionChange);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(arrivalTimer);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", finish);
      window.removeEventListener("hashchange", finish);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onNavigate, true);
      motionPreference.removeEventListener?.("change", onMotionChange);
    };
  }, [finish]);

  const value = useMemo(() => ({ phase, chipRef }), [phase]);

  return (
    <IntroContext.Provider value={value}>
      <div className={styles.root} data-home-intro={phase} data-intro-path={flight ? "dock" : phase === "complete" ? "skip" : "pending"}>
        {children}
        {phase !== "complete" && (
          <div ref={overlayRef} className={styles.overlay} data-intro-overlay>
            <div className={styles.greeting}>
              <div className={styles.portraitStack}>
                <p className={styles.hi} aria-label="Hi">
                  <span className={styles.hiLetter} aria-hidden="true">H</span>
                  <span className={styles.hiLetter} aria-hidden="true">i</span>
                </p>
                <div ref={portraitRef} className={styles.portraitFlight} style={flightStyle(flight?.avatar)}>
                  <div className={styles.portraitEnter}>
                    <FameCharacter eager fallback="chip" reaction="happy" />
                  </div>
                </div>
              </div>
              <div className={styles.wordsEnter}>
                <p className={styles.nameLine}>
                  <span className={styles.prefix}>I&apos;m</span>
                  <span ref={nameRef} className={styles.nameFlight} style={flightStyle(flight?.name)}>
                    <HeroAccent className={styles.name}>Parampreet Singh</HeroAccent>
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <noscript><style>{`[data-home-intro] [data-intro-content], [data-home-intro] [data-intro-reveal], [data-home-intro] [data-intro-chip], [data-home-intro] [data-intro-actions] { opacity: 1 !important; visibility: visible !important; transform: none !important; animation: none !important; } [data-intro-overlay] { display: none !important; }`}</style></noscript>
    </IntroContext.Provider>
  );
}
