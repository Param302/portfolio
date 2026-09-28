"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "@/app/ThemeContext";
import { useHomeIntro } from "./HomeIntro";
import HeroActions from "./HeroActions";
import HeroAccent from "./HeroAccent";

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

export default function HeroSection({ headline = "AI Engineer", summary }) {
  const { theme, mounted } = useTheme();
  const intro = useHomeIntro();
  const introPhase = intro?.phase || "complete";
  const sectionRef = useRef(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [interactiveGrid, setInteractiveGrid] = useState(false);
  const cursorX = useMotionValue(-320);
  const cursorY = useMotionValue(-320);
  const smoothX = useSpring(cursorX, { stiffness: 180, damping: 26, mass: 0.2 });
  const smoothY = useSpring(cursorY, { stiffness: 180, damping: 26, mass: 0.2 });
  const maskImage = useMotionTemplate`radial-gradient(250px circle at ${smoothX}px ${smoothY}px, transparent 0%, transparent 36%, black 72%)`;

  useEffect(() => {
    if (introPhase === "greeting") return;
    const interval = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % phrases.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [introPhase]);

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
      className="section-anchor relative isolate flex min-h-screen items-center overflow-hidden bg-bright-snow dark:bg-ink-black"
    >
      {/* <div className="absolute inset-0 -z-30 bg-ink-black" /> */}

      {mounted ? <>
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
      </> : null}

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-papaya-whip/35 via-papaya-whip/30 to-sky-surge dark:from-ink-black/35 dark:via-ink-black/30" />

      {!isDarkTheme ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-90 hidden"
          style={gridStyle}
        />
      ) : null}

      <div className="relative mx-auto flex w-full max-w-7xl justify-center px-4 pb-28 pt-16 sm:px-6 sm:py-32 lg:px-8">
        <div data-intro-content className="flex max-w-4xl flex-col items-center pt-8 text-center sm:pt-12">
          {/* <div className="glass-card border-sky-surge inline-flex items-center gap-3 rounded-full px-2 pr-4 py-2 text-sm sm:px-5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-surge/15 text-sky-surge">
              <Sparkle className="h-4 w-4" />
            </span>
            <span className="font-description font-medium text-sky-surge">Hey, Param this side</span>
          </div> */}

          <h1 data-intro-reveal className="mt-6 sm:mt-14 text-5xl font-medium leading-tight tracking-tighter text-ink-black dark:text-bright-snow sm:text-5xl lg:text-7xl">
            I&apos;m the
            <br className="inline sm:hidden" />
            <HeroAccent>{headline}</HeroAccent>
          </h1>

          <div data-intro-reveal style={{ "--intro-delay": "90ms" }} className="flex min-h-[4.5rem] items-center overflow-hidden sm:min-h-[5.75rem] lg:min-h-[6.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={phrases[phraseIndex]}
                initial={introPhase === "greeting" ? false : { y: 52, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -52, opacity: 0 }}
                transition={phraseTransition}
                className="font-accent text-4xl font-semibold text-prussian-blue dark:text-bright-snow sm:text-5xl lg:text-6xl"
              >
                {phrases[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p data-intro-reveal style={{ "--intro-delay": "240ms" }} className="mt-6 max-w-[60ch] px-10 font-description text-md leading-7 text-prussian-blue/60 dark:text-alice-blue sm:text-base lg:text-lg">
            {summary || <>Building the bridge between humans and AI. I help people build their dream AI applications, from <span className="font-bold">classical</span> and <span className="font-bold">agentic</span> systems to <span className="font-bold">fine-tuned</span> workflows.</>}
          </p>

          <HeroActions data-intro-actions className="relative z-[111] mt-6 sm:mt-14" />
        </div>
      </div>
    </section>
  );
}
