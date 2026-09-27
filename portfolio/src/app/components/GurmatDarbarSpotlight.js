"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Bot, CalendarDays, Users } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

const techStack = ["FastAPI", "PostgreSQL", "Redis", "GCP Cloud Run", "Multilingual GenAI"];

const socials = [
  { label: "Facebook", icon: "/socials/facebook.png", href: "https://www.facebook.com/gurmatdarbar" },
  { label: "Instagram", icon: "/socials/instagram.png", href: "https://www.instagram.com/gurmatdarbar" },
  { label: "YouTube", icon: "/socials/youtube.png", href: "https://www.youtube.com/@gurmatdarbar" },
  { label: "LinkedIn", icon: "/socials/linkedin.png", href: "https://www.linkedin.com/company/gurmatdarbar" },
  { label: "WhatsApp", icon: "/socials/whatsapp.svg", href: "https://gurmatdarbar.com" },
];

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
          <div className="flex flex-col gap-5 border-b border-prussian-blue/12 pb-7 sm:flex-row sm:items-center sm:justify-between lg:pb-9">
            <div>
              <h2 className="font-accent text-5xl font-bold italic tracking-tight sm:text-6xl lg:text-7xl">Gurmat Darbar</h2>
              <p className="mt-2 font-accent text-xl italic text-prussian-blue/66">Discover samagams. Contribute with sangat.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-prussian-blue px-4 py-2 font-accent text-base italic text-bright-snow">Founder</span>
              <Image src="/gurmatdarbar_logo.png" alt="Gurmat Darbar" width={230} height={104} className="h-auto w-40 object-contain sm:w-52" />
            </div>
          </div>

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:gap-12">
            <div>
              <p className="max-w-3xl font-description text-base leading-8 text-prussian-blue/78 sm:text-lg">A digital ecosystem for Sikh community events—bringing trusted discovery, community contributions, and thoughtful technology into one useful home.</p>
              <a href="https://gurmatdarbar.com" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-surge px-5 py-3 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5 hover:bg-[#36c3e8]">Visit gurmatdarbar.com <ArrowUpRight className="h-4 w-4" /></a>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <article className="rounded-[1.6rem] bg-bright-snow p-6">
                  <Users className="h-5 w-5 text-sky-surge" />
                  <p className="mt-5 font-heading text-4xl font-extrabold">1,500+</p>
                  <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em]">Users</p>
                  <p className="mt-2 font-description text-sm leading-6 text-prussian-blue/65">People reached since launch.</p>
                </article>
                <article className="rounded-[1.6rem] bg-bright-snow p-6">
                  <CalendarDays className="h-5 w-5 text-sky-surge" />
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div><p className="font-heading text-3xl font-extrabold">300+</p><p className="font-heading text-xs font-semibold uppercase tracking-[0.12em]">Samagams</p></div>
                    <div><p className="font-heading text-3xl font-extrabold">500+</p><p className="font-heading text-xs font-semibold uppercase tracking-[0.12em]">Contributions</p></div>
                  </div>
                  <p className="mt-3 font-description text-sm leading-6 text-prussian-blue/65">Events and updates brought together by the sangat.</p>
                </article>
                <article className="rounded-[1.6rem] bg-prussian-blue p-6 text-bright-snow sm:col-span-2 sm:p-7">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-surge text-ink-black"><Bot className="h-6 w-6" /></span>
                    <div>
                      <h3 className="font-heading text-xl font-bold">AI Poster Intelligence</h3>
                      <p className="mt-2 font-description text-sm leading-7 text-bright-snow/78">A multilingual, Multi-RAG workflow that understands uploaded posters, extracts event information, and automatically fills structured details so listings are ready to publish.</p>
                    </div>
                  </div>
                </article>
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {techStack.map((chip) => <span key={chip} className="rounded-full border border-prussian-blue/12 bg-bright-snow/75 px-3.5 py-2 font-description text-xs uppercase tracking-[0.14em]">{chip}</span>)}
              </div>
              <p className="mt-7 font-description text-sm leading-7 text-prussian-blue/72">A dedicated team of sewadars works behind the scenes to verify listings, support contributors, and keep the platform useful for the sangat.</p>
            </div>

            <div>
            <div
              className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-prussian-blue outline-none"
              role="region"
              aria-roledescription="carousel"
              aria-label="Gurmat Darbar product screenshots"
              tabIndex={0}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              {screenshots.map((src, screenshotIndex) => (
                <Image
                  key={src}
                  src={src}
                  alt={`Gurmat Darbar platform screenshot ${screenshotIndex + 1}`}
                  fill
                  sizes="(min-width: 1280px) 54vw, 96vw"
                  className={`object-cover transition duration-700 ease-out ${screenshotIndex === index ? "scale-100 opacity-100" : "scale-[1.015] opacity-0"}`}
                  priority={screenshotIndex === 0}
                />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3" aria-label="Gurmat Darbar social links">
              {socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={`Gurmat Darbar on ${social.label}`} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-prussian-blue/12 bg-bright-snow transition hover:-translate-y-0.5 hover:border-sky-surge">
                  <Image src={social.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                </a>
              ))}
              <span className="font-accent text-lg italic text-prussian-blue/65">@gurmatdarbar</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
