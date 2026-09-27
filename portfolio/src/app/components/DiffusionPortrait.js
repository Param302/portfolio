"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./DiffusionPortrait.module.css";

const SAMPLE_WIDTH = 540;

/** A lightweight blur-to-detail diffusion analogy, not an in-browser model. */
export default function DiffusionPortrait({ backgroundColor }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const portrait = imageRef.current;
    const canvas = canvasRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!container || !portrait || !canvas || reduceMotion.matches || revealedRef.current) return undefined;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context || !window.IntersectionObserver) return undefined;
    let ready = false;
    let finished = false;
    let inView = false;
    let fallbackTimer;

    const finish = () => {
      if (finished) return;
      finished = true;
      revealedRef.current = true;
      window.clearTimeout(fallbackTimer);
      container.dataset.reveal = "complete";
    };

    const setup = () => {
      if (ready || finished || !portrait.naturalWidth) return;
      try {
        canvas.width = SAMPLE_WIDTH;
        canvas.height = Math.round(SAMPLE_WIDTH * portrait.naturalHeight / portrait.naturalWidth);
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(portrait, 0, 0, canvas.width, canvas.height);
        ready = true;
        container.dataset.reveal = "ready";
        if (inView) begin();
      } catch {
        finish();
      }
    };

    const begin = () => {
      if (!ready || finished || container.dataset.reveal === "playing") return;
      container.dataset.reveal = "playing";
      fallbackTimer = window.setTimeout(finish, 2400);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      if (inView) begin();
    }, { threshold: 0.25 });

    const handleMotionChange = () => { if (reduceMotion.matches) finish(); };
    const handleAnimationEnd = (event) => { if (event.target === canvas) finish(); };
    portrait.addEventListener("load", setup, { once: true });
    portrait.addEventListener("error", finish, { once: true });
    canvas.addEventListener("animationend", handleAnimationEnd);
    reduceMotion.addEventListener("change", handleMotionChange);
    observer.observe(container);
    if (portrait.complete && portrait.naturalWidth) setup();

    return () => {
      window.clearTimeout(fallbackTimer);
      observer.disconnect();
      portrait.removeEventListener("load", setup);
      portrait.removeEventListener("error", finish);
      canvas.removeEventListener("animationend", handleAnimationEnd);
      reduceMotion.removeEventListener("change", handleMotionChange);
      delete container.dataset.reveal;
    };
  }, [backgroundColor]);

  return (
    <div ref={containerRef} className={styles.portrait}>
      <Image ref={imageRef} src="/parampreet_singh.png" alt="Portrait of Parampreet Singh" width={720} height={880} sizes="(max-width: 640px) 85vw, (max-width: 1024px) 448px, 38vw" className="h-full w-full object-cover" />
      <canvas ref={canvasRef} aria-hidden="true" className={styles.noise} />
    </div>
  );
}
