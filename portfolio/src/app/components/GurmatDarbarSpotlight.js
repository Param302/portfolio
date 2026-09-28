"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Bot, CalendarDays, HeartHandshake, Users } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

const socials = [
  { label: "Facebook", icon: "/socials/facebook.png", href: "https://www.facebook.com/gurmatdarbar" },
  { label: "Instagram", icon: "/socials/instagram.png", href: "https://www.instagram.com/gurmatdarbar" },
  { label: "YouTube", icon: "/socials/youtube.png", href: "https://www.youtube.com/@gurmatdarbar" },
  { label: "LinkedIn", icon: "/socials/linkedin.png", href: "https://www.linkedin.com/company/gurmatdarbar" },
  { label: "WhatsApp", icon: "/socials/whatsapp.svg", href: "https://gurmatdarbar.com" },
];

function Description() {
  return (
    <div>
      <p className="font-accent text-xl italic text-prussian-blue/66">Discover samagams happening near you!</p>
      <p className="mt-4 max-w-3xl font-description text-base leading-8 text-prussian-blue/78 sm:text-lg">A digital ecosystem for Sikh community events, bringing trusted discovery, community contributions, and thoughtful technology into one useful home.</p>
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
    <div className="grid gap-4 sm:grid-cols-3">
      {metrics.map(({ icon: Icon, value, label, detail }) => (
        <article key={label} className="rounded-[1.6rem] bg-bright-snow p-6">
          <Icon className="h-5 w-5 text-sky-surge" />
          <p className="mt-5 font-heading text-4xl font-extrabold">{value}</p>
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em]">{label}</p>
          <p className="mt-2 font-description text-sm leading-6 text-prussian-blue/65">{detail}</p>
        </article>
      ))}
    </div>
  );
}

function PosterIntelligence() {
  return (
    <article className="rounded-[1.6rem] bg-prussian-blue p-6 text-bright-snow sm:p-7">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-surge text-ink-black"><Bot className="h-6 w-6" /></span>
        <div>
          <h3 className="font-heading text-xl font-bold">AI Poster Intelligence</h3>
          <p className="mt-2 font-description text-sm leading-7 text-bright-snow/78">A multilingual, Multi-RAG workflow that understands uploaded posters, extracts event information, and automatically fills structured details so listings are ready to publish.</p>
        </div>
      </div>
    </article>
  );
}

function SocialLinks() {
  return (
    <div className="flex flex-wrap items-center gap-4" aria-label="Gurmat Darbar social links">
      {socials.map((social) => (
        <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={`Gurmat Darbar on ${social.label}`} className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-prussian-blue/12 bg-bright-snow transition hover:-translate-y-1 hover:border-sky-surge hover:shadow-soft sm:h-16 sm:w-16">
          <Image src={social.icon} alt="" width={30} height={30} className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
        </a>
      ))}
      <span className="font-accent text-xl italic text-prussian-blue/65">@gurmatdarbar</span>
    </div>
  );
}

function ScreenshotCarousel({ screenshots, index, setPaused }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-prussian-blue outline-none" role="region" aria-roledescription="carousel" aria-label="Gurmat Darbar product screenshots" tabIndex={0} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {screenshots.map((src, screenshotIndex) => (
        <Image key={src} src={src} alt={`Gurmat Darbar platform screenshot ${screenshotIndex + 1}`} fill sizes="(min-width: 1280px) 54vw, 96vw" className={`object-cover transition duration-700 ease-out ${screenshotIndex === index ? "scale-100 opacity-100" : "scale-[1.015] opacity-0"}`} priority={screenshotIndex === 0} />
      ))}
    </div>
  );
}

export default function GurmatDarbarSpotlight({ screenshots = ["/media/gurmat-darbar/gd-original.png"] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused || screenshots.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % screenshots.length), 3000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, screenshots.length]);

  return (
    <section className="section-anchor overflow-hidden bg-bright-snow text-prussian-blue dark:bg-ink-black dark:text-bright-snow">
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-[2.5rem] bg-papaya-whip p-6 text-prussian-blue sm:p-9 lg:p-12">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h2 className="font-accent text-5xl font-bold italic tracking-tight sm:text-6xl lg:text-7xl">Gurmat Darbar</h2>
              <span className="mt-4 inline-flex min-w-44 justify-center rounded-full bg-prussian-blue px-8 py-2.5 font-accent text-lg italic text-bright-snow">Founder</span>
            </div>
            <Image src="/gurmatdarbar_logo.png" alt="Gurmat Darbar" width={230} height={104} className="mx-auto h-auto w-36 shrink-0 object-contain sm:w-40 xl:mx-0 xl:w-56" />
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
