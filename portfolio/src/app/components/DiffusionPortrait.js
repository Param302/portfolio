"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./DiffusionPortrait.module.css";

const REVEAL_DURATION = 2200;
const SAMPLE_WIDTH = 260;

/** A lightweight diffusion-inspired reveal, not an in-browser model. */
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

    const source = document.createElement("canvas");
    const sourceContext = source.getContext("2d", { alpha: false, willReadFrequently: true });
    if (!sourceContext) return undefined;

    const color = typeof backgroundColor === "string" && /^#[0-9a-f]{6}$/i.test(backgroundColor)
      ? [1, 3, 5].map((offset) => Number.parseInt(backgroundColor.slice(offset, offset + 2), 16))
      : [248, 250, 252];
    let sourcePixels;
    let ready = false;
    let inView = false;
    let frame;
    let startedAt;

    const finish = () => {
      cancelAnimationFrame(frame);
      revealedRef.current = true;
      container.dataset.reveal = "complete";
    };

    const paint = (progress) => {
      const eased = progress * progress * (3 - 2 * progress);
      const noise = Math.pow(1 - eased, 1.85);
      const signal = Math.sqrt(eased);
      const width = canvas.width;
      const height = canvas.height;
      const imageData = context.createImageData(width, height);
      const output = imageData.data;

      for (let index = 0; index < output.length; index += 4) {
        const smoothRandom = Math.random() + Math.random() + Math.random() + Math.random() - 2;
        const grain = smoothRandom * 32 * noise;
        output[index] = color[0] * (1 - signal) + sourcePixels[index] * signal + grain;
        output[index + 1] = color[1] * (1 - signal) + sourcePixels[index + 1] * signal + grain;
        output[index + 2] = color[2] * (1 - signal) + sourcePixels[index + 2] * signal + grain;
        output[index + 3] = 255;
      }

      context.putImageData(imageData, 0, 0);
      container.style.setProperty("--diffusion-blur", `${(1 - eased) * 5}px`);
      container.style.setProperty("--diffusion-scale", `${1 + (1 - eased) * 0.018}`);
    };

    const animate = (timestamp) => {
      if (!startedAt) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / REVEAL_DURATION, 1);
      paint(progress);
      if (progress < 1) frame = requestAnimationFrame(animate);
      else finish();
    };

    const begin = () => {
      if (!ready || !inView || container.dataset.reveal === "playing") return;
      container.dataset.reveal = "playing";
      frame = requestAnimationFrame(animate);
    };

    const setup = () => {
      if (ready || !portrait.naturalWidth) return;
      try {
        const height = Math.round(SAMPLE_WIDTH * portrait.naturalHeight / portrait.naturalWidth);
        source.width = SAMPLE_WIDTH;
        source.height = height;
        canvas.width = SAMPLE_WIDTH;
        canvas.height = height;
        sourceContext.imageSmoothingEnabled = true;
        sourceContext.imageSmoothingQuality = "high";
        sourceContext.drawImage(portrait, 0, 0, SAMPLE_WIDTH, height);
        sourcePixels = sourceContext.getImageData(0, 0, SAMPLE_WIDTH, height).data;
        ready = true;
        paint(0);
        container.dataset.reveal = "ready";
        begin();
      } catch {
        finish();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.22;
      begin();
    }, { threshold: 0.22 });

    const handleMotionChange = () => { if (reduceMotion.matches) finish(); };
    portrait.addEventListener("load", setup, { once: true });
    portrait.addEventListener("error", finish, { once: true });
    reduceMotion.addEventListener("change", handleMotionChange);
    observer.observe(container);
    if (portrait.complete && portrait.naturalWidth) setup();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      portrait.removeEventListener("load", setup);
      portrait.removeEventListener("error", finish);
      reduceMotion.removeEventListener("change", handleMotionChange);
      container.style.removeProperty("--diffusion-blur");
      container.style.removeProperty("--diffusion-scale");
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
