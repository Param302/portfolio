"use client";

import { useEffect, useRef } from "react";

/** Tall cards scroll to their bottom before pinning above the mobile nav. */
export default function usePortraitStack() {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined" || !window.CSS?.supports("position", "sticky")) return;
    const portrait = window.matchMedia("(orientation: portrait)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards = [...list.querySelectorAll(":scope > [data-stack-card]")];
    let frame = 0;

    const measure = () => {
      frame = 0;
      if (!portrait.matches || motion.matches) {
        delete list.dataset.stackEnabled;
        return;
      }
      const height = window.visualViewport?.height || window.innerHeight;
      cards.forEach((card, index) => {
        const preferredTop = 88 + index * 10;
        const top = Math.min(preferredTop, height - 96 - card.offsetHeight);
        card.style.setProperty("--portrait-stack-top", `${Math.round(top)}px`);
      });
      list.dataset.stackEnabled = "true";
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    cards.forEach((card) => observer.observe(card));
    portrait.addEventListener("change", schedule);
    motion.addEventListener("change", schedule);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    measure();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      portrait.removeEventListener("change", schedule);
      motion.removeEventListener("change", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      delete list.dataset.stackEnabled;
      cards.forEach((card) => card.style.removeProperty("--portrait-stack-top"));
    };
  }, []);

  return listRef;
}
