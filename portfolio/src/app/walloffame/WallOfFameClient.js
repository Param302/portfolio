"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, Heart, Pause, Play, Sparkles } from "lucide-react";
import FameCharacter from "./FameCharacter";
import FeedbackWheel from "./FeedbackWheel";
import styles from "./WallOfFame.module.css";

const REACTIONS = ["happy", "excited", "stars"];
const REACTION_LABELS = { idle: "Made of your kind words", happy: "You made my day", excited: "Okay, this means everything!", stars: "A little starstruck" };

function nextRandom(current, length) {
  return length < 2 ? 0 : (current + 1 + Math.floor(Math.random() * (length - 1))) % length;
}

function FeedbackOrbit({ feedbacks, selected, engaged, onSelect, onRelease, paused, reduceMotion }) {
  const orbitRef = useRef(null);
  const nodesRef = useRef([]);
  const pauseRef = useRef(paused);
  const syncRef = useRef(null);
  const nodeCount = Math.min(10, feedbacks.length);
  const indices = Array.from({ length: nodeCount }, (_, index) => Math.floor(index * feedbacks.length / nodeCount));
  useEffect(() => { pauseRef.current = paused; syncRef.current?.(); }, [paused]);

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit || !nodeCount) return undefined;
    let frame;
    let angle = 0;
    let last = 0;
    let visible = true;
    let width = orbit.clientWidth;
    const finePointer = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
    function paint() {
      nodesRef.current.forEach((node, index) => {
        if (!node) return;
        const theta = angle + (index / nodeCount) * Math.PI * 2 - Math.PI / 2;
        const depth = (Math.sin(theta) + 1) / 2;
        node.style.transform = `translate3d(${Math.cos(theta) * Math.max(0, width / 2 - 106)}px, ${Math.sin(theta) * 169}px, 0) scale(${0.84 + depth * 0.16})`;
        node.style.zIndex = Math.round(depth * 3) + 1;
      });
    }
    function tick(time) {
      if (last && !pauseRef.current) angle += Math.min(time - last, 50) * 0.000055;
      last = time;
      paint();
      frame = window.requestAnimationFrame(tick);
    }
    function sync() {
      window.cancelAnimationFrame(frame);
      last = 0;
      if (!pauseRef.current && !reduceMotion && visible && !document.hidden && finePointer.matches) frame = window.requestAnimationFrame(tick);
      else paint();
    }
    syncRef.current = sync;
    const resize = new ResizeObserver(() => { width = orbit.clientWidth; paint(); });
    resize.observe(orbit);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(orbit);
    document.addEventListener("visibilitychange", sync);
    finePointer.addEventListener("change", sync);
    paint();
    sync();
    return () => {
      syncRef.current = null;
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      finePointer.removeEventListener("change", sync);
    };
  }, [nodeCount, reduceMotion]);

  return (
    <div ref={orbitRef} className={styles.orbit} aria-label="Orbiting learner notes">
      <div className={styles.orbitLine} aria-hidden="true" /><div className={styles.orbitLineInner} aria-hidden="true" />
      {indices.map((feedbackIndex, index) => (
        <div key={feedbackIndex} ref={(element) => { nodesRef.current[index] = element; }} className={styles.orbitPosition}>
          <button type="button" className={styles.orbitNote} data-active={selected === feedbackIndex} data-muted={engaged && selected !== feedbackIndex}
            onPointerEnter={(event) => { if (event.pointerType !== "touch") onSelect(feedbackIndex, "pointer"); }} onPointerLeave={() => onRelease("pointer")}
            onFocus={() => onSelect(feedbackIndex, "focus")} onBlur={() => onRelease("focus")} onClick={() => onSelect(feedbackIndex, "click")}
            aria-label={`Read note ${feedbackIndex + 1}: ${feedbacks[feedbackIndex]}`}>
            <span className={styles.noteMark} aria-hidden="true">“</span><span className={styles.notePreview}>{feedbacks[feedbackIndex]}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function MobileConstellation({ feedbacks, selected, paused }) {
  return (
    <div className={styles.constellation} data-paused={paused} aria-hidden="true">
      {[0, 1, 2].map((ring) => (
        <div key={ring} className={styles.dotRing} style={{ "--ring": ring }}>
          {feedbacks.map((_, index) => {
            if (index % 3 !== ring) return null;
            const ringCount = Math.ceil((feedbacks.length - ring) / 3);
            const angle = Math.floor(index / 3) / Math.max(1, ringCount) * Math.PI * 2;
            return <span key={index} className={styles.dot} data-active={index === selected} style={{ left: `${(50 + Math.cos(angle) * 48).toFixed(3)}%`, top: `${(50 + Math.sin(angle) * 48).toFixed(3)}%`, "--dot-opacity": (0.2 + (index % 5) * 0.12).toFixed(2) }} />;
          })}
        </div>
      ))}
    </div>
  );
}

export default function WallOfFameClient({ feedbacks }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [interaction, setInteraction] = useState({ pointer: false, focus: false });
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reaction, setReaction] = useState({ name: "idle", key: 0 });
  const [wheelReaction, setWheelReaction] = useState({ name: "happy", key: 0 });
  const heroRef = useRef(null);
  const engaged = interaction.pointer || interaction.focus || interaction.readingPointer || interaction.readingFocus;
  const animationPaused = paused || !!reduceMotion;
  const displayedQuote = feedbacks[active] || "Thank you for learning with me.";

  const react = useCallback((setter) => {
    setter((current) => {
      const previous = REACTIONS.indexOf(current.name);
      return { name: REACTIONS[previous < 0 ? Math.floor(Math.random() * REACTIONS.length) : nextRandom(previous, REACTIONS.length)], key: current.key + 1 };
    });
  }, []);

  const selectNote = useCallback((index) => {
    if (index === activeRef.current) return;
    activeRef.current = index;
    setActive(index);
    react(setReaction);
  }, [react]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    if (heroRef.current) observer.observe(heroRef.current);
    const visibility = () => setPageVisible(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (animationPaused || engaged || !inView || !pageVisible || feedbacks.length < 2) return undefined;
    const timer = window.setInterval(() => selectNote(nextRandom(activeRef.current, feedbacks.length)), 6500);
    return () => window.clearInterval(timer);
  }, [animationPaused, engaged, inView, pageVisible, feedbacks.length, selectNote]);

  const onWheelChange = useCallback(() => react(setWheelReaction), [react]);

  function focusNode(index, source) {
    if (source !== "click") setInteraction((current) => ({ ...current, [source]: true }));
    if (index === activeRef.current && source !== "click") react(setReaction);
    else selectNote(index);
  }
  function releaseNode(source) { setInteraction((current) => ({ ...current, [source]: false })); }

  return (
    <main className={styles.page}>
      <section ref={heroRef} className={styles.hero} data-paused={animationPaused} aria-labelledby="fame-title">
        <nav className={styles.nav} aria-label="Wall of Fame navigation">
          <Link href="/" className={styles.homeLink}><Image src="/parampreet-3d-front-avatar-v3.png" alt="" width={34} height={34} className={styles.navAvatar} /><span>Parampreet Singh<span className={styles.siteLabel}>a little corner of gratitude</span></span></Link>
          <Link href="/#community" className={styles.backLink}><ArrowLeft size={15} /><span>Back to community</span></Link>
        </nav>
        <header className={styles.heading}><p className={styles.eyebrow}><span /> GOOD WORDS. GREAT PEOPLE.</p><h1 id="fame-title">Wall of <span>Fame.</span></h1><p>A few kind words that make it all worthwhile.</p></header>
        <div className={styles.stage}>
          <div className={styles.halo} aria-hidden="true" />
          <FeedbackOrbit feedbacks={feedbacks} selected={active} engaged={engaged} onSelect={focusNode} onRelease={releaseNode} paused={animationPaused || engaged} reduceMotion={reduceMotion} />
          <MobileConstellation feedbacks={feedbacks} selected={active} paused={animationPaused || !inView || !pageVisible} />
          <div className={styles.characterGroup}>
            <div className={styles.character}><FameCharacter reaction={reaction.name} reactionKey={reaction.key} reduceMotion={animationPaused} /></div>
            <div className={styles.characterShadow} aria-hidden="true" />
            <div className={styles.reactionLabel} data-reaction={reaction.name}><Sparkles size={12} aria-hidden="true" />{REACTION_LABELS[reaction.name]}</div>
          </div>
          <span className={styles.orbitCaption}>YOUR WORDS, MY WORLD</span>
        </div>
        <div className={styles.featuredArea}
          onPointerEnter={(event) => { if (event.pointerType !== "touch") setInteraction((current) => ({ ...current, readingPointer: true })); }}
          onPointerLeave={() => releaseNode("readingPointer")}
          onFocusCapture={() => setInteraction((current) => ({ ...current, readingFocus: true }))}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) releaseNode("readingFocus"); }}>
          <div className={styles.featuredHeader}><Heart size={12} aria-hidden="true" /><span>A NOTE FROM A LEARNER</span></div>
          <div className={styles.featuredQuote} aria-live={engaged || animationPaused ? "polite" : "off"} aria-atomic="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.blockquote key={active} tabIndex={0} aria-label="Featured learner note" onPointerDown={(event) => { if (event.pointerType === "touch") setPaused(true); }} initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -7 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>“{displayedQuote}”</motion.blockquote>
            </AnimatePresence>
          </div>
          <div className={styles.noteControls}>
            <button type="button" aria-label="Previous featured note" disabled={feedbacks.length < 2} onClick={() => selectNote((active + feedbacks.length - 1) % feedbacks.length)}><ArrowLeft size={14} /></button>
            <span>{feedbacks.length ? String(active + 1).padStart(2, "0") : "0"}<span> / {feedbacks.length} kind notes</span></span>
            <button type="button" aria-label="Next featured note" disabled={feedbacks.length < 2} onClick={() => selectNote((active + 1) % feedbacks.length)}><ArrowRight size={14} /></button>
            {!reduceMotion && <button type="button" aria-label={paused ? "Play animations and automatic notes" : "Pause animations and automatic notes"} aria-pressed={paused} className={styles.pauseButton} onClick={() => setPaused((current) => !current)}>{paused ? <Play size={12} /> : <Pause size={12} />}</button>}
          </div>
        </div>
        <div className={styles.heroFooter}><p><span className={styles.desktopHint}>Hover a note. Make my day.</span><span className={styles.mobileHint}>Every little light is a kind word.</span></p><a href="#all-feedback" className={styles.readEvery}>Read every note <ArrowDown size={14} /></a><p>Anonymous notes. Real impact.</p></div>
      </section>
      <section id="all-feedback" className={styles.everyNote} aria-labelledby="feedback-list-title">
        <header className={styles.wheelHeading}><p className={styles.eyebrow}>THE KINDNESS KEEPS GOING</p><h2 id="feedback-list-title">Every note. <span>Every smile.</span></h2><p>Keep scrolling. I could read these all day.</p></header>
        <div className={styles.wheelScene}>
          <div className={styles.wheelCharacter}><div className={styles.compactCharacter}><FameCharacter reaction={wheelReaction.name} reactionKey={wheelReaction.key} compact reduceMotion={animationPaused} /></div><span className={styles.wheelReaction}><Sparkles size={11} />{REACTION_LABELS[wheelReaction.name]}</span></div>
          <FeedbackWheel feedbacks={feedbacks} reduceMotion={reduceMotion} onActiveChange={onWheelChange} />
        </div>
        <p className={styles.closingNote}>To everyone who took a moment to leave a note: thank you.<Heart size={13} aria-hidden="true" /></p>
      </section>
    </main>
  );
}
