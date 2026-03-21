"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { feedbacks, impactStats } from "@/app/data/teachingImpactData";

function FeedbackRow({ direction, items, duration }) {
  const shouldReduceMotion = useReducedMotion();
  const duplicatedItems = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex w-max gap-4"
        animate={
          shouldReduceMotion
            ? { x: 0 }
            : direction === "left"
              ? { x: ["0%", "-50%"] }
              : { x: ["-50%", "0%"] }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
              duration,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }
        }
      >
        {duplicatedItems.map((item, index) => (
          <article
            key={`${direction}-${index}-${item.slice(0, 18)}`}
            className="w-[240px] shrink-0 rounded-[1.4rem] bg-bright-snow px-4 py-3 text-sm leading-6 text-prussian-blue dark:bg-prussian-blue dark:text-bright-snow sm:w-[280px] lg:w-[320px]"
          >
            {item}
          </article>
        ))}
      </motion.div>
    </div>
  );
}

export default function TeachingImpact() {
  return (
    <section className="w-full bg-papaya-whip py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-prussian-blue sm:text-5xl lg:text-6xl">
            Teaching Impact
          </h2>
          <p className="mt-4 font-accent italic text-md leading-7 text-prussian-blue/70 sm:text-lg">
            Python, machine learning, revision marathons, and the kind of teaching that turns exam fear into momentum.
          </p>
        </div>

        <div className="group mt-10 overflow-hidden rounded-[2rem] border border-bright-snow/45 shadow-[0_16px_50px_rgba(26,34,53,0.12)]">
          <div className="relative h-fit w-full sm:h-fit">
            <div className="absolute inset-0 overflow-hidden">
              <div className="relative h-full w-full scale-[1.14] -rotate-2 translate-x-[-4%] blur-[1.5px] transition duration-500 ease-out group-hover:scale-[1.2] group-hover:-rotate-3 group-hover:translate-x-[-8%] group-hover:translate-y-[2%] group-hover:blur-[2.5px]">
                <Image
                  src="/yt-channel.png"
                  alt=""
                  fill
                  className="object-cover dark:hidden"
                  sizes="100vw"
                />
                <Image
                  src="/yt-channel-dark.png"
                  alt=""
                  fill
                  className="hidden object-cover dark:block"
                  sizes="100vw"
                />
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-prussian-blue/84 via-prussian-blue/66 to-prussian-blue/34 dark:from-ink-black/86 dark:via-ink-black/66 dark:to-ink-black/38" />
            <div className="absolute inset-y-0 left-0 w-[74%] bg-gradient-to-r from-prussian-blue/58 via-prussian-blue/36 to-transparent dark:from-ink-black/62 dark:via-ink-black/38" />

            <div className="relative z-10 flex flex-col md:flex-row items-start gap-3 md:gap-6 h-full p-5 sm:p-6 lg:p-7">
              {/* View Channel button - on top for mobile, top-right for desktop */}
              <div className="w-full md:w-auto md:absolute md:top-6 md:right-6 lg:top-7 lg:right-7 flex-shrink-0">
                <a
                  href="https://www.youtube.com/@Param3021"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full md:w-auto justify-center md:justify-start items-center gap-2 rounded-full bg-prussian-blue px-5 py-2.5 font-heading text-sm font-semibold text-bright-snow transition hover:-translate-y-0.5 hover:bg-ink-black dark:bg-sky-surge dark:text-ink-black dark:hover:bg-[#36c3e8]"
                >
                  View Channel
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              {/* YouTube details - below button on mobile, left side on desktop */}
              <div className="flex flex-1 w-full md:flex-1 items-center gap-4 sm:gap-6 md:mt-0 md:pr-32">
                <div className="min-w-24 flex gap-4 max-w-3xl rounded-2xl border border-bright-snow/26 bg-bright-snow dark:bg-ink-black px-3 py-3 text-left shadow-lg backdrop-blur-[2px] dark:border-papaya-whip dark:bg-ink-black sm:px-4">
                  <div className="inline-flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28">
                    <Image
                      src="/socials/youtube.png"
                      alt="YouTube"
                      width={60}
                      height={60}
                      className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                    />
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-bold text-ink-black dark:text-bright-snow [text-shadow:0_2px_10px_rgba(0,0,0,0.35)] sm:text-3xl lg:text-[2rem]">
                      Parampreet Singh
                    </p>
                    <p className="mt-0.5 font-description text-sm text-bright-snow/92 [text-shadow:0_2px_10px_rgba(0,0,0,0.35)] sm:text-base">
                      @Param3021
                    </p>
                    <p className="mt-3 w-fit px-5 py-2 rounded-full font-heading text-base font-semibold bg-ink-black text-papaya-whip dark:bg-papaya-whip dark:text-ink-black sm:text-lg shadow-lg">
                      Subscribers: 3.92k
                    </p>
                    <p className="mt-2 max-w-2xl font-description text-sm leading-6 text-ink-black dark:text-bright-snow sm:leading-7">
                      Covers full Python - Basic to Advanced, full Machine Learning, Revision sessions, Course guidance, project guidance videos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {impactStats.map((stat, index) => {
            const cardClasses = [
              "border border-alice-blue bg-bright-snow text-prussian-blue",
              "border border-prussian-blue bg-prussian-blue text-bright-snow",
              "border border-prussian-blue/70 bg-ink-black text-bright-snow",
            ];

            const labelClasses = [
              "text-prussian-blue/70",
              "text-bright-snow/78",
              "text-bright-snow/78",
            ];

            return (
              <article
                key={stat.label}
                className={`rounded-[1.9rem] px-5 py-6 shadow-[0_14px_34px_rgba(11,15,25,0.08)] ${cardClasses[index]}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-heading text-4xl font-extrabold sm:text-5xl">{stat.value}</p>
                    <p className={`mt-2 font-description text-sm uppercase tracking-[0.22em] ${labelClasses[index]}`}>
                      {stat.label}
                    </p>
                  </div>
                  <span className="rounded-full border-2 border-papaya-whip px-5 py-1 font-accent text-lg italic">
                    {index === 0 ? "Reach" : index === 1 ? "Live" : "Love"}
                  </span>
                </div>
                <p className={`mt-5 font-description text-sm leading-6 ${labelClasses[index]}`}>
                  {index === 0
                    ? "Concept-first teaching that helps learners move from basics to confidence."
                    : index === 1
                      ? "Regular live sessions covering Python, Machine Learning, and revision support."
                      : "Real learner appreciation from doubt-solving, project guidance, and mentorship."}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="font-accent text-4xl italic text-prussian-blue/85 sm:text-5xl">
            Wall of Love
          </p>
          <div className="mx-auto mt-4 h-px w-full max-w-3xl bg-prussian-blue/18" />
        </div>

        <div className="impact-carousel-mask mt-8 space-y-4 pb-10">
          <FeedbackRow direction="right" items={feedbacks.row1} duration={48} />
          <FeedbackRow direction="left" items={feedbacks.row2} duration={54} />
          <FeedbackRow direction="right" items={feedbacks.row3} duration={60} />
        </div>

        <div className="-mt-2 flex justify-center">
          <Link
            href="/walloffame"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-prussian-blue px-8 py-4 font-heading text-base font-semibold text-bright-snow shadow-[0_16px_34px_rgba(26,34,53,0.2)] transition hover:-translate-y-0.5 hover:bg-ink-black"
          >
            View All Feedbacks
          </Link>
        </div>
      </div>
    </section>
  );
}
