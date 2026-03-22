"use client";

import { ArrowUpRight, Zap } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/app/ThemeContext";

const projects = [
  {
    name: "Pocket-Coder",
    theme: "surface",
    description:
      "A lightning-fast, 1.2B parameter local AI coding assistant designed to run flawlessly on CPUs and GPUs. Fine-tuned on a custom code-instruction dataset, it acts as a fully offline, zero-latency copilot inside Jupyter Notebooks and VS Code, completely bypassing cloud APIs.",
    pointers: [
      "Jupyter %%code Magic Command",
      "VS Code MCP Server Integration",
    ],
    skills: ["Finetuning", "SFT", "PEFT LoRA", "LFM 2.5", "Ollama", "MCP"],
    image: "/projects/pocket-coder.png",
    repo: "https://github.com/param302/pocket-coder",
  },
  {
    name: "GRWM - Get README With Me",
    theme: "brand",
    description:
      "A production-grade, multi-agent GenAI platform that autonomously generates highly personalized GitHub READMEs. Orchestrated using LangGraph, it features three specialized AI agents working in tandem. The system utilizes real-time Server-Sent Events (SSE) for fluid streaming and is deployed securely on GCP Cloud Run.",
    pointers: [
      "LangGraph Agent Orchestration",
      "100+ Unique Users in 16 Hours",
    ],
    skills: ["LangGraph", "FastAPI", "Next.js", "GCP", "SSE"],
    image: "/projects/grwm.png",
    repo: "https://github.com/param302/grwm",
    live: "https://getreadmewithme.vercel.app/",
  },
  {
    name: "Hand Gesture LNN",
    theme: "surface",
    description:
      "An exploratory deep learning research project implementing Liquid Neural Networks (LNNs) to handle 32-dimensional continuous-time motion data. By building custom Liquid Time-Constant (LTC) cells from scratch, the architecture improved temporal adaptability and significantly outperformed standard LSTMs.",
    pointers: [
      "Custom Liquid Time-Constant Cells",
      "+9.6% Accuracy vs standard LSTM",
    ],
    skills: ["RNNs", "LSTM", "Liquid Neural Networks (LNN)", "Time-Series Data"],
    image: "/projects/hand-gesture.png",
    repo: "https://github.com/param302/hand-gesture-lnn",
  },
  {
    name: "Quizzo-V2",
    theme: "accent",
    description:
      "A highly scalable, full-stack quiz management platform engineered with a robust asynchronous backend. It utilizes Redis and Celery for distributed background task queues to handle concurrent user loads, automating complex workflows like API rate limiting and dynamic certificate generation.",
    pointers: [
      "Redis & Celery Task Queues",
      "Automated Email & Certificates",
    ],
    skills: ["Flask", "Vue.js", "Redis", "Celery", "PostgreSQL"],
    image: "/projects/quizzo-v2.png",
    repo: "https://github.com/param302/quizzo-v2",
  },
];

function projectTheme(theme) {
  if (theme === "brand") {
    return {
      wrapper: "bg-sky-surge text-ink-black",
      title: "text-ink-black",
      body: "text-ink-black/80",
      pointer: "bg-bright-snow text-ink-black",
      chip: "border-ink-black/20 text-ink-black",
      button: "bg-ink-black text-bright-snow hover:bg-prussian-blue",
      // imageShell: "bg-bright-snow/24",
      accent: "bg-ink-black/18 text-ink-black",
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
      // imageShell: "bg-bright-snow/35 border-prussian-blue/12",
      accent: "bg-prussian-blue/10 text-prussian-blue",
    };
  }

  return {
    wrapper: "bg-bright-snow text-prussian-blue dark:bg-ink-black dark:text-bright-snow",
    title: "text-prussian-blue dark:text-bright-snow",
    body: "text-prussian-blue/78 dark:text-bright-snow/78",
    pointer:
      "bg-papaya-whip text-ink-black",
    chip:
      "border-prussian-blue/16 text-prussian-blue dark:border-bright-snow/16 dark:text-bright-snow",
    button:
      "bg-prussian-blue text-bright-snow hover:bg-ink-black dark:bg-bright-snow dark:text-ink-black dark:hover:bg-papaya-whip",
    imageShell:
      "bg-prussian-blue/6 border-prussian-blue/12 dark:bg-bright-snow/6 dark:border-bright-snow/10",
    accent: "bg-sky-surge/12 text-sky-surge",
  };
}

function ProjectBlock({ project, isEven, isDarkTheme }) {
  const theme = projectTheme(project.theme);
  const imageOrderClass = isEven ? "order-1 lg:order-2" : "order-1 lg:order-1";
  const contentOrderClass = isEven ? "order-2 lg:order-1" : "order-2 lg:order-2";

  return (
    <article className={`${theme.wrapper} grid min-h-full grid-cols-1 gap-7 p-8 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-12`}>
      <div className={imageOrderClass}>
        <div className={`aspect-video overflow-hidden rounded-[1.5rem] border-2 shadow-lg ${isDarkTheme ? "border-bright-snow" : "border-ink-black"}`}>
          <Image
            src={project.image}
            alt={`${project.name} preview`}
            width={1200}
            height={675}
            className="h-full w-full rounded-[1.1rem] object-cover"
          />
        </div>
      </div>

      <div className={`${contentOrderClass} flex flex-col`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className={`font-heading text-3xl font-bold tracking-tight sm:text-4xl ${theme.title}`}>
            {project.name}
          </h3>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-prussian-blue/15 bg-bright-snow/75 px-4 py-2 font-description text-sm font-medium text-prussian-blue transition hover:-translate-y-0.5 hover:border-sky-surge hover:text-sky-surge"
            >
              getreadmewithme.vercel.app
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>

        <p className={`mt-6 font-description text-base leading-8 sm:text-lg ${theme.body}`}>
          {project.description}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {project.pointers.map((pointer) => (
            <article
              key={pointer}
              className={`rounded-2xl px-4 py-2 shadow-md ${theme.pointer}`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex h-8 w-fit shrink-0 items-center justify-center rounded-xl bg-transparent text-ink-black ${theme.pointer}`}>
                  <Zap className="h-4 w-4" />
                </span>
                <p className="font-accent italic font-medium leading-6">{pointer}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {project.skills.map((skill) => (
            <span
              key={skill}
              className={`rounded-full border px-3 py-1.5 font-description text-xs uppercase tracking-[0.18em] ${theme.chip}`}
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-3 rounded-full px-3 pr-6 py-3 font-heading text-base font-semibold ${theme.button}`}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bright-snow">
              <Image
                src="/socials/github.png"
                alt="GitHub"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </span>
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

  return (
    <section id="projects" className="pt-12 bsection-anchor relative w-screen bg-bright-snow dark:bg-ink-black">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="px-4 sm:py-8 sm:px-6 lg:px-8">
          <h2 className="text-center font-accent text-5xl font-bold italic tracking-tight text-prussian-blue dark:text-bright-snow sm:text-6xl lg:text-7xl">
            Projects
          </h2>
        </div>

        <div className="space-y-0">
          {projects.map((project, index) => (
            <div key={project.name} className="w-full">
              <ProjectBlock project={project} isEven={index % 2 === 1} isDarkTheme={isDarkTheme} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
