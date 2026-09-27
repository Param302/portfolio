"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, Pause, Play, Search } from "lucide-react";

const PAGE_SIZE = 18;
const RINGS = [
  { start: 0, count: 7, size: "min(92vw, 1280px)", duration: "88s" },
  { start: 7, count: 6, size: "min(69vw, 940px)", duration: "70s" },
  { start: 13, count: 5, size: "min(47vw, 650px)", duration: "54s" },
];

function QuoteNode({ quote, displayIndex, ringIndex, nodeIndex, count, playing, onSelect }) {
  const angle = (nodeIndex / count) * 360 + ringIndex * 17;
  const visibility = displayIndex >= 12 ? "hidden xl:block" : "";
  return (
    <div className={`feedback-node-arm absolute left-1/2 top-1/2 h-px w-1/2 origin-left ${visibility}`} style={{ "--node-angle": `${angle}deg`, transform: `rotate(${angle}deg)` }}>
      <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2" style={{ transform: `translate(50%, -50%) rotate(-${angle}deg)` }}>
        <button
          type="button"
          className="feedback-orbit-node group/node flex w-40 items-center rounded-2xl border border-bright-snow/20 bg-ink-black/82 px-4 py-3 text-left font-description text-xs leading-5 text-bright-snow shadow-[0_14px_36px_rgba(0,0,0,0.24)] backdrop-blur transition hover:z-50 hover:scale-110 hover:border-sky-surge hover:bg-prussian-blue focus:z-50 focus:scale-110 focus:border-sky-surge focus:outline-none focus:ring-2 focus:ring-sky-surge sm:w-48"
          data-playing={playing}
          onMouseEnter={() => onSelect(displayIndex, true)}
          onMouseLeave={() => onSelect(displayIndex, false)}
          onFocus={() => onSelect(displayIndex, true)}
          onBlur={() => onSelect(displayIndex, false)}
          onClick={() => onSelect(displayIndex, true)}
          aria-label={`Read feedback: ${quote}`}
        >
          <span className="line-clamp-3">“{quote}”</span>
        </button>
      </div>
    </div>
  );
}

export default function WallOfFameClient({ feedbacks }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(!reduceMotion);
  const [temporarilyPaused, setTemporarilyPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const visibleNodes = feedbacks.slice(0, Math.min(18, feedbacks.length));
  const filtered = useMemo(() => feedbacks.filter((item) => item.toLowerCase().includes(query.toLowerCase())), [feedbacks, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const orbitPlaying = playing && !temporarilyPaused && !reduceMotion;

  const selectQuote = (index, shouldPause) => {
    setActive(index);
    setTemporarilyPaused(shouldPause);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-papaya-whip pb-20 text-prussian-blue">
      <section className="relative min-h-[780px] overflow-hidden bg-prussian-blue px-4 pb-14 pt-6 text-bright-snow sm:px-6 lg:min-h-screen lg:px-8">
        <div className="relative z-50 mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-bright-snow/14 bg-bright-snow/10 px-3 py-2 font-heading text-sm font-semibold backdrop-blur transition hover:border-sky-surge">
            <Image src="/parampreet.png" alt="Parampreet Singh" width={34} height={34} className="h-8 w-8 rounded-full object-cover" />
            <span>Parampreet Singh</span>
          </Link>
          <Link href="/#community" className="inline-flex items-center gap-2 rounded-full border border-bright-snow/14 bg-bright-snow/10 px-4 py-3 font-heading text-sm font-semibold backdrop-blur transition hover:border-sky-surge"><ArrowLeft className="h-4 w-4" />Community</Link>
        </div>

        <header className="relative z-40 mx-auto mt-10 max-w-4xl text-center">
          <p className="font-heading text-xs uppercase tracking-[0.32em] text-bright-snow/55">Teaching impact</p>
          <h1 className="mt-3 font-accent text-6xl font-bold italic sm:text-7xl lg:text-8xl">Wall of Fame</h1>
          <p className="mx-auto mt-4 max-w-2xl font-description text-sm leading-7 text-bright-snow/68 sm:text-base">{feedbacks.length} anonymous notes from live sessions, revision marathons, and mentoring.</p>
        </header>

        <div className="absolute inset-0 z-0 hidden md:block" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(27,182,224,0.22),transparent_45%)]" />
          {RINGS.map((ring, ringIndex) => (
            <div key={ring.size} className="feedback-ring absolute left-1/2 top-[58%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-bright-snow/[0.045]" style={{ width: ring.size }}>
              <div className="feedback-ring-track absolute inset-0" data-playing={orbitPlaying} style={{ "--orbit-duration": ring.duration }}>
                {visibleNodes.slice(ring.start, ring.start + ring.count).map((quote, nodeIndex) => (
                  <QuoteNode key={`${ring.start}-${quote}`} quote={quote} displayIndex={ring.start + nodeIndex} ringIndex={ringIndex} nodeIndex={nodeIndex} count={ring.count} playing={orbitPlaying} onSelect={selectQuote} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-30 mx-auto mt-9 grid max-w-xl grid-cols-2 gap-3 md:hidden">
          {visibleNodes.slice(0, 8).map((quote, index) => (
            <button key={quote} type="button" onClick={() => setActive(index)} className={`min-h-28 rounded-2xl border p-4 text-left font-description text-xs leading-5 transition ${active === index ? "border-sky-surge bg-sky-surge text-ink-black" : "border-bright-snow/15 bg-bright-snow/8 text-bright-snow"}`}><span className="line-clamp-4">“{quote}”</span></button>
          ))}
        </div>

        <div className="relative z-40 mx-auto mt-8 w-full max-w-xl rounded-[2rem] border border-bright-snow/14 bg-ink-black/92 p-6 text-center shadow-2xl backdrop-blur md:absolute md:left-1/2 md:top-[58%] md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2 sm:p-8">
          <p className="font-accent text-xl italic leading-8 sm:text-2xl sm:leading-9">“{visibleNodes[active]}”</p>
          <button type="button" disabled={reduceMotion} onClick={() => setPlaying((value) => !value)} className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-sky-surge px-4 py-2 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {reduceMotion ? "Motion reduced" : playing ? "Pause motion" : "Play motion"}
          </button>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="feedback-list-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="feedback-list-title" className="font-heading text-3xl font-bold">Read every note</h2><p className="mt-1 font-description text-sm opacity-65">Searchable and keyboard-friendly.</p></div>
          <label className="relative block sm:w-80"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" /><span className="sr-only">Search feedback</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search feedback" className="w-full rounded-full border border-prussian-blue/15 bg-bright-snow py-3 pl-11 pr-4 outline-none transition focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10" /></label>
        </div>
        {pageItems.length > 0 ? (
          <div className="mt-8 columns-1 gap-4 md:columns-2 xl:columns-3">
            {pageItems.map((feedback) => <article key={feedback} className="mb-4 break-inside-avoid rounded-[1.5rem] bg-bright-snow p-5 text-sm leading-7 shadow-[0_12px_30px_rgba(11,15,25,0.06)]">{feedback}</article>)}
          </div>
        ) : <p className="mt-8 rounded-[1.5rem] bg-bright-snow p-8 text-center font-description opacity-70">No feedback matches that search.</p>}
        <div className="mt-8 flex items-center justify-center gap-4"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border border-prussian-blue/15 px-5 py-2 disabled:opacity-35">Previous</button><span className="font-description text-sm">{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-prussian-blue/15 px-5 py-2 disabled:opacity-35">Next</button></div>
      </section>
    </main>
  );
}
