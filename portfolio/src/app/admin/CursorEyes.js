"use client";

import { useEffect, useRef } from "react";
import styles from "./CursorEyes.module.css";

const tilt = -8;
const radians = tilt * Math.PI / 180;

export default function CursorEyes() {
  const eyesRef = useRef(null);

  useEffect(() => {
    const eyes = [...eyesRef.current.children];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pointer = null;
    let frame = null;

    function reset() {
      pointer = null;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      eyes.forEach((eye) => {
        eye.style.setProperty("--pupil-x", "0px");
        eye.style.setProperty("--pupil-y", "0px");
      });
    }
    function update() {
      frame = null;
      if (!pointer || reducedMotion.matches) return;
      const offsets = eyes.map((eye) => {
        const bounds = eye.getBoundingClientRect();
        const dx = pointer.x - (bounds.left + bounds.width / 2);
        const dy = pointer.y - (bounds.top + bounds.height / 2);
        // Convert into the tilted eyes' coordinates before bounding the gaze.
        const x = dx * Math.cos(radians) + dy * Math.sin(radians);
        const y = -dx * Math.sin(radians) + dy * Math.cos(radians);
        const distance = Math.max(75, Math.hypot(x, y));
        return { x: x / distance * 4, y: y / distance * 6 };
      });
      eyes.forEach((eye, index) => {
        eye.style.setProperty("--pupil-x", `${offsets[index].x.toFixed(2)}px`);
        eye.style.setProperty("--pupil-y", `${offsets[index].y.toFixed(2)}px`);
      });
    }
    function scheduleUpdate() {
      if (pointer && !reducedMotion.matches && frame === null) frame = requestAnimationFrame(update);
    }
    function follow(event) {
      if (event.pointerType === "touch") { reset(); return; }
      if (reducedMotion.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      scheduleUpdate();
    }

    window.addEventListener("pointermove", follow, { passive: true });
    window.addEventListener("scroll", scheduleUpdate, true);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("blur", reset);
    document.documentElement.addEventListener("pointerleave", reset);
    reducedMotion.addEventListener("change", reset);
    return () => {
      reset();
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("blur", reset);
      document.documentElement.removeEventListener("pointerleave", reset);
      reducedMotion.removeEventListener("change", reset);
    };
  }, []);

  return <span ref={eyesRef} className={styles.eyes} style={{ "--eye-tilt": `${tilt}deg` }} aria-hidden="true"><span /><span /></span>;
}
