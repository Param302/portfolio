"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";

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
                <span className="absolute left-2 top-10 z-10 hidden h-4 w-4 rounded-full border-2 border-sky-surge bg-bright-snow shadow-[0_0_0_5px_rgba(27,182,224,0.10)] dark:bg-ink-black sm:block" />
                <article className="group rounded-[1.75rem] border border-prussian-blue/12 bg-white p-6 shadow-[0_12px_32px_rgba(11,15,25,0.04)] transition duration-300 hover:-translate-y-1 hover:border-sky-surge hover:shadow-[0_22px_55px_rgba(27,182,224,0.14)] dark:border-alice-blue/10 dark:bg-prussian-blue dark:hover:border-sky-surge sm:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-heading text-2xl font-bold tracking-tight text-prussian-blue dark:text-bright-snow">{experience.role}</h3>
                      {experience.link ? <a href={experience.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-description text-base font-medium text-prussian-blue/72 transition group-hover:text-sky-surge dark:text-bright-snow/72">{experience.company}<ArrowUpRight className="h-4 w-4" /></a> : <p className="mt-1 font-description text-base font-medium text-prussian-blue/72 dark:text-bright-snow/72">{experience.company}</p>}
                    </div>
                    <p className="shrink-0 font-accent text-xl italic text-[#b56e38] dark:text-papaya-whip">{experience.dates}</p>
                  </div>
                  <div className="mt-5 space-y-3">
                    {experience.bullets.map((point) => <div key={point} className="flex gap-3"><span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-surge/12 text-sky-surge transition group-hover:bg-sky-surge group-hover:text-ink-black"><Plus className="h-3.5 w-3.5" /></span><p className="font-description text-sm leading-7 text-prussian-blue/78 dark:text-bright-snow/78 sm:text-[0.96rem]">{point}</p></div>)}
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
