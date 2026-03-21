"use client";

import {
  ArrowUpRight,
  Database,
  MapPinned,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/app/ThemeContext";

const stats = [
  {
    title: "100+ Active Users",
    detail: "Within the first week.",
    icon: Users,
  },
  {
    title: "Largest Sikhi Samagam Platform",
    detail: "Find Samagams Near Me feature.",
    icon: MapPinned,
  },
  {
    title: "Biggest Curated Sikhi Database",
    detail: "Structured multilingual data extraction.",
    icon: Database,
  },
];

const techStack = [
  "FastAPI",
  "PostgreSQL",
  "Redis",
  "GCP Cloud Run",
  "GenAI Pipeline (EN/HI/PA)",
];

export default function GurmatDarbarSpotlight() {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  return (
    <section className="w-screen">
      <div className="grid lg:grid-cols-[6fr_4fr]">
        <div className="bg-papaya-whip px-8 py-8 text-prussian-blue sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Gurmat Darbar
            </h2>
            <span className="rounded-full border border-prussian-blue/10 bg-bright-snow/65 px-4 py-1.5 font-accent text-lg italic text-prussian-blue dark:border-papaya-whip/15 dark:bg-prussian-blue dark:text-papaya-whip">
              Founder
            </span>
          </div>

          <div className="mt-5">
            <a
              href="https://gurmatdarbar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-prussian-blue/15 bg-bright-snow/75 px-4 py-2 font-description text-sm font-medium text-prussian-blue transition hover:-translate-y-0.5 hover:border-sky-surge hover:text-sky-surge dark:border-papaya-whip/20 dark:bg-prussian-blue dark:text-papaya-whip dark:hover:border-sky-surge dark:hover:text-sky-surge"
            >
              gurmatdarbar.com
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-7 max-w-3xl font-description text-base leading-8 text-prussian-blue/80 dark:text-papaya-whip/84 sm:text-lg">
            Building the biggest digital ecosystem for the Sikh community. I engineered a Full-Stack platform to solve event discovery and data fragmentation using modern AI pipelines.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.title}
                  className="rounded-[1.5rem] bg-bright-snow p-5 text-prussian-blue shadow-[0_12px_32px_rgba(11,15,25,0.08)] dark:bg-prussian-blue dark:text-papaya-whip"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-surge/12 dark:bg-papaya-whip/10 dark:text-papaya-whip">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-heading text-lg font-semibold leading-snug">
                    {stat.title}
                  </p>
                  <p className="mt-2 font-description text-sm leading-6 text-prussian-blue/72 dark:text-papaya-whip/72">
                    {stat.detail}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {techStack.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-prussian-blue/12 bg-bright-snow/70 px-3.5 py-2 font-description text-xs uppercase tracking-[0.16em] text-prussian-blue dark:border-papaya-whip/15 dark:bg-prussian-blue dark:text-papaya-whip"
              >
                {chip}
              </span>
            ))}
          </div>

          <p className="mt-5 font-accent text-xl italic text-prussian-blue/85 dark:text-papaya-whip/85">
            Architecture focused on multilingual data extraction and auto-poster generation
          </p>
        </div>

        <div className="bg-bright-snow px-8 py-8 sm:px-8 sm:py-10 lg:px-8 lg:py-12 dark:bg-ink-black flex flex-col items-center justify-center gap-6">
          <Image
            src="/gurmatdarbar_logo.png"
            alt="Gurmat Darbar logo"
            width={200}
            height={1000}
            className={`px-4 py-2 object-cover bg-papaya-whip rounded-xl border-2  ${isDarkTheme ? 'border-papaya-whip' : 'border-prussian-blue'}`}
          />
          <Image
            src="/gurmatdarbar.png"
            alt="Gurmat Darbar platform preview"
            width={800}
            height={1000}
            className={`w-full object-cover rounded-xl border-2 ${isDarkTheme ? 'border-papaya-whip' : 'border-prussian-blue'}`}
          />
        </div>
      </div>
    </section>
  );
}
