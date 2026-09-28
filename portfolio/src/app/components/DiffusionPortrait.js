"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./DiffusionPortrait.module.css";

const REVEAL_DURATION = 650;
const SAMPLE_WIDTH = 260;

/** Fine grain resolves into the photo; the original image stays underneath. */
export default function DiffusionPortrait({ backgroundColor = "#f8fafc", enabled = true, active = true, startDelay = 0 }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const portrait = imageRef.current;
    const canvas = canvasRef.current;
    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!enabled || !active || !container || !portrait || !canvas || motion?.matches || navigator.connection?.saveData || !window.IntersectionObserver) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    let source;
    let sample;
    let sampleContext;
    let output;
    let frame = 0;
    let delayTimer;
    let safetyTimer;
    let startedAt = null;
    let lastPaint = -Infinity;
    let ready = false;
    let inView = false;
    let finished = false;

    const finish = () => {
      finished = true;
      cancelAnimationFrame(frame);
      clearTimeout(delayTimer);
      clearTimeout(safetyTimer);
      container.dataset.reveal = "complete";
    };

    const paint = (progress) => {
      const ease = progress * progress * (3 - 2 * progress);
      const noise = Math.pow(1 - progress, 1.65);
      const signal = Math.sqrt(1 - noise * noise);
      const detail = 0.1 + 0.9 * ease;
      sample.width = Math.max(16, Math.round(canvas.width * detail));
      sample.height = Math.max(16, Math.round(canvas.height * detail));
      sampleContext.drawImage(source, 0, 0, sample.width, sample.height);
      context.imageSmoothingEnabled = true;
      context.drawImage(sample, 0, 0, canvas.width, canvas.height);
      const clean = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const pixels = output.data;
      for (let index = 0; index < pixels.length; index += 4) {
        // Same triangular grain distribution as the first version, at less
        // than half its contrast. No blur filter or zoom over the photo.
        const grain = (Math.random() + Math.random() - 1) * 85 * noise;
        pixels[index] = clean[index] * signal + 128 * (1 - signal) + grain;
        pixels[index + 1] = clean[index + 1] * signal + 128 * (1 - signal) + grain;
        pixels[index + 2] = clean[index + 2] * signal + 132 * (1 - signal) + grain;
        pixels[index + 3] = 255;
      }
      context.putImageData(output, 0, 0);
    };

    const animate = (now) => {
      if (finished) return;
      if (startedAt === null) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / REVEAL_DURATION);
      if (progress === 1) { finish(); return; }
      // Keep pixel work near 30fps, independent of screen refresh rate/DPR.
      if (now - lastPaint >= 32) { paint(progress); lastPaint = now; }
      frame = requestAnimationFrame(animate);
    };

    const begin = () => {
      if (!ready || !inView || finished || frame || delayTimer) return;
      // The reveal starts as the photo side turns into view, not behind it.
      delayTimer = window.setTimeout(() => {
        delayTimer = null;
        if (finished) return;
        try { paint(0); } catch { finish(); return; }
        container.dataset.reveal = "playing";
        safetyTimer = window.setTimeout(finish, REVEAL_DURATION + 200);
        frame = requestAnimationFrame(animate);
      }, startDelay);
    };

    const setup = () => {
      if (ready || finished || !portrait.naturalWidth) return;
      try {
        canvas.width = SAMPLE_WIDTH;
        canvas.height = Math.round(SAMPLE_WIDTH * portrait.naturalHeight / portrait.naturalWidth);
        source = document.createElement("canvas");
        source.width = canvas.width;
        source.height = canvas.height;
        sample = document.createElement("canvas");
        sampleContext = sample.getContext("2d", { alpha: false });
        const sourceContext = source.getContext("2d", { alpha: false });
        if (!sampleContext || !sourceContext) { finish(); return; }
        sourceContext.fillStyle = backgroundColor;
        sourceContext.fillRect(0, 0, source.width, source.height);
        sourceContext.drawImage(portrait, 0, 0, source.width, source.height);
        sourceContext.getImageData(0, 0, 1, 1);
        output = context.createImageData(canvas.width, canvas.height);
        ready = true;
        begin();
      } catch { finish(); }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      if (inView) begin();
      else if (frame || delayTimer) finish();
    }, { threshold: 0.15 });
    const onMotion = () => { if (motion.matches) finish(); };
    const onVisibility = () => { if (document.hidden) finish(); };
    portrait.addEventListener("load", setup);
    portrait.addEventListener("error", finish);
    motion?.addEventListener?.("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    observer.observe(container);
    if (portrait.complete && portrait.naturalWidth) setup();

    return () => {
      finish();
      observer.disconnect();
      portrait.removeEventListener("load", setup);
      portrait.removeEventListener("error", finish);
      motion?.removeEventListener?.("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      delete container.dataset.reveal;
    };
  }, [backgroundColor, enabled, active, startDelay]);

  return (
    <div ref={containerRef} className={styles.portrait}>
      <Image ref={imageRef} src="/parampreet_singh.png" alt="Portrait of Parampreet Singh" width={720} height={880} sizes="(max-width: 640px) 85vw, (max-width: 1024px) 448px, 38vw" className="h-full w-full object-cover" />
      <canvas ref={canvasRef} aria-hidden="true" className={styles.noise} />
    </div>
  );
}
