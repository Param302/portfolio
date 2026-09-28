"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Zap } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/app/ThemeContext";
import styles from "./Projects.module.css";

import { projects } from "@/app/data/projects";

function projectTheme(theme) {
  if (theme === "brand") {
    return {
      wrapper: "bg-sky-surge text-ink-black",
      title: "text-ink-black",
      body: "text-ink-black/80",
      pointer: "bg-bright-snow text-ink-black",
      chip: "border-ink-black/20 text-ink-black",
      button: "bg-ink-black text-bright-snow hover:bg-prussian-blue",
    };
  }
  if (theme === "accent") {
    return {
      wrapper: "bg-papaya-whip text-prussian-blue",
      title: "text-prussian-blue",
      body: "text-prussian-blue/82",
      pointer: "bg-bright-snow text-prussian-blue",
      chip: "border-prussian-blue/18 text-prussian-blue",
      button: "bg-prussian-blue text-bright-snow hover:bg-ink-black",
    };
  }
  return {
    wrapper: "bg-bright-snow text-prussian-blue dark:bg-ink-black dark:text-bright-snow",
    title: "text-prussian-blue dark:text-bright-snow",
    body: "text-prussian-blue/78 dark:text-bright-snow/78",
    pointer: "bg-papaya-whip text-ink-black",
    chip: "border-prussian-blue/16 text-prussian-blue dark:border-bright-snow/16 dark:text-bright-snow",
    button: "bg-prussian-blue text-bright-snow hover:bg-ink-black dark:bg-bright-snow dark:text-ink-black dark:hover:bg-papaya-whip",
  };
}

function ProjectBlock({ project, index, isDarkTheme }) {
  const theme = projectTheme(project.theme);
  const isEven = index % 2 === 1;
  const imageOrderClass = isEven ? "order-1 lg:order-2" : "order-1 lg:order-1";
  const contentOrderClass = isEven ? "order-2 lg:order-1" : "order-2 lg:order-2";

  return (
    <article
      id={project.id}
      data-stack-card
      style={{ "--stack-index": index }}
      className={`${styles.card} relative grid w-full grid-cols-1 overflow-hidden border border-black/10 ${theme.wrapper}`}
    >
      <div className={`${styles.image} ${imageOrderClass}`}>
        <div className={`${styles.imageFrame} overflow-hidden border-2 shadow-lg ${isDarkTheme ? "border-bright-snow" : "border-ink-black"}`}>
          <Image src={project.image} alt={`${project.name} preview`} width={1200} height={675} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full rounded-[1.1rem] object-cover" />
        </div>
      </div>

      <div className={`${styles.content} ${contentOrderClass} flex flex-col`}>
        <div className={styles.cardHeader}>
          <h3 className={`${styles.title} font-heading font-bold tracking-tight ${theme.title}`}>{project.name}</h3>
          {project.live ? (
            <a href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name} live site`} className={`${styles.liveLink} inline-flex w-fit items-center gap-2 rounded-full border border-prussian-blue/15 bg-bright-snow/75 font-description font-medium text-prussian-blue transition hover:-translate-y-0.5 hover:border-sky-surge hover:text-sky-surge`}>
              <span className={styles.liveLabel}>getreadmewithme.vercel.app</span> <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
        <p className={`${styles.description} font-description ${theme.body}`}>{project.description}</p>
        <div className={styles.pointers}>
          {project.pointers.map((pointer) => (
            <article key={pointer} className={`${styles.pointer} rounded-2xl shadow-md ${theme.pointer}`}>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-fit shrink-0 items-center justify-center rounded-xl bg-transparent text-ink-black"><Zap className="h-4 w-4" /></span>
                <p className={`${styles.pointerText} font-accent font-medium italic`}>{pointer}</p>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.skills}>
          {project.skills.map((skill) => <span key={skill} className={`rounded-full border px-3 py-1.5 font-description text-xs uppercase tracking-[0.18em] ${theme.chip}`}>{skill}</span>)}
        </div>
        <div className={styles.actions}>
          <a href={project.repo} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-3 rounded-full px-3 py-3 pr-6 font-heading text-base font-semibold transition ${theme.button}`}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bright-snow"><Image src="/optimized/socials/github.webp" alt="GitHub" width={20} height={20} className="h-5 w-5" /></span>
            Github
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  const [contactApproaching, setContactApproaching] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setContactApproaching(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className={`${styles.section} section-anchor relative isolate w-full bg-bright-snow dark:bg-ink-black`}>
      <div className={`${styles.heading} ${contactApproaching ? styles.headingHidden : ""} bg-bright-snow dark:bg-ink-black`}>
        <h2 className={`${styles.headingTitle} text-center font-accent font-bold italic tracking-tight text-prussian-blue dark:text-bright-snow`}>Projects</h2>
      </div>
      <div className={`${styles.stack} w-full`}>
        {projects.map((project, index) => (
          <ProjectBlock key={project.name} project={project} index={index} isDarkTheme={isDarkTheme} />
        ))}
      </div>
    </section>
  );
}
