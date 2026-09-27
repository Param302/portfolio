"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./DiffusionPortrait.module.css";

const REVEAL_DURATION = 2150;
const SAMPLE_WIDTH = 220;

/** A lightweight visual analogy for denoising, not an in-browser diffusion model. */
export default function DiffusionPortrait({ backgroundColor }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const portrait = imageRef.current;
    const canvas = canvasRef.current;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!container || !portrait || !canvas || motionPreference.matches || revealedRef.current) {
      return undefined;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context || !window.IntersectionObserver) return undefined;

    let frameId = 0;
    let startedAt = null;
    let lastFrameAt = 0;
    let inView = false;
    let ready = false;
    let finished = false;
    let loadTimeout;
    let source;
    let sample;
    let sampleContext;
    let pixels;
    let frame;

    const finish = () => {
      finished = true;
      revealedRef.current = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(loadTimeout);
      container.dataset.reveal = "complete";
    };

    // Limit the raster work to roughly 50k pixels, independent of display DPR.
    const setup = () => {
      if (finished || ready || !portrait.naturalWidth) return;

      try {
        canvas.width = SAMPLE_WIDTH;
        canvas.height = Math.round(SAMPLE_WIDTH * portrait.naturalHeight / portrait.naturalWidth);
        source = document.createElement("canvas");
        source.width = canvas.width;
        source.height = canvas.height;
        const sourceContext = source.getContext("2d", { alpha: false });
        sample = document.createElement("canvas");
        sampleContext = sample.getContext("2d", { alpha: false });
        if (!sourceContext || !sampleContext) return finish();

        sourceContext.fillStyle = backgroundColor;
        sourceContext.fillRect(0, 0, source.width, source.height);
        sourceContext.drawImage(portrait, 0, 0, source.width, source.height);
        // Reading once here also checks that the source is safe to sample.
        sourceContext.getImageData(0, 0, 1, 1);
        frame = context.createImageData(canvas.width, canvas.height);
        pixels = frame.data;
        paint(0);
        ready = true;
        container.dataset.reveal = "ready";
        begin();
      } catch {
        // The real image always remains underneath, including canvas failures.
        finish();
      }
    };

    const paint = (progress) => {
      const ease = progress * progress * (3 - 2 * progress);
      const noise = Math.pow(1 - progress, 1.65);
      const signal = Math.sqrt(1 - noise * noise);
      const detail = 0.06 + 0.94 * ease;
      sample.width = Math.max(12, Math.round(canvas.width * detail));
      sample.height = Math.max(12, Math.round(canvas.height * detail));
      sampleContext.drawImage(source, 0, 0, sample.width, sample.height);
      context.imageSmoothingEnabled = true;
      context.drawImage(sample, 0, 0, canvas.width, canvas.height);
      const clean = context.getImageData(0, 0, canvas.width, canvas.height).data;

      for (let index = 0; index < pixels.length; index += 4) {
        const grain = (Math.random() + Math.random() - 1) * 190 * noise;
        pixels[index] = clean[index] * signal + 128 * (1 - signal) + grain;
        pixels[index + 1] = clean[index + 1] * signal + 128 * (1 - signal) + grain;
        pixels[index + 2] = clean[index + 2] * signal + 132 * (1 - signal) + grain;
        pixels[index + 3] = 255;
      }

      context.putImageData(frame, 0, 0);
    };

    const animate = (now) => {
      if (finished) return;
      if (startedAt === null) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / REVEAL_DURATION);

      if (progress === 1) {
        finish();
        return;
      }
      if (now - lastFrameAt > 32) {
        paint(progress);
        lastFrameAt = now;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    function begin() {
      if (!ready || !inView || startedAt !== null || frameId || finished) return;
      window.clearTimeout(loadTimeout);
      container.dataset.reveal = "playing";
      frameId = window.requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      if (inView) {
        begin();
        // Do not leave a noise placeholder on a slow or failed image request.
        if (!ready && !loadTimeout) loadTimeout = window.setTimeout(finish, 2500);
      } else if (startedAt !== null) {
        finish();
      }
    }, { threshold: 0.25 });

    const handleMotionChange = () => {
      if (motionPreference.matches) finish();
    };
    const handleVisibilityChange = () => {
      if (document.hidden && startedAt !== null) finish();
    };

    portrait.addEventListener("load", setup, { once: true });
    portrait.addEventListener("error", finish, { once: true });
    motionPreference.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    observer.observe(container);
    if (portrait.complete && portrait.naturalWidth) setup();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(loadTimeout);
      observer.disconnect();
      portrait.removeEventListener("load", setup);
      portrait.removeEventListener("error", finish);
      motionPreference.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // React's development effect replay must not leave an orphaned overlay.
      delete container.dataset.reveal;
    };
  }, [backgroundColor]);

  return (
    <div ref={containerRef} className={styles.portrait}>
      <Image
        ref={imageRef}
        src="/parampreet_singh.png"
        alt="Portrait of Parampreet Singh"
        width={720}
        height={880}
        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 448px, 38vw"
        className="h-full w-full object-cover"
      />
      <canvas ref={canvasRef} aria-hidden="true" className={styles.noise} />
    </div>
  );
}
