"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Bot, CalendarDays, HandHeart, Users } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

const metrics = [
  { value: "1,500+", label: "Users", detail: "People reached since launch", icon: Users },
  { value: "300+", label: "Samagams", detail: "Events brought into one place", icon: CalendarDays },
  { value: "500+", label: "Contributions", detail: "Updates shared by the sangat", icon: HandHeart },
];

const techStack = ["FastAPI", "PostgreSQL", "Redis", "GCP Cloud Run", "Multilingual GenAI"];

const socials = [
  { label: "Facebook", icon: "/socials/facebook.png", href: "https://www.facebook.com/gurmatdarbar" },
  { label: "Instagram", icon: "/socials/instagram.png", href: "https://www.instagram.com/gurmatdarbar" },
  { label: "YouTube", icon: "/socials/youtube.png", href: "https://www.youtube.com/@gurmatdarbar" },
  { label: "LinkedIn", icon: "/socials/linkedin.png", href: "https://www.linkedin.com/company/gurmatdarbar" },
  { label: "WhatsApp", icon: "/socials/whatsapp.png", href: "https://gurmatdarbar.com" },
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
        <div className="grid items-start gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:gap-14">
          <div className="rounded-[2.25rem] bg-papaya-whip p-6 text-prussian-blue shadow-[0_24px_70px_rgba(26,34,53,0.10)] sm:p-9 lg:p-11">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <Image src="/gurmatdarbar_logo.png" alt="Gurmat Darbar" width={230} height={104} className="h-auto w-44 object-contain sm:w-56" />
              <span className="rounded-full bg-prussian-blue px-4 py-2 font-accent text-lg italic text-bright-snow">Founder</span>
            </div>
            <h2 className="mt-9 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">Discover samagams. Contribute with sangat.</h2>
            <p className="mt-5 max-w-3xl font-description text-base leading-8 text-prussian-blue/78 sm:text-lg">A digital ecosystem for Sikh community events—bringing trusted discovery, community contributions, and thoughtful technology into one useful home.</p>
            <a href="https://gurmatdarbar.com" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-surge px-5 py-3 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5 hover:bg-[#36c3e8]">Visit gurmatdarbar.com <ArrowUpRight className="h-4 w-4" /></a>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {metrics.map(({ value, label, detail, icon: Icon }) => (
                <article key={label} className="rounded-[1.5rem] bg-bright-snow p-5 shadow-[0_12px_30px_rgba(11,15,25,0.08)]">
                  <Icon className="h-5 w-5 text-sky-surge" />
                  <p className="mt-4 font-heading text-3xl font-extrabold">{value}</p>
                  <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em]">{label}</p>
                  <p className="mt-2 font-description text-xs leading-5 text-prussian-blue/65">{detail}</p>
                </article>
              ))}
            </div>

            <article className="mt-5 rounded-[1.65rem] bg-prussian-blue p-6 text-bright-snow sm:p-7">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-surge text-ink-black"><Bot className="h-6 w-6" /></span>
                <div>
                  <h3 className="font-heading text-xl font-bold">AI Poster Intelligence</h3>
                  <p className="mt-2 font-description text-sm leading-7 text-bright-snow/78">Understands uploaded posters, extracts structured event fields automatically, and prepares each listing to go live with less manual work.</p>
                </div>
              </div>
            </article>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {techStack.map((chip) => <span key={chip} className="rounded-full border border-prussian-blue/12 bg-bright-snow/75 px-3.5 py-2 font-description text-xs uppercase tracking-[0.14em]">{chip}</span>)}
            </div>
            <p className="mt-7 font-description text-sm leading-7 text-prussian-blue/72">A dedicated team of sewadars works behind the scenes to verify listings, support contributors, and keep the platform useful for the sangat.</p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5" aria-label="Gurmat Darbar social links">
              {socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={`Gurmat Darbar on ${social.label}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-prussian-blue/12 bg-bright-snow transition hover:-translate-y-0.5 hover:border-sky-surge hover:shadow-md">
                  <Image src={social.icon} alt="" width={22} height={22} className="h-5 w-5 object-contain" />
                </a>
              ))}
              <span className="ml-1 font-accent text-base italic text-prussian-blue/65">@gurmatdarbar</span>
            </div>
          </div>

          <div className="xl:sticky xl:top-28">
            <div
              className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-prussian-blue shadow-[0_28px_90px_rgba(11,15,25,0.22)] outline-none"
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
            <div className="mt-6 rounded-[1.75rem] border border-prussian-blue/10 bg-background p-6 dark:border-bright-snow/10 sm:p-7">
              <p className="font-accent text-2xl italic text-prussian-blue dark:text-bright-snow">Built for trust, not noise.</p>
              <p className="mt-3 font-description text-sm leading-7 text-prussian-blue/68 dark:text-bright-snow/68">Every workflow is shaped around making real community information easier to discover, verify, and share.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
