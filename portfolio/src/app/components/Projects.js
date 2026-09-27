"use client";

import Image from "next/image";
import { ArrowUpRight, Zap } from "lucide-react";
import { useReducedMotion } from "framer-motion";

const themes = {
  brand: { wrapper: "bg-sky-surge text-ink-black", body: "text-ink-black/80", pointer: "bg-bright-snow text-ink-black", chip: "border-ink-black/20", button: "bg-ink-black text-bright-snow" },
  accent: { wrapper: "bg-papaya-whip text-prussian-blue", body: "text-prussian-blue/82", pointer: "bg-bright-snow text-prussian-blue", chip: "border-prussian-blue/18", button: "bg-prussian-blue text-bright-snow" },
  surface: { wrapper: "bg-bright-snow text-prussian-blue dark:bg-ink-black dark:text-bright-snow", body: "text-prussian-blue/78 dark:text-bright-snow/78", pointer: "bg-papaya-whip text-ink-black", chip: "border-prussian-blue/16 dark:border-bright-snow/16", button: "bg-prussian-blue text-bright-snow dark:bg-bright-snow dark:text-ink-black" },
};

function ProjectCard({ project, index, sticky }) {
  const theme = themes[project.theme] || themes.surface;
  const primary = project.links[0];
  return (
    <article style={sticky ? { top: `${7 + index * 1.15}rem` } : undefined} className={`${sticky ? "project-stack-card lg:sticky lg:min-h-[calc(100vh-8rem)]" : ""} ${theme.wrapper} grid grid-cols-1 items-center gap-7 rounded-t-[2rem] border border-black/10 p-7 shadow-[0_-18px_45px_rgba(11,15,25,0.12)] sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-12`}>
      <div className={index % 2 ? "lg:order-2" : ""}><div className="aspect-video overflow-hidden rounded-[1.5rem] border-2 border-current shadow-lg"><Image src={project.image} alt={`${project.name} preview`} width={1200} height={675} className="h-full w-full object-cover" /></div></div>
      <div className={index % 2 ? "lg:order-1" : ""}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{project.name}</h3>{project.subtitle && <p className="mt-1 font-accent text-xl italic opacity-70">{project.subtitle}</p>}</div>{project.links.find((link) => link.label === "Live") && <a href={project.links.find((link) => link.label === "Live").href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-bright-snow/75 px-4 py-2 text-sm text-prussian-blue">Live <ArrowUpRight className="h-4 w-4" /></a>}</div>
        <p className={`mt-6 font-description text-base leading-8 sm:text-lg ${theme.body}`}>{project.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{project.bullets.slice(0, 2).map((pointer) => <div key={pointer} className={`rounded-2xl px-4 py-3 shadow-md ${theme.pointer}`}><p className="flex gap-2 font-accent italic leading-6"><Zap className="mt-1 h-4 w-4 shrink-0" />{pointer}</p></div>)}</div>
        <div className="mt-6 flex flex-wrap gap-2">{project.skills.map((skill) => <span key={skill} className={`rounded-full border px-3 py-1.5 font-description text-xs uppercase tracking-[0.15em] ${theme.chip}`}>{skill}</span>)}</div>
        {primary && <a href={primary.href} target="_blank" rel="noreferrer" className={`mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-heading text-sm font-semibold ${theme.button}`}>{primary.label}<ArrowUpRight className="h-4 w-4" /></a>}
      </div>
    </article>
  );
}

export default function Projects({ projects }) {
  const reduceMotion = useReducedMotion();
  return (
    <section id="projects" className="section-anchor relative w-full bg-bright-snow pt-12 dark:bg-ink-black">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="sticky top-0 z-30 bg-bright-snow/90 px-4 py-7 backdrop-blur dark:bg-ink-black/90 sm:px-6"><h2 className="text-center font-accent text-5xl font-bold italic tracking-tight text-prussian-blue dark:text-bright-snow sm:text-6xl lg:text-7xl">Projects</h2></div>
        <div className="space-y-5 px-2 pb-16 sm:px-4 lg:space-y-0">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} sticky={!reduceMotion} />)}</div>
      </div>
    </section>
  );
}
