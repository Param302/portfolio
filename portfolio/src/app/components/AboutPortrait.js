"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import FameCharacter from "@/app/walloffame/FameCharacter";
import DiffusionPortrait from "./DiffusionPortrait";
import styles from "./AboutPortrait.module.css";

const ABOUT_BLINK_INTERVAL = [1.55, 2.95];

export default function AboutPortrait({ backgroundColor, frameColor }) {
  const [canEnhance, setCanEnhance] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    // Keep the photo as initial HTML while the compatible avatar loads in the
    // background, before the visitor reaches this section.
    setCanEnhance(Boolean(window.CSS?.supports("perspective", "1000px") && window.CSS.supports("backface-visibility", "hidden") && window.CSS.supports("transform-style", "preserve-3d")));
  }, []);

  const handleReady = useCallback((next) => {
    setReady(next);
    if (!next) { setShowPhoto(false); setFlipping(false); }
  }, []);

  useEffect(() => {
    if (!flipping) return;
    const timer = window.setTimeout(() => setFlipping(false), 600);
    return () => window.clearTimeout(timer);
  }, [flipping]);

  const flip = () => {
    if (!ready || flipping) return;
    setShowPhoto((current) => !current);
    setFlipping(true);
  };

  return (
    <div
      className={styles.card}
      data-about-portrait
      data-animated={ready}
      data-side={ready && !showPhoto ? "avatar" : "photo"}
      style={{ "--portrait-background": backgroundColor, "--portrait-frame": frameColor }}
    >
      <div className={styles.rotor}>
        <div className={`${styles.face} ${styles.front}`} aria-hidden={!ready || showPhoto}>
          <div className={styles.surface}>
            {canEnhance && <FameCharacter background fallback="none" paused={showPhoto} blinkInterval={ABOUT_BLINK_INTERVAL} onReadyChange={handleReady} />}
          </div>
        </div>
        <div className={`${styles.face} ${styles.back}`} aria-hidden={ready && !showPhoto}>
          <div className={styles.surface}>
            <DiffusionPortrait backgroundColor={backgroundColor} enabled={ready} active={showPhoto} startDelay={300} />
          </div>
        </div>
      </div>
      {ready && (
        <button
          type="button"
          className={styles.flipTarget}
          onClick={flip}
          aria-label={showPhoto ? "Show animated avatar" : "Show real photo"}
          aria-disabled={flipping}
          title={showPhoto ? "Click to flip back to the avatar" : "Click to flip to the photo"}
        >
          <span className={styles.hint} aria-hidden="true"><RefreshCcw /></span>
        </button>
      )}
    </div>
  );
}
