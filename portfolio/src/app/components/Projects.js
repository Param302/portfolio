"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Github, ImageIcon, Zap } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/app/ThemeContext";
import { optimizedImage } from "@/lib/optimized-image";
import { plainResumeText } from "@/lib/resume-inline";
import { getProjectTheme, projectForDisplay, projectLinkLabel } from "@/lib/project-themes";
import styles from "./Projects.module.css";

import { projects as defaultProjects } from "@/app/data/projects";

function ProjectImage({ project, preview }) {
  const [failedSource, setFailedSource] = useState("");
  const candidate = project.image?.trim() || "";
  const validSource = /^\/(?!\/)/.test(candidate) || /^https?:\/\//.test(candidate);
  const source = validSource ? optimizedImage(candidate) : "";
  return (
    <div className={styles.imageFrame}>
      {source && failedSource !== source ? (
        <Image src={source} alt={`${project.name} preview`} width={1200} height={675} sizes={preview ? "(min-width: 1280px) 36vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"} unoptimized={!source.startsWith("/")} onError={() => setFailedSource(source)} className={styles.projectImage} />
      ) : (
        <div className={styles.imagePlaceholder}><ImageIcon aria-hidden="true" /><span>{candidate ? "Image unavailable" : "Add a project image"}</span></div>
      )}
    </div>
  );
}

export function ProjectBlock({ project: source, index = 0, theme: mode = "light", preview = false }) {
  const project = projectForDisplay(source);
  const { colors } = getProjectTheme(project.theme, mode, project.gradient);
  const variables = Object.fromEntries(Object.entries(colors).map(([key, value]) => [`--project-${key}`, value]));
  const remainingLinks = project.links.filter((link) => link !== project.liveLink);

  return (
    <article
      id={preview ? undefined : project.id}
      data-stack-card={preview ? undefined : true}
      data-project-theme={project.theme}
      data-content-backdrop={colors.content && colors.content !== "transparent" ? true : undefined}
      style={{ "--stack-index": index, ...variables }}
      className={`${styles.card} ${index % 2 === 1 ? styles.reversed : ""}`}
    >
      <div className={styles.image}><ProjectImage project={project} preview={preview} /></div>
      <div className={styles.content}>
        <div className={styles.cardHeader}>
          <h3 className={`${styles.title} font-heading font-bold tracking-tight`}>{project.name || "Untitled project"}</h3>
          {project.liveLink ? (
            <a href={project.liveLink.href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name || "project"}: ${project.liveLink.label}`} className={`${styles.liveLink} font-description`}>
              <span className={styles.liveLabel}>{projectLinkLabel(project.liveLink.href)}</span><ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </a>
          ) : null}
        </div>
        {project.description ? <p className={`${styles.description} font-description`}>{plainResumeText(project.description)}</p> : null}
        {project.pointers.length ? <div className={styles.pointers}>
          {project.pointers.map((pointer, pointIndex) => (
            <div key={pointIndex} className={styles.pointer}>
              <Zap aria-hidden="true" className="h-4 w-4 shrink-0" />
              <p className={`${styles.pointerText} font-accent font-medium italic`}>{plainResumeText(pointer)}</p>
            </div>
          ))}
        </div> : null}
        {project.skills.length ? <div className={styles.skills}>
          {project.skills.map((skill, skillIndex) => <span key={skillIndex} className="font-description">{plainResumeText(skill)}</span>)}
        </div> : null}
        {remainingLinks.length ? <div className={styles.actions}>
          {remainingLinks.map((link, linkIndex) => <a key={`${link.href}-${linkIndex}`} href={link.href} target="_blank" rel="noopener noreferrer" className="font-heading">
            {link.isRepository ? <Github aria-hidden="true" className="h-5 w-5" /> : <ArrowUpRight aria-hidden="true" className="h-5 w-5" />}
            {link.label}
          </a>)}
        </div> : null}
      </div>
    </article>
  );
}

export function ProjectsPreview({ projects = [], theme = "light" }) {
  return (
    <section aria-label="Homepage projects preview" data-preview-theme={theme} className={styles.preview}>
      <h2 className={`${styles.previewTitle} font-accent font-bold italic tracking-tight`}>Projects</h2>
      <div className={styles.previewStack}>
        {projects.map((project, index) => <ProjectBlock key={project.id || index} project={project} index={index} theme={theme} preview />)}
      </div>
    </section>
  );
}

export function projectStackFitsViewport(heights, viewportHeight, cardTop, step) {
  return heights.every((height, index) => height <= viewportHeight - cardTop - index * step - 22 + 1);
}

export default function Projects({ projects = defaultProjects }) {
  const { theme } = useTheme();
  const section = useRef(null);
  const [stackFits, setStackFits] = useState(false);
  const [contactApproaching, setContactApproaching] = useState(false);

  useEffect(() => {
    const root = section.current;
    if (!root || typeof ResizeObserver === "undefined") return undefined;
    const cards = [...root.querySelectorAll("[data-stack-card]")];
    let frame;
    const measure = () => {
      const style = window.getComputedStyle(root);
      const cardTop = parseFloat(style.getPropertyValue("--projects-card-top"));
      const step = parseFloat(style.getPropertyValue("--projects-stack-step"));
      setStackFits(projectStackFitsViewport(cards.map((card) => card.getBoundingClientRect().height), window.innerHeight, cardTop, step));
    };
    const schedule = () => { window.cancelAnimationFrame(frame); frame = window.requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    cards.forEach((card) => observer.observe(card));
    window.addEventListener("resize", schedule);
    schedule();
    return () => { observer.disconnect(); window.removeEventListener("resize", schedule); window.cancelAnimationFrame(frame); };
  }, [projects]);

  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setContactApproaching(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={section} id="projects" className={`${styles.section} ${stackFits ? "" : styles.naturalFlow} section-anchor relative isolate w-full bg-bright-snow dark:bg-ink-black`}>
      <div className={`${styles.heading} ${contactApproaching ? styles.headingHidden : ""} bg-bright-snow dark:bg-ink-black`}>
        <h2 className={`${styles.headingTitle} text-center font-accent font-bold italic tracking-tight text-prussian-blue dark:text-bright-snow`}>Projects</h2>
      </div>
      <div className={`${styles.stack} w-full`}>
        {projects.map((project, index) => <ProjectBlock key={project.id || index} project={project} index={index} theme={theme} />)}
      </div>
    </section>
  );
}
