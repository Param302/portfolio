"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { BriefcaseBusiness, MailPlus } from "lucide-react";
import { useTheme } from "@/app/ThemeContext";

const phrases = [
  "You're looking for :)",
  "Who finetunes SLMs!",
  "Builds Agentic Workflows.",
  "Builds Full-Stack Apps.",
  "Who ships AI Apps Fast!",
];

const phraseTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
};

const gridBackground = {
  backgroundImage: `
    linear-gradient(to right, rgba(255, 237, 212, 0.37) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 237, 212, 0.37) 1px, transparent 1px)
  `,
  backgroundSize: "48px 48px",
  backgroundPosition: "center center",
};

export default function HeroSection() {
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [interactiveGrid, setInteractiveGrid] = useState(false);
  const cursorX = useMotionValue(-320);
  const cursorY = useMotionValue(-320);
  const smoothX = useSpring(cursorX, { stiffness: 180, damping: 26, mass: 0.2 });
  const smoothY = useSpring(cursorY, { stiffness: 180, damping: 26, mass: 0.2 });
  const maskImage = useMotionTemplate`radial-gradient(250px circle at ${smoothX}px ${smoothY}px, transparent 0%, transparent 36%, black 72%)`;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % phrases.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    const syncInteractivity = (event) => {
      const matches = typeof event === "boolean" ? event : event.matches;
      setInteractiveGrid(matches);

      if (!matches) {
        cursorX.set(-320);
        cursorY.set(-320);
      }
    };

    syncInteractivity(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncInteractivity);
    } else {
      mediaQuery.addListener(syncInteractivity);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", syncInteractivity);
      } else {
        mediaQuery.removeListener(syncInteractivity);
      }
    };
  }, [cursorX, cursorY]);

  const handlePointerMove = (event) => {
    if (!interactiveGrid || !sectionRef.current) {
      return;
    }

    const bounds = sectionRef.current.getBoundingClientRect();
    cursorX.set(event.clientX - bounds.left);
    cursorY.set(event.clientY - bounds.top);
  };

  const handlePointerLeave = () => {
    if (!interactiveGrid) {
      return;
    }

    cursorX.set(-320);
    cursorY.set(-320);
  };

  const gridStyle = useMemo(
    () =>
      interactiveGrid
        ? {
          ...gridBackground,
          WebkitMaskImage: maskImage,
          maskImage,
        }
        : gridBackground,
    [interactiveGrid, maskImage],
  );

  const isDarkTheme = theme === "dark";
  const desktopVideoSrc = isDarkTheme ? "/bowl_breathing_dark.mp4" : "/bowl_breathing.mp4";
  const mobileVideoSrc = isDarkTheme ? "/bowl_breathing_mobile_dark.mp4" : "/bowl_breathing_mobile.mp4";

  const handleVideoError = (event) => {
    const videoElement = event.currentTarget;
    const fallbackSrc = videoElement.dataset.fallbackSrc;
    const hasAppliedFallback = videoElement.dataset.fallbackApplied === "true";

    if (!fallbackSrc || hasAppliedFallback) {
      return;
    }

    videoElement.dataset.fallbackApplied = "true";
    videoElement.src = fallbackSrc;
    videoElement.load();

    const playPromise = videoElement.play();
    if (playPromise?.catch) {
      playPromise.catch(() => { });
    }
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="section-anchor relative isolate flex min-h-screen items-center overflow-hidden"
    >
      {/* <div className="absolute inset-0 -z-30 bg-ink-black" /> */}

      <video
        key={`desktop-${theme}`}
        src={desktopVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        data-fallback-src="/bowl_breathing.mp4"
        onError={handleVideoError}
        className="absolute inset-0 -z-20 hidden h-full w-full object-cover sm:block"
        aria-hidden="true"
      />

      <video
        key={`mobile-${theme}`}
        src={mobileVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        data-fallback-src="/bowl_breathing_mobile.mp4"
        onError={handleVideoError}
        className="absolute inset-0 -z-20 h-full w-full object-cover sm:hidden"
        aria-hidden="true"
      />

      <div className={`absolute inset-0 -z-10 bg-gradient-to-b to-sky-surge ${isDarkTheme ? 'from-ink-black/35 via-ink-black/30' : 'from-papaya-whip/35 via-papaya-whip/30'}`} />

      {!isDarkTheme ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-90 hidden"
          style={gridStyle}
        />
      ) : null}

      <div className="relative mx-auto flex w-full max-w-7xl justify-center px-4 py-28 sm:px-6 sm:py-32 lg:px-8">
        <div className="flex max-w-4xl flex-col items-center text-center">
          {/* <div className="glass-card border-sky-surge inline-flex items-center gap-3 rounded-full px-2 pr-4 py-2 text-sm sm:px-5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-surge/15 text-sky-surge">
              <Sparkle className="h-4 w-4" />
            </span>
            <span className="font-description font-medium text-sky-surge">Hey, Param this side</span>
          </div> */}

          <h1 className="mt-6 sm:mt-14 text-5xl font-medium leading-tight tracking-tighter text-ink-black dark:text-bright-snow sm:text-5xl lg:text-7xl">
            I&apos;m the
            <br className="inline sm:hidden" />
            <span
              className="px-6 font-accent italic font-semibold text-papaya-whip tracking-normal"
              style={{ WebkitTextStroke: "5px #0B0F19", paintOrder: "stroke fill" }}
            >
              AI Engineer
            </span>
          </h1>

          <div className="flex min-h-[4.5rem] items-center overflow-hidden sm:min-h-[5.75rem] lg:min-h-[6.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={phrases[phraseIndex]}
                initial={{ y: 52, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -52, opacity: 0 }}
                transition={phraseTransition}
                className="font-accent text-4xl font-semibold text-prussian-blue dark:text-bright-snow sm:text-5xl lg:text-6xl"
              >
                {phrases[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="mt-6 max-w-[60ch] px-10 font-description text-md leading-7 text-prussian-blue/60 dark:text-alice-blue sm:text-base lg:text-lg">
            Building the bridge between humans and AI.
            I help people build their dream AI applications, be it - <span className="font-bold">classical</span>, <span className="font-bold">Agentic</span> or <span className="font-bold">fine-tuned</span> workflows with End-to-End deployment.
          </p>

          <div className="mt-6 flex flex-col items-center gap-5 sm:mt-14 sm:flex-row sm:gap-8">
            <a
              href="#work"
              className="group inline-flex min-w-52 items-center justify-center gap-2 rounded-full border-4 border-ink-black/85 bg-sky-surge px-8 py-4 font-description text-lg font-bold text-ink-black shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <BriefcaseBusiness className="h-5 w-5 transition group-hover:rotate-[-6deg]" />
              View Work
            </a>
            <a
              href="#contact"
              className="group inline-flex min-w-52 items-center justify-center gap-2 rounded-full border-4 border-prussian-blue/80 bg-papaya-whip px-8 py-4 font-description text-lg font-bold text-prussian-blue shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <MailPlus className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Reach Out
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
