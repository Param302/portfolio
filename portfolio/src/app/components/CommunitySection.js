"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

import TeachingImpact from "@/app/components/TeachingImpact";

function seededShuffle(items) {
  const shuffled = [...items];
  let seed = Date.now() % 2147483647;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed = (seed * 48271) % 2147483647;
    const swapIndex = seed % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function CommunityCarousel({ codexImages, pyDelhiImages, extraImages }) {
  const originalSlides = useMemo(() => [
    ...codexImages.map((src) => ({ src, kind: "codex" })),
    ...pyDelhiImages.map((src) => ({ src, kind: "pydelhi" })),
    ...extraImages.map((src) => ({ src, kind: "extra" })),
  ], [codexImages, extraImages, pyDelhiImages]);
  const [slides, setSlides] = useState(originalSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);

  useEffect(() => {
    if (!originalSlides.length) return;
    const storageKey = "itsparam-community-slide-order";
    const storedOrder = window.sessionStorage.getItem(storageKey);
    if (storedOrder) {
      try {
        const paths = JSON.parse(storedOrder);
        const byPath = new Map(originalSlides.map((slide) => [slide.src, slide]));
        const ordered = paths.map((path) => byPath.get(path)).filter(Boolean);
        const missing = originalSlides.filter((slide) => !paths.includes(slide.src));
        setSlides([...ordered, ...missing]);
        return;
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }
    const randomized = seededShuffle(originalSlides);
    setSlides(randomized);
    window.sessionStorage.setItem(storageKey, JSON.stringify(randomized.map((slide) => slide.src)));
  }, [originalSlides]);

  const selectRelative = useCallback((delta) => {
    setActiveIndex((current) => (current + delta + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    const timer = window.setInterval(() => selectRelative(1), 4000);
    return () => window.clearInterval(timer);
  }, [paused, selectRelative, slides.length]);

  if (!slides.length) return null;
  const activeSlide = slides[activeIndex % slides.length];

  return (
    <div
      className="group relative mt-5 aspect-video w-full overflow-hidden rounded-[1.75rem] bg-ink-black shadow-[0_24px_70px_rgba(26,34,53,0.18)] outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Community events"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") selectRelative(-1);
        if (event.key === "ArrowRight") selectRelative(1);
      }}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; setPaused(true); }}
      onTouchEnd={(event) => {
        const end = event.changedTouches[0]?.clientX;
        if (touchStart.current !== null && typeof end === "number" && Math.abs(end - touchStart.current) > 45) selectRelative(end > touchStart.current ? -1 : 1);
        touchStart.current = null;
        setPaused(false);
      }}
    >
      <Image
        key={activeSlide.src}
        src={activeSlide.src}
        alt={activeSlide.kind === "codex" ? "Codex Ambassador community event in New Delhi" : activeSlide.kind === "pydelhi" ? "PyDelhi community meetup" : "Community event with Parampreet Singh"}
        fill
        sizes="(min-width: 1280px) 1120px, 92vw"
        loading="lazy"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-black/85 via-ink-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-5 p-5 sm:p-7 lg:p-9">
        <div className="max-w-2xl text-bright-snow">
          {activeSlide.kind === "codex" ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-bright-snow px-3 py-1.5 font-heading text-xs font-semibold text-ink-black sm:text-sm">
                <Image src="/socials/codex.png" alt="OpenAI" width={20} height={20} className="h-4 w-4 object-contain" />
                Codex Ambassador, New Delhi
              </span>
              <p className="mt-3 hidden max-w-xl font-description text-sm leading-6 text-bright-snow/85 sm:block">Hosted various community events and hackathons, by managing over 150 participants</p>
            </>
          ) : null}
          {activeSlide.kind === "pydelhi" ? <span className="rounded-full bg-papaya-whip px-4 py-2 font-accent text-lg italic text-prussian-blue">PyDelhi</span> : null}
        </div>
        <div className="hidden shrink-0 gap-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 sm:flex">
          <button type="button" onClick={() => selectRelative(-1)} aria-label="Previous community image" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bright-snow/40 bg-ink-black/45 text-bright-snow backdrop-blur hover:bg-ink-black"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => selectRelative(1)} aria-label="Next community image" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bright-snow/40 bg-ink-black/45 text-bright-snow backdrop-blur hover:bg-ink-black"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="absolute right-5 top-5 z-10 flex max-w-[60%] flex-wrap justify-end gap-1.5 opacity-60 transition group-hover:opacity-100 group-focus-within:opacity-100">
        {slides.map((slide, index) => <button key={`${slide.src}-dot`} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show community image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-sky-surge" : "w-1.5 bg-bright-snow/80"}`} />)}
      </div>
    </div>
  );
}

export default function CommunitySection({ codexImages = [], pyDelhiImages = [], extraImages = [], subscriberLabel }) {
  return (
    <>
      <section id="community" className="section-anchor bg-papaya-whip px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-accent text-5xl font-bold italic tracking-tight text-prussian-blue sm:text-6xl lg:text-7xl">Community</h2>
            <p className="mx-auto mt-3 max-w-3xl font-description text-sm leading-6 text-prussian-blue/75 sm:text-base sm:leading-7">I build communities, organize meetups and hackathons, and create spaces where people learn and ship together.</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-prussian-blue/15 bg-bright-snow px-4 py-2 font-heading text-sm font-semibold text-prussian-blue shadow-sm">
              <Image src="/socials/codex.png" alt="OpenAI" width={22} height={22} className="h-5 w-5 object-contain" />
              Codex Ambassador · New Delhi
            </span>
          </div>
          <div className="mx-auto mt-8 max-w-6xl sm:mt-10">
            <h3 className="text-center font-heading text-3xl font-bold tracking-tight text-prussian-blue sm:text-4xl">Building with people</h3>
            <CommunityCarousel codexImages={codexImages} pyDelhiImages={pyDelhiImages} extraImages={extraImages} />
          </div>
        </div>
      </section>
      <TeachingImpact subscriberLabel={subscriberLabel} />
    </>
  );
}
