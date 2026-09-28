"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AVATAR_BACKGROUND_BUDGET_MS, beginAvatarEnhancement, probeAvatarSupport } from "./avatar-enhancement.mjs";
import { avatarPlaceholderDataUrl, chipPlaceholderDataUrl } from "./avatar-placeholder";
import styles from "./FameCharacter.module.css";

export default function FameCharacter({ reaction = "idle", reactionKey = 0, compact = false, reduceMotion = false, paused = false, eager = false, background = false, fallback = "portrait", className = "", onReadyChange }) {
  const host = useRef(null);
  const scene = useRef(null);
  const currentReaction = useRef({ reaction, reactionKey });
  const motionPreference = useRef(reduceMotion);
  const pausedPreference = useRef(paused);
  const readyCallback = useRef(onReadyChange);
  const [ready, setReady] = useState(false);
  const [portraitLoaded, setPortraitLoaded] = useState(false);
  const [loadState, setLoadState] = useState("pending");
  const useChipFallback = fallback === "chip";

  useEffect(() => { readyCallback.current = onReadyChange; }, [onReadyChange]);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    let enhancement;
    let probe;
    let observer;
    let idleTask;
    let backgroundTimer;
    let retryTimer;
    let supportRetries = background ? 1 : 0;
    const element = host.current;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const publishReady = (isReady) => {
      if (cancelled) return;
      setReady(isReady);
      readyCallback.current?.(isReady);
    };

    function loadScene() {
      if (started || cancelled || !element) return;
      started = true;
      const startedAt = performance.now();
      probe = probeAvatarSupport({ window, document, navigator, reduceMotion });
      if (!probe.supported) {
        // A context can be temporarily unavailable while the intro releases
        // its GPU resources. About gets one later probe, never a scroll loop.
        if (probe.reason === "unsupported" && supportRetries > 0) {
          supportRetries--;
          started = false;
          setLoadState("waiting");
          retryTimer = window.setTimeout(loadScene, 2500);
        } else setLoadState(probe.reason);
        return;
      }
      setLoadState("loading");
      enhancement = beginAvatarEnhancement({
        startedAt,
        ...(background ? { timeoutMs: AVATAR_BACKGROUND_BUDGET_MS } : {}),
        load: () => import("./fame-character-reference-scene"),
        create: async ({ createFameCharacter }, lifecycle) => {
          const instance = await createFameCharacter(element, {
            ...lifecycle,
            canvas: probe.canvas,
            context: probe.context,
            reaction: currentReaction.current.reaction,
            reduceMotion: motionPreference.current,
            onReadyChange: (isReady) => {
              // Initialization is promoted only after the deadline gate accepts
              // its first frame. Later context changes can toggle fallback.
              if (enhancement?.state === "ready") publishReady(isReady);
            },
          });
          try {
            lifecycle.checkpoint();
            instance.setReducedMotion(motionPreference.current);
            instance.setReaction(currentReaction.current.reaction);
            instance.setPaused(pausedPreference.current);
            lifecycle.checkpoint();
            return instance;
          } catch (error) { instance.dispose(); throw error; }
        },
        onReady: (instance) => {
          if (cancelled) { instance.dispose(); return; }
          scene.current = instance;
          setLoadState("ready");
          publishReady(true);
        },
        onFallback: (state) => { probe.release(); if (!cancelled) setLoadState(state); publishReady(false); },
      });
    }

    function watchViewport() {
      if (eager) { loadScene(); return; }
      if (background) {
        // Let the intro paint first, then prepare About even while offscreen.
        // Rendering pauses offscreen once initialization has finished.
        backgroundTimer = window.setTimeout(() => {
          if (window.requestIdleCallback) idleTask = window.requestIdleCallback(loadScene, { timeout: 1200 });
          else loadScene();
        }, 1100);
        return;
      }
      if (typeof IntersectionObserver !== "function") return;
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        loadScene();
      }, { rootMargin: "200px" });
      if (element) observer.observe(element);
    }
    function motionChanged() {
      observer?.disconnect();
      window.clearTimeout(backgroundTimer);
      window.clearTimeout(retryTimer);
      if (idleTask !== undefined) window.cancelIdleCallback?.(idleTask);
      enhancement?.cancel();
      probe?.release?.();
      scene.current = null;
      publishReady(false);
      started = false;
      if (!media?.matches && !reduceMotion) watchViewport();
    }
    // One attempt per mount; background loading has its own generous budget.
    publishReady(false);
    if (!reduceMotion && !media?.matches) watchViewport();
    media?.addEventListener?.("change", motionChanged);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.clearTimeout(backgroundTimer);
      window.clearTimeout(retryTimer);
      if (idleTask !== undefined) window.cancelIdleCallback?.(idleTask);
      media?.removeEventListener?.("change", motionChanged);
      enhancement?.cancel();
      probe?.release?.();
      scene.current = null;
    };
  }, [eager, background, reduceMotion]);

  useEffect(() => {
    motionPreference.current = reduceMotion;
    scene.current?.setReducedMotion(reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    pausedPreference.current = paused;
    scene.current?.setPaused(paused);
  }, [paused]);

  useEffect(() => {
    currentReaction.current = { reaction, reactionKey };
    scene.current?.setReaction(reaction, reactionKey);
  }, [reaction, reactionKey]);

  return (
    <div className={`${styles.character} ${className}`} data-ready={ready} data-avatar-state={loadState} data-reaction={reaction}>
      <div
        className={styles.portrait}
        role="group"
        aria-label={ready ? "Animated 3D portrait of Parampreet Singh" : "Portrait of Parampreet Singh"}
      >
        {fallback !== "none" && <div className={`${styles.fallback} ${ready ? styles.hidden : ""}`} aria-hidden={ready} style={{ backgroundImage: portraitLoaded ? undefined : `url("${useChipFallback ? chipPlaceholderDataUrl : avatarPlaceholderDataUrl}")` }}>
          {useChipFallback ? (
            <Image
              src="/parampreet.png"
              alt="Parampreet Singh's cartoon avatar"
              fill
              sizes={compact ? "150px" : "(max-width: 899px) 266px, 326px"}
              className={styles.referenceImage}
              priority={eager || !compact}
              draggable={false}
              onLoad={() => setPortraitLoaded(true)}
            />
          ) : <picture>
            <source srcSet="/avatar-optimized/avatar-v3-320.webp 320w, /avatar-optimized/avatar-v3-640.webp 640w" sizes={compact ? "150px" : "(max-width: 899px) 266px, 326px"} />
            <Image
              src="/avatar-optimized/avatar-v3-640.webp"
              alt="Parampreet wearing a golden turban, silver glasses, brown beard, ivory jacket and plaid shirt."
              fill
              sizes={compact ? "150px" : "(max-width: 899px) 266px, 326px"}
              className={styles.referenceImage}
              priority={eager || !compact}
              unoptimized
              draggable={false}
              onLoad={() => setPortraitLoaded(true)}
            />
          </picture>}
        </div>}
        <div ref={host} className={`${styles.canvas} ${ready ? styles.visible : ""}`} aria-hidden="true" />
      </div>
    </div>
  );
}
