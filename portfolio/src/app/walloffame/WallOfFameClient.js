"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, Pause, Play, Search } from "lucide-react";

const PAGE_SIZE = 18;

export default function WallOfFameClient({ feedbacks }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(!reduceMotion);
  const [temporarilyPaused, setTemporarilyPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const visibleNodes = feedbacks.slice(0, Math.min(12, feedbacks.length));
  const filtered = useMemo(() => feedbacks.filter((item) => item.toLowerCase().includes(query.toLowerCase())), [feedbacks, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const orbitPlaying = playing && !temporarilyPaused && !reduceMotion;

  return (
    <main className="min-h-screen bg-papaya-whip px-4 pb-20 pt-8 text-prussian-blue sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl"><Link href="/#community" className="inline-flex items-center gap-2 rounded-full bg-bright-snow px-4 py-2 font-heading text-sm font-semibold shadow"><ArrowLeft className="h-4 w-4" />Community</Link>
        <header className="mx-auto mt-10 max-w-4xl text-center"><p className="font-heading text-sm uppercase tracking-[0.3em] opacity-60">Teaching impact</p><h1 className="mt-4 font-accent text-6xl font-bold italic sm:text-7xl">Wall of Fame</h1><p className="mx-auto mt-5 max-w-2xl font-description leading-8 opacity-75">{feedbacks.length} anonymous notes from live sessions, revision marathons, and mentoring.</p></header>
        <section className="relative mx-auto mt-12 hidden h-[620px] max-w-5xl overflow-hidden rounded-[3rem] border border-prussian-blue/15 bg-prussian-blue text-bright-snow shadow-soft md:block" aria-label="Interactive feedback orbit" onMouseEnter={() => setTemporarilyPaused(true)} onMouseLeave={() => setTemporarilyPaused(false)} onFocusCapture={() => setTemporarilyPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setTemporarilyPaused(false); }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(27,182,224,0.18),transparent_48%)]" />
          <div className="feedback-orbit absolute inset-0" data-playing={orbitPlaying}>
            {visibleNodes.map((item, index) => { const angle = (index / visibleNodes.length) * Math.PI * 2; const x = 50 + Math.cos(angle) * 39; const y = 50 + Math.sin(angle) * 38; return <button key={item} type="button" onFocus={() => setActive(index)} onMouseEnter={() => setActive(index)} onClick={() => setActive(index)} style={{ left: `${x}%`, top: `${y}%` }} className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bright-snow/30 bg-bright-snow/10 font-heading text-xs backdrop-blur transition hover:scale-125 hover:bg-sky-surge hover:text-ink-black focus:outline-none focus:ring-2 focus:ring-sky-surge" aria-label={`Read feedback ${index + 1}`}>{index + 1}</button>; })}
          </div>
          <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-bright-snow/15 bg-ink-black/85 p-8 text-center shadow-2xl backdrop-blur"><p className="font-accent text-2xl italic leading-9">“{visibleNodes[active]}”</p><button type="button" disabled={reduceMotion} onClick={() => setPlaying((value) => !value)} className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-sky-surge px-4 py-2 font-heading text-sm font-semibold text-ink-black disabled:cursor-not-allowed disabled:opacity-50">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{reduceMotion ? "Motion reduced" : playing ? "Pause" : "Play"}</button></div>
        </section>
        <section className="mt-14" aria-labelledby="feedback-list-title"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="feedback-list-title" className="font-heading text-3xl font-bold">Read every note</h2><p className="mt-1 font-description text-sm opacity-65">Searchable and keyboard-friendly.</p></div><label className="relative block sm:w-80"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" /><span className="sr-only">Search feedback</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search feedback" className="w-full rounded-full border border-prussian-blue/15 bg-bright-snow py-3 pl-11 pr-4 outline-none focus:border-sky-surge" /></label></div>
          {pageItems.length > 0 ? <div className="mt-8 columns-1 gap-4 md:columns-2 xl:columns-3">{pageItems.map((feedback) => <article key={feedback} className="mb-4 break-inside-avoid rounded-[1.5rem] bg-bright-snow p-5 text-sm leading-7 shadow-[0_12px_30px_rgba(11,15,25,0.06)]">{feedback}</article>)}</div> : <p className="mt-8 rounded-[1.5rem] bg-bright-snow p-8 text-center font-description opacity-70">No feedback matches that search.</p>}
          <div className="mt-8 flex items-center justify-center gap-4"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border border-prussian-blue/15 px-5 py-2 disabled:opacity-35">Previous</button><span className="font-description text-sm">{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-prussian-blue/15 px-5 py-2 disabled:opacity-35">Next</button></div>
        </section>
      </div>
    </main>
  );
}
