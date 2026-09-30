"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { plainResumeText } from "@/lib/resume-inline";

export default function Work({ experiences }) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="work" className="section-anchor overflow-hidden bg-background px-4 py-16 sm:px-8 sm:py-20 lg:px-0 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center font-accent text-5xl font-bold italic tracking-tight text-prussian-blue dark:text-bright-snow sm:text-6xl lg:text-7xl">Work Experience</h2>
        <div className="relative">
          <div className="absolute bottom-5 left-4 top-5 hidden w-px bg-prussian-blue/18 dark:bg-bright-snow/18 sm:block" />
          <div className="space-y-6">
            {experiences.map((experience, index) => (
              <motion.div
                key={experience.id}
                initial={reduceMotion ? false : { opacity: 0, y: 72, rotate: index % 2 === 0 ? -2.4 : 2.4 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.7, delay: reduceMotion ? 0 : index * 0.085, ease: [0.22, 1, 0.36, 1] }}
                className="relative sm:pl-12"
              >
                <span className="absolute left-2 top-10 z-10 hidden h-4 w-4 rounded-full border-2 border-sky-surge bg-bright-snow dark:bg-ink-black sm:block" />
                <article className="group rounded-[1.75rem] border border-prussian-blue/12 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue dark:hover:border-sky-surge sm:p-7">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2 gap-y-1">
                    <h3 className="col-span-2 font-heading text-2xl font-bold tracking-tight text-prussian-blue dark:text-bright-snow sm:col-span-1">{experience.role}</h3>
                    <div className="col-start-1 row-start-2 min-w-0 font-description text-sm font-medium text-prussian-blue/72 dark:text-bright-snow/72 sm:text-base">
                      {experience.link ? <a href={experience.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition group-hover:text-sky-surge">{experience.company}<ArrowUpRight className="h-3.5 w-3.5 shrink-0" /></a> : <p>{experience.company}</p>}
                    </div>
                    <p className="col-start-2 row-start-2 whitespace-nowrap text-right font-accent text-sm italic text-[#945429] dark:text-papaya-whip sm:row-start-1 sm:text-xl">{experience.dates}</p>
                  </div>
                  <div className="mt-5 space-y-3">
                    {experience.bullets.map((point) => <div key={point} className="flex gap-3"><span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-surge/12 text-sky-surge transition group-hover:bg-sky-surge group-hover:text-ink-black"><Plus className="h-3.5 w-3.5" /></span><p className="font-description text-sm leading-7 text-prussian-blue/78 dark:text-bright-snow/78 sm:text-[0.96rem]">{plainResumeText(point)}</p></div>)}
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
