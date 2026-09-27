"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";

export default function Work({ experiences }) {
  return (
    <section id="work" className="section-anchor bg-background px-4 py-16 sm:px-8 sm:py-20 lg:px-0">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 font-accent text-5xl font-bold italic tracking-tight text-prussian-blue dark:text-bright-snow sm:text-6xl lg:text-7xl">Work Experience</h2>
        <div className="relative sm:pl-8">
          <div className="absolute bottom-0 left-3 top-0 hidden w-px bg-alice-blue dark:bg-prussian-blue sm:block" />
          <div className="space-y-5">
            {experiences.map((experience, index) => (
              <motion.article key={experience.id} initial={{ opacity: 0, y: 40, rotateX: 6 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.05 }} className="relative rounded-[1.75rem] border border-alice-blue bg-white p-6 shadow-[0_12px_32px_rgba(11,15,25,0.04)] dark:border-alice-blue/10 dark:bg-prussian-blue sm:p-7">
                <span className="absolute left-[-1.92rem] top-8 hidden h-4 w-4 rounded-full border-2 border-sky-surge bg-bright-snow dark:bg-ink-black sm:inline-flex" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-heading text-2xl font-bold tracking-tight text-prussian-blue dark:text-bright-snow">{experience.role}</h3>
                    {experience.link ? <a href={experience.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-description text-base font-medium text-prussian-blue/72 transition hover:text-sky-surge dark:text-bright-snow/72">{experience.company}<ArrowUpRight className="h-4 w-4" /></a> : <p className="mt-1 font-description text-base font-medium text-prussian-blue/72 dark:text-bright-snow/72">{experience.company}</p>}
                  </div>
                  <p className="font-accent text-xl italic text-[#b56e38] dark:text-papaya-whip">{experience.dates}</p>
                </div>
                <div className="mt-5 space-y-3">
                  {experience.bullets.map((point) => <div key={point} className="flex gap-3"><span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-surge/12 text-sky-surge"><Plus className="h-3.5 w-3.5" /></span><p className="font-description text-sm leading-7 text-prussian-blue/78 dark:text-bright-snow/78 sm:text-[0.96rem]">{point}</p></div>)}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
