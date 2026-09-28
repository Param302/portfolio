"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft } from "lucide-react";
import FeedbackWheel from "./FeedbackWheel";

const NODE_LAYOUTS = [
  { left: "7%", top: "43%" }, { left: "92%", top: "39%" }, { left: "11%", top: "76%" }, { left: "88%", top: "78%" },
  { left: "50%", top: "89%" }, { left: "24%", top: "32%" }, { left: "76%", top: "31%" }, { left: "33%", top: "84%" },
  { left: "67%", top: "88%" }, { left: "3%", top: "61%" }, { left: "97%", top: "60%" }, { left: "20%", top: "91%" },
  { left: "81%", top: "92%" }, { left: "40%", top: "36%" }, { left: "61%", top: "35%" }, { left: "50%", top: "27%" },
];

function movementFor(index) {
  const x = 10 + (index % 5) * 5;
  const y = 8 + (index % 4) * 4;
  const direction = index % 2 === 0 ? 1 : -1;
  return {
    x: [0, direction * x, -direction * (x * 0.7), 0],
    y: [0, -y, y * 0.8, 0],
    rotateX: [0, direction * (4 + index % 8), -direction * 3, 0],
    rotateY: [0, -direction * (7 + index % 10), direction * 5, 0],
    rotateZ: [index % 2 ? -3 : 3, index % 2 ? 4 : -4, index % 2 ? -3 : 3],
  };
}

function FeedbackNode({ quote, index, hovered, onHover, reduceMotion }) {
  const layout = NODE_LAYOUTS[index];
  const isHovered = hovered === index;
  const isMuted = hovered !== null && !isHovered;
  const mobileVisibility = index >= 8 ? "hidden lg:block" : index >= 5 ? "hidden sm:block" : "block";

  return (
    <div className={`absolute -translate-x-1/2 -translate-y-1/2 ${mobileVisibility}`} style={{ left: layout.left, top: layout.top, perspective: "700px" }}>
      <motion.button
        type="button"
        animate={reduceMotion ? undefined : movementFor(index)}
        transition={reduceMotion ? undefined : { duration: 11 + (index % 6) * 1.7, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, delay: -(index % 7) * 1.2 }}
        whileHover={reduceMotion ? undefined : { scale: 1.08, z: 38 }}
        whileFocus={reduceMotion ? undefined : { scale: 1.08, z: 38 }}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(index)}
        onBlur={() => onHover(null)}
        onClick={() => onHover(index)}
        aria-label={`Focus feedback: ${quote}`}
        className={`w-32 rounded-2xl border px-3.5 py-3 text-left font-description text-[0.68rem] leading-4 text-bright-snow transition-[filter,opacity,border-color,background-color] duration-300 sm:w-44 sm:px-4 sm:text-xs sm:leading-5 ${isHovered ? "z-30 border-sky-surge bg-sky-surge/18 opacity-100" : "border-bright-snow/16 bg-ink-black/72"} ${isMuted ? "blur-[3px] opacity-20" : "opacity-80 hover:opacity-100"}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className="line-clamp-3">“{quote}”</span>
      </motion.button>
    </div>
  );
}

export default function WallOfFameClient({ feedbacks }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);
  const visibleNodes = feedbacks.slice(0, Math.min(NODE_LAYOUTS.length, feedbacks.length));
  const displayedIndex = hovered ?? active;
  const displayedQuote = feedbacks[displayedIndex] || "Thank you for learning with me.";

  useEffect(() => {
    if (reduceMotion || feedbacks.length < 2 || hovered !== null) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1 + Math.floor(Math.random() * (feedbacks.length - 1))) % feedbacks.length), 4200);
    return () => window.clearInterval(timer);
  }, [feedbacks.length, hovered, reduceMotion]);

  function focusNode(index) {
    setHovered(index);
    if (index !== null) setActive(index);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-papaya-whip pb-20 text-prussian-blue">
      <section className="relative min-h-[760px] overflow-hidden bg-prussian-blue px-4 pb-14 pt-6 text-bright-snow sm:px-6 lg:min-h-screen lg:px-8">
        <div className="relative z-50 mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-bright-snow/14 bg-bright-snow/10 px-3 py-2 font-heading text-sm font-semibold backdrop-blur transition hover:border-sky-surge">
            <Image src="/parampreet.png" alt="Parampreet Singh" width={34} height={34} className="h-8 w-8 rounded-full object-cover" />
            <span>Parampreet Singh</span>
          </Link>
          <Link href="/#community" className="inline-flex items-center gap-2 rounded-full border border-bright-snow/14 bg-bright-snow/10 px-4 py-3 font-heading text-sm font-semibold backdrop-blur transition hover:border-sky-surge"><ArrowLeft className="h-4 w-4" />Community</Link>
        </div>

        <header className="relative z-40 mx-auto mt-10 max-w-4xl text-center">
          <p className="font-heading text-xs uppercase tracking-[0.32em] text-bright-snow/55">Teaching impact</p>
          <h1 className="mt-3 font-accent text-6xl font-bold italic sm:text-7xl lg:text-8xl">Wall of Fame</h1>
          <p className="mx-auto mt-4 max-w-2xl font-description text-sm leading-7 text-bright-snow/68 sm:text-base">Anonymous notes from live sessions, revision marathons, and mentoring.</p>
        </header>

        <div className="absolute inset-x-0 bottom-0 top-36 z-10" aria-label="Floating learner feedback">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(27,182,224,0.18),transparent_43%)]" />
          {visibleNodes.map((quote, index) => <FeedbackNode key={`${index}-${quote}`} quote={quote} index={index} hovered={hovered} onHover={focusNode} reduceMotion={reduceMotion} />)}
        </div>

        <div className="absolute left-1/2 top-[59%] z-30 w-[min(88vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-bright-snow/14 bg-ink-black/90 p-6 text-center backdrop-blur sm:p-9">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={displayedIndex} initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: reduceMotion ? 0 : 0.42 }} className="font-accent text-xl italic leading-8 sm:text-2xl sm:leading-9">“{displayedQuote}”</motion.p>
          </AnimatePresence>
        </div>

        <a href="#all-feedback" className="absolute bottom-7 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-bright-snow/15 bg-bright-snow/10 px-4 py-2 font-heading text-xs font-semibold text-bright-snow transition hover:border-sky-surge"><ArrowDown className="h-4 w-4" />Read every note</a>
      </section>

      <section id="all-feedback" className="mx-auto mt-16 max-w-5xl scroll-mt-8 px-4 sm:px-6 lg:px-8" aria-labelledby="feedback-list-title">
        <div className="text-center">
          <h2 id="feedback-list-title" className="font-accent text-5xl font-bold italic sm:text-6xl">Every note</h2>
          <p className="mx-auto mt-3 max-w-xl font-description text-sm leading-7 opacity-65">Scroll slowly. The note in focus comes forward, like turning a digital crown.</p>
        </div>
        <div className="mt-8 rounded-[2.2rem] border border-prussian-blue/10 bg-bright-snow/55 px-2 sm:px-5">
          <FeedbackWheel feedbacks={feedbacks} reduceMotion={reduceMotion} />
        </div>
      </section>
    </main>
  );
}
