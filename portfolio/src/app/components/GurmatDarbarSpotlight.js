"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Bot, CalendarDays, HeartHandshake, Users } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

const socials = [
  { label: "Facebook", icon: "/optimized/socials/facebook.webp", href: "https://www.facebook.com/gurmatdarbar" },
  { label: "Instagram", icon: "/optimized/socials/instagram.webp", href: "https://www.instagram.com/gurmatdarbar" },
  { label: "YouTube", icon: "/optimized/socials/youtube.webp", href: "https://www.youtube.com/@gurmatdarbar" },
  { label: "LinkedIn", icon: "/optimized/socials/linkedin.webp", href: "https://www.linkedin.com/company/gurmatdarbar" },
  { label: "WhatsApp", icon: "/socials/whatsapp.svg", href: "https://gurmatdarbar.com" },
];

function Description() {
  return (
    <div>
      <p className="font-accent text-lg italic text-prussian-blue/66 sm:text-xl">Discover samagams happening near you!</p>
      <p className="mt-3 max-w-3xl font-description text-sm leading-6 text-prussian-blue/78 sm:text-base sm:leading-7">A digital ecosystem for Sikh community events, bringing trusted discovery, community contributions, and thoughtful technology into one useful home.</p>
      <a href="https://gurmatdarbar.com" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-surge px-5 py-3 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5 hover:bg-[#36c3e8]">Visit gurmatdarbar.com <ArrowUpRight className="h-4 w-4" /></a>
    </div>
  );
}

function Metrics() {
  const metrics = [
    { icon: Users, value: "1,500+", label: "Users", detail: "People reached since launch." },
    { icon: CalendarDays, value: "300+", label: "Samagams", detail: "Events brought into one place." },
    { icon: HeartHandshake, value: "500+", label: "Contributions", detail: "Updates shared by the sangat." },
  ];
  return (
    <div data-gurmat-metrics className="grid grid-cols-3 gap-0 overflow-hidden rounded-2xl border border-prussian-blue/10 bg-bright-snow/75 shadow-sm sm:gap-3 sm:overflow-visible sm:border-0 sm:bg-transparent sm:shadow-none">
      {metrics.map(({ icon: Icon, value, label, detail }) => (
        <article key={label} className="min-w-0 border-r border-prussian-blue/10 px-1.5 py-4 text-center last:border-r-0 sm:rounded-2xl sm:border-0 sm:bg-bright-snow sm:p-4 sm:text-left">
          <span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-surge/15 text-prussian-blue sm:mx-0"><Icon className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="font-heading text-xl font-extrabold tracking-tight sm:text-3xl">{value}</p>
            <p className="mt-1 font-heading text-[10px] font-semibold text-prussian-blue/75 sm:text-xs">{label}</p>
            <p className="mt-1 hidden font-description text-xs leading-5 text-prussian-blue/65 sm:block">{detail}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function PosterIntelligence() {
  return (
    <article data-gurmat-ai className="rounded-2xl bg-prussian-blue p-4 text-bright-snow sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-surge text-ink-black"><Bot className="h-5 w-5" /></span>
        <div>
          <h3 className="font-heading text-base font-bold sm:text-lg">AI Poster Intelligence</h3>
          <p className="mt-1.5 font-description text-xs leading-5 text-bright-snow/78 sm:text-sm sm:leading-6">A multilingual, Multi-RAG workflow that understands uploaded posters, extracts event information, and automatically fills structured details so listings are ready to publish.</p>
        </div>
      </div>
    </article>
  );
}

function SocialLinks() {
  return (
    <div className="flex flex-wrap items-center gap-2 lg:gap-3" aria-label="Gurmat Darbar social links">
      {socials.map((social) => (
        <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={`Gurmat Darbar on ${social.label}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-prussian-blue/12 bg-bright-snow transition hover:-translate-y-1 hover:border-sky-surge hover:shadow-soft lg:h-14 lg:w-14">
          <Image src={social.icon} alt="" width={28} height={28} className="h-5 w-5 object-contain lg:h-7 lg:w-7" />
        </a>
      ))}
      <span className="font-accent text-base italic text-prussian-blue/65 lg:text-lg">@gurmatdarbar</span>
    </div>
  );
}

function ScreenshotCarousel({ screenshots, index, setPaused }) {
  const activeScreenshot = screenshots[index % screenshots.length];
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-prussian-blue outline-none" role="region" aria-roledescription="carousel" aria-label="Gurmat Darbar product screenshots" tabIndex={0} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <Image key={activeScreenshot} src={activeScreenshot} alt={`Gurmat Darbar platform screenshot ${index + 1}`} fill sizes="(min-width: 1280px) 54vw, 96vw" loading="lazy" className="object-cover" />
    </div>
  );
}

export default function GurmatDarbarSpotlight({ screenshots = ["/optimized/media/gurmat-darbar/gd-original.webp"] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused || screenshots.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % screenshots.length), 3000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, screenshots.length]);

  return (
    <section id="gurmat-darbar" className="section-anchor overflow-hidden bg-bright-snow text-prussian-blue dark:bg-ink-black dark:text-bright-snow">
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-[2.5rem] bg-papaya-whip p-6 text-prussian-blue sm:p-9 lg:p-12">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="w-full min-w-0 xl:w-auto">
              <h2 className="text-center font-accent text-5xl font-bold italic tracking-tight sm:text-6xl lg:text-7xl xl:text-left">Gurmat Darbar</h2>
              <div className="mt-4 flex items-center justify-between gap-4 xl:block">
                <span className="inline-flex min-w-28 justify-center rounded-full bg-prussian-blue px-5 py-1.5 font-accent text-base italic text-bright-snow sm:min-w-44 sm:px-8 sm:py-2.5 sm:text-lg">Founder</span>
                <Image src="/optimized/gurmatdarbar_logo.webp" alt="Gurmat Darbar" width={184} height={83} className="h-auto w-32 shrink-0 object-contain sm:w-40 xl:hidden" />
              </div>
            </div>
            <Image src="/optimized/gurmatdarbar_logo.webp" alt="Gurmat Darbar" width={230} height={104} className="hidden h-auto w-56 shrink-0 object-contain xl:block" />
          </div>

          <div className="mt-8 space-y-7 xl:hidden">
            <Description />
            <ScreenshotCarousel screenshots={screenshots} index={index} setPaused={setPaused} />
            <Metrics />
            <PosterIntelligence />
            <SocialLinks />
          </div>

          <div className="mt-9 hidden items-start gap-12 xl:grid xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-8">
              <Description />
              <Metrics />
              <SocialLinks />
            </div>
            <div className="space-y-6">
              <ScreenshotCarousel screenshots={screenshots} index={index} setPaused={setPaused} />
              <PosterIntelligence />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
