"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { allFeedbacks, impactStats } from "@/app/data/teachingImpactData";

function FeedbackRow({ direction, items, duration }) {
  const reduceMotion = useReducedMotion();
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden" aria-hidden="true">
      <motion.div className="flex w-max gap-4" animate={reduceMotion ? { x: 0 } : direction === "left" ? { x: ["0%", "-50%"] } : { x: ["-50%", "0%"] }} transition={reduceMotion ? undefined : { duration, ease: "linear", repeat: Infinity }}>
        {doubled.map((item, index) => <article key={`${direction}-${index}`} className="w-[250px] shrink-0 rounded-[1.4rem] bg-bright-snow px-4 py-3 text-sm leading-6 text-prussian-blue dark:bg-prussian-blue dark:text-bright-snow sm:w-[300px]">{item}</article>)}
      </motion.div>
    </div>
  );
}

export default function TeachingImpact({ subscriberLabel = "4K" }) {
  const rows = [allFeedbacks.filter((_, i) => i % 3 === 0), allFeedbacks.filter((_, i) => i % 3 === 1), allFeedbacks.filter((_, i) => i % 3 === 2)];
  return (
    <div className="mt-16">
      <div className="mx-auto max-w-4xl text-center"><h3 className="font-heading text-4xl font-extrabold tracking-tight text-prussian-blue sm:text-5xl">Teaching Impact</h3><p className="mt-4 font-accent text-lg italic text-prussian-blue/70">Python, machine learning, revision marathons, and practical mentorship.</p></div>
      <div className="group relative mt-10 overflow-hidden rounded-[2rem] border border-bright-snow/45 shadow-[0_16px_50px_rgba(26,34,53,0.12)]">
        <Image src="/yt-channel.png" alt="" fill sizes="100vw" className="object-cover dark:hidden" />
        <Image src="/yt-channel-dark.png" alt="" fill sizes="100vw" className="hidden object-cover dark:block" />
        <div className="absolute inset-0 bg-gradient-to-r from-prussian-blue/90 via-prussian-blue/72 to-prussian-blue/45 dark:from-ink-black/92 dark:via-ink-black/75" />
        <div className="relative z-10 flex flex-col gap-5 p-6 text-bright-snow sm:flex-row sm:items-center sm:justify-between lg:p-8">
          <div><p className="font-heading text-3xl font-bold">Parampreet Singh</p><p className="mt-1 font-description opacity-85">@Param3021</p><p className="mt-4 w-fit rounded-full bg-papaya-whip px-5 py-2 font-heading text-lg font-semibold text-ink-black">{subscriberLabel} subscribers</p></div>
          <a href="https://www.youtube.com/@Param3021" target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-surge px-5 py-3 font-heading text-sm font-semibold text-ink-black">View Channel <ArrowUpRight className="h-4 w-4" /></a>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {impactStats.map((stat, index) => <article key={stat.label} className={`rounded-[1.9rem] border px-5 py-6 shadow-[0_14px_34px_rgba(11,15,25,0.08)] ${index === 0 ? "border-alice-blue bg-bright-snow text-prussian-blue" : "border-prussian-blue bg-prussian-blue text-bright-snow"}`}><p className="font-heading text-4xl font-extrabold sm:text-5xl">{stat.value}</p><p className="mt-2 font-description text-sm uppercase tracking-[0.2em] opacity-70">{stat.label}</p></article>)}
      </div>
      <div className="mt-12 text-center"><p className="font-accent text-4xl italic text-prussian-blue/85 sm:text-5xl">Wall of Fame</p><p className="mx-auto mt-3 max-w-2xl font-description text-sm leading-7 text-prussian-blue/70">Hundreds of moments of confidence, clarity, and encouragement from learners.</p></div>
      <div className="impact-carousel-mask mt-8 space-y-4 pb-10">{rows.map((items, index) => <FeedbackRow key={index} direction={index === 1 ? "left" : "right"} items={items.slice(0, 12)} duration={48 + index * 6} />)}</div>
      <div className="flex justify-center"><Link href="/walloffame" className="inline-flex min-h-14 items-center justify-center rounded-full bg-prussian-blue px-8 py-4 font-heading text-base font-semibold text-bright-snow shadow-[0_16px_34px_rgba(26,34,53,0.2)] transition hover:-translate-y-0.5 hover:bg-ink-black">Explore every note <ArrowUpRight className="ml-2 h-4 w-4" /></Link></div>
    </div>
  );
}
