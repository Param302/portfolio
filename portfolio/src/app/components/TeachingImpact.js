"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { allFeedbacks, impactStats } from "@/app/data/teachingImpactData";
import usePortraitStack from "./usePortraitStack";
import stackStyles from "./PortraitStack.module.css";

function FeedbackRow({ direction, items, duration }) {
  const reduceMotion = useReducedMotion();
  const doubled = [...items, ...items];
  const cardStyles = [
    "bg-papaya-whip text-prussian-blue dark:bg-papaya-whip dark:text-ink-black",
    "bg-sky-surge/15 text-prussian-blue dark:bg-sky-surge/20 dark:text-bright-snow",
    "bg-prussian-blue text-bright-snow dark:bg-prussian-blue dark:text-bright-snow",
    "bg-bright-snow text-prussian-blue dark:bg-alice-blue/10 dark:text-bright-snow",
  ];

  return (
    <div className="overflow-hidden" aria-hidden="true">
      <motion.div
        className="flex w-max gap-4"
        animate={reduceMotion ? { x: 0 } : direction === "left" ? { x: ["0%", "-50%"] } : { x: ["-50%", "0%"] }}
        transition={reduceMotion ? undefined : { duration, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      >
        {doubled.map((item, index) => (
          <article key={`${direction}-${index}`} className={`flex h-28 w-[260px] shrink-0 items-center rounded-[1.4rem] px-5 py-4 text-sm leading-6 shadow-sm sm:w-[310px] ${cardStyles[index % cardStyles.length]}`}>
            <p className="line-clamp-3">{item}</p>
          </article>
        ))}
      </motion.div>
    </div>
  );
}

export default function TeachingImpact({ subscriberLabel = "4K" }) {
  const statsRef = usePortraitStack();
  const rows = [
    allFeedbacks.filter((_, index) => index % 3 === 0),
    allFeedbacks.filter((_, index) => index % 3 === 1),
    allFeedbacks.filter((_, index) => index % 3 === 2),
  ];

  return (
    <section id="teaching" className="w-full bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-accent text-5xl font-bold italic tracking-tight text-prussian-blue dark:text-bright-snow sm:text-6xl lg:text-7xl">Teaching</h2>
          <p className="mt-4 font-description text-base leading-7 text-prussian-blue/70 dark:text-bright-snow/70 sm:text-lg">Python, machine learning, revision marathons, and the kind of teaching that turns exam fear into momentum.</p>
        </div>

        <div className="group relative mt-8 overflow-hidden rounded-[2rem] border border-prussian-blue/10 shadow-[0_18px_55px_rgba(26,34,53,0.14)] sm:mt-10 sm:min-h-[355px]">
          <div className="absolute -inset-[12%] -rotate-[5deg] scale-[1.18] transition duration-700 ease-out group-hover:-rotate-[7deg] group-hover:scale-[1.24]">
            <Image src="/yt-channel.png" alt="" fill sizes="100vw" className="object-cover dark:hidden" />
            <Image src="/yt-channel-dark.png" alt="" fill sizes="100vw" className="hidden object-cover dark:block" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-bright-snow/95 via-bright-snow/95 to-bright-snow/80 dark:from-ink-black/95 dark:via-ink-black/95 dark:to-ink-black/80 sm:bg-gradient-to-r sm:from-bright-snow/95 sm:via-bright-snow/90 sm:to-bright-snow/30 sm:dark:from-ink-black/95 sm:dark:via-ink-black/90 sm:dark:to-ink-black/40" />
          <div className="relative z-10 flex flex-col justify-between gap-5 p-5 sm:min-h-[355px] sm:gap-7 sm:p-9 lg:flex-row lg:items-center lg:p-12">
            <div className="flex max-w-3xl items-start gap-4 sm:gap-7">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center sm:h-28 sm:w-28">
                <Image src="/socials/youtube.png" alt="YouTube" width={76} height={76} className="h-11 w-11 object-contain sm:h-20 sm:w-20" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-ink-black dark:text-bright-snow sm:text-4xl">Parampreet Singh</h3>
                <p className="mt-1 font-description text-base text-prussian-blue/75 dark:text-bright-snow/75">@Param3021</p>
                <p className="mt-3 w-fit rounded-full bg-ink-black px-4 py-2 font-heading text-sm font-semibold text-papaya-whip shadow-lg dark:bg-papaya-whip dark:text-ink-black sm:mt-4 sm:px-5 sm:text-lg">Subscribers: {subscriberLabel}</p>
                <p data-teaching-description className="mt-4 hidden max-w-2xl font-description text-sm leading-7 text-ink-black/80 dark:text-bright-snow/80 sm:block sm:text-base">Covers Python from basics to advanced, machine learning, revision sessions, course guidance, and project guidance videos.</p>
              </div>
            </div>
            <a href="https://www.youtube.com/@Param3021" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-prussian-blue px-5 py-3 font-heading text-sm font-semibold text-bright-snow transition hover:-translate-y-0.5 hover:bg-ink-black dark:bg-sky-surge dark:text-ink-black">View Channel <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </div>

        <div ref={statsRef} data-teaching-stats className={`${stackStyles.stack} mt-6 grid min-w-0 gap-4 sm:mt-8 md:grid-cols-3`}>
          {impactStats.map((stat, index) => {
            const cardClasses = [
              "border border-alice-blue bg-bright-snow text-prussian-blue",
              "border border-prussian-blue bg-prussian-blue text-bright-snow",
              "border border-prussian-blue/70 bg-ink-black text-bright-snow",
            ];
            const mutedClasses = ["text-prussian-blue/70", "text-bright-snow/78", "text-bright-snow/78"];
            const descriptions = [
              "Concept-first teaching that helps learners move from basics to confidence.",
              "Regular live sessions covering Python, Machine Learning, and revision support.",
              "Real learner appreciation from doubt-solving, project guidance, and mentorship.",
            ];
            return (
              <article key={stat.label} data-stack-card style={{ "--stack-index": index }} className={`min-w-0 rounded-3xl px-5 py-4 shadow-[0_14px_34px_rgba(11,15,25,0.08)] sm:py-5 ${cardClasses[index]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading text-4xl font-extrabold">{stat.value}</p>
                    <p className={`mt-1 font-description text-xs uppercase tracking-[0.16em] ${mutedClasses[index]}`}>{stat.label}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-papaya-whip px-3 py-1 font-accent text-base italic">{index === 0 ? "Reach" : index === 1 ? "Live" : "Love"}</span>
                </div>
                <p className={`mt-3 font-accent text-base italic leading-6 ${mutedClasses[index]}`}>{descriptions[index]}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-24 text-center sm:mt-28">
          <p className="font-accent text-4xl italic text-prussian-blue/85 dark:text-bright-snow/85 sm:text-5xl">Wall of Fame</p>
          <div className="mx-auto mt-4 h-px w-full max-w-3xl bg-prussian-blue/18 dark:bg-bright-snow/16" />
        </div>
        <div className="impact-carousel-mask mt-8 space-y-4 pb-10">
          {rows.map((items, index) => <FeedbackRow key={index} direction={index === 1 ? "left" : "right"} items={items.slice(0, 12)} duration={48 + index * 6} />)}
        </div>
        <div className="flex justify-center">
          <Link href="/walloffame" className="inline-flex min-h-14 items-center justify-center rounded-full bg-prussian-blue px-8 py-4 font-heading text-base font-semibold text-bright-snow shadow-[0_16px_34px_rgba(26,34,53,0.2)] transition hover:-translate-y-0.5 hover:bg-ink-black dark:bg-sky-surge dark:text-ink-black">View All Feedbacks <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
