"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bot, MapPinned, Pause, Play, Users } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

const stats = [
  { title: "1,500+ Users", detail: "Growing community reach since launch.", icon: Users },
  { title: "Global Samagam Discovery", detail: "150+ events and 200+ community contributions.", icon: MapPinned },
  { title: "AI Poster Intelligence", detail: "Understands posters, extracts event fields, and prepares listings for publication.", icon: Bot },
];

const techStack = ["FastAPI", "PostgreSQL", "Redis", "GCP Cloud Run", "Multilingual GenAI"];

export default function GurmatDarbarSpotlight({ screenshots = ["/gurmatdarbar.png"] }) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!shouldReduceMotion);
  const [temporarilyPaused, setTemporarilyPaused] = useState(false);
  const carouselPlaying = playing && !temporarilyPaused && !shouldReduceMotion;

  useEffect(() => {
    if (!carouselPlaying || screenshots.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % screenshots.length), 3000);
    return () => window.clearInterval(timer);
  }, [carouselPlaying, screenshots.length]);

  const show = (next) => setIndex((next + screenshots.length) % screenshots.length);

  return (
    <section className="w-full border-y border-prussian-blue/15 dark:border-alice-blue/10">
      <div className="grid lg:grid-cols-[6fr_4fr]">
        <div className="bg-papaya-whip px-6 py-10 text-prussian-blue sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-wrap items-center gap-3"><h2 className="font-heading text-4xl font-extrabold tracking-tight lg:text-5xl">Gurmat Darbar</h2><span className="rounded-full border border-prussian-blue/10 bg-bright-snow/70 px-4 py-1.5 font-accent text-lg italic">Founder</span></div>
          <a href="https://gurmatdarbar.com" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border border-prussian-blue/15 bg-bright-snow/75 px-4 py-2 font-description text-sm font-medium transition hover:-translate-y-0.5 hover:text-sky-surge">gurmatdarbar.com <ArrowUpRight className="h-4 w-4" /></a>
          <p className="mt-7 max-w-3xl font-description text-base leading-8 sm:text-lg">Building a digital ecosystem for Sikh community events, combining local discovery, community contributions, and an AI-assisted publishing workflow.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {stats.map(({ title, detail, icon: Icon }) => <article key={title} className="rounded-[1.5rem] bg-bright-snow p-5 shadow-[0_12px_32px_rgba(11,15,25,0.08)] dark:bg-prussian-blue dark:text-papaya-whip"><div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-surge/12"><Icon className="h-5 w-5" /></div><p className="mt-4 font-heading text-lg font-semibold leading-snug">{title}</p><p className="mt-2 font-description text-sm leading-6 opacity-75">{detail}</p></article>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">{techStack.map((chip) => <span key={chip} className="rounded-full border border-prussian-blue/12 bg-bright-snow/70 px-3.5 py-2 font-description text-xs uppercase tracking-[0.16em]">{chip}</span>)}</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-5 bg-bright-snow px-6 py-10 dark:bg-ink-black lg:px-8" onMouseEnter={() => setTemporarilyPaused(true)} onMouseLeave={() => setTemporarilyPaused(false)} onFocusCapture={() => setTemporarilyPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setTemporarilyPaused(false); }}>
          <Image src="/gurmatdarbar_logo.png" alt="Gurmat Darbar logo" width={200} height={90} className="rounded-xl border-2 border-prussian-blue bg-papaya-whip px-4 py-2" />
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-prussian-blue dark:border-bright-snow">
            {screenshots.map((src, screenshotIndex) => <Image key={src} src={src} alt={`Gurmat Darbar platform screen ${screenshotIndex + 1}`} fill sizes="(min-width: 1024px) 40vw, 100vw" className={`object-cover transition duration-700 ${screenshotIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`} />)}
          </div>
          <div className="flex items-center gap-3"><button type="button" onClick={() => show(index - 1)} aria-label="Previous screenshot" className="rounded-full border border-prussian-blue/15 p-2.5 dark:border-alice-blue/20"><ArrowLeft className="h-4 w-4" /></button><button type="button" disabled={shouldReduceMotion} onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause carousel" : "Play carousel"} className="rounded-full bg-sky-surge p-2.5 text-ink-black disabled:cursor-not-allowed disabled:opacity-50">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button><button type="button" onClick={() => show(index + 1)} aria-label="Next screenshot" className="rounded-full border border-prussian-blue/15 p-2.5 dark:border-alice-blue/20"><ArrowRight className="h-4 w-4" /></button></div>
          <p className="font-description text-xs text-prussian-blue/60 dark:text-bright-snow/60">{index + 1} / {screenshots.length}</p>
        </div>
      </div>
    </section>
  );
}
