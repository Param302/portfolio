import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink, Home, Mail } from "lucide-react";

export const metadata = {
  title: "Parampreet Singh Resume",
  description:
    "Resume of Parampreet Singh, AI/ML Engineer focused on production-grade AI systems, SLM fine-tuning, multi-agent workflows, and scalable backends.",
  keywords: [
    "Parampreet Singh resume",
    "Param302 resume",
    "Param3021 resume",
    "AI engineer resume",
    "machine learning engineer resume",
    "itsparam.in resume",
  ],
  alternates: {
    canonical: "/resume",
  },
  openGraph: {
    title: "Resume | Parampreet Singh",
    description:
      "View Parampreet Singh's full resume: experience, projects, education, skills, and achievements.",
    url: "https://itsparam.in/resume",
    images: ["https://itsparam.in/og-image-square.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume | Parampreet Singh",
    description:
      "Parampreet Singh resume: AI/ML Engineer, projects, experience, and achievements.",
    images: ["https://itsparam.in/og-image-square.png"],
  },
};

const resumePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Parampreet Singh Resume",
  url: "https://itsparam.in/resume",
  description:
    "Resume page of Parampreet Singh featuring AI/ML experience, projects, education, skills, and achievements.",
  isPartOf: {
    "@type": "WebSite",
    name: "itsparam.in",
    url: "https://itsparam.in",
  },
  about: {
    "@type": "Person",
    name: "Parampreet Singh",
    alternateName: ["Param302", "Param3021", "@Param302", "@Param3021", "itsparam"],
    url: "https://itsparam.in",
    sameAs: [
      "https://github.com/Param302",
      "https://www.linkedin.com/in/param302",
      "https://www.youtube.com/@Param3021",
      "https://x.com/Param3021",
    ],
  },
};

const skills = {
  languages: ["Python", "JavaScript", "Java", "C", "SQL", "Bash", "HTML/CSS"],
  ml: [
    "PyTorch",
    "TensorFlow",
    "LangGraph",
    "LangChain",
    "U-Net",
    "Transformers",
    "Vertex AI",
  ],
  systems: [
    "Snowflake",
    "FastAPI",
    "Redis",
    "PostgreSQL",
    "GCP",
    "Firebase",
    "Cloud Run",
    "Docker",
    "Git",
  ],
};

const socialHandles = [
  { label: "GitHub", href: "https://github.com/Param302", display: "@Param302" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/param302", display: "/in/param302" },
  { label: "YouTube", href: "https://www.youtube.com/@Param3021", display: "@Param3021" },
  { label: "X", href: "https://x.com/Param3021", display: "@Param3021" },
];

function ResumeSection({ title, children }) {
  return (
    <section className="rounded-3xl border border-prussian-blue/10 bg-bright-snow/70 p-5 sm:p-7 dark:border-alice-blue/10 dark:bg-prussian-blue/35">
      <h2 className="font-heading text-xl font-semibold text-prussian-blue dark:text-bright-snow sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 font-description text-sm leading-7 text-prussian-blue/85 dark:text-bright-snow/80 sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resumePageSchema) }}
      />

      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <Link
          href="/"
          className="glass-card inline-flex items-center gap-2 rounded-full border border-alice-blue/70 px-5 py-2.5 font-heading text-sm font-semibold text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/10 dark:text-bright-snow"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(240px,0.2fr)_minmax(0,0.8fr)] lg:items-start">
          <aside className="glass-card rounded-[2rem] p-4 sm:p-5 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.4rem] border border-alice-blue/70 bg-bright-snow dark:border-alice-blue/10 dark:bg-prussian-blue">
              <Image
                src="/parampreet_singh.png"
                alt="Portrait of Parampreet Singh"
                width={720}
                height={920}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-5">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-3xl">
                Parampreet Singh
              </h1>
              <p className="mt-1 font-accent text-xl italic text-sky-surge sm:text-2xl">AI Engineer</p>
            </div>

            <a
              href="mailto:hey@itsparam.in"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-prussian-blue/15 bg-bright-snow px-4 py-2.5 font-heading text-sm font-semibold text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue dark:text-bright-snow"
            >
              <Mail className="h-4 w-4" />
              hey@itsparam.in
            </a>

            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-surge px-4 py-2.5 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              Download Resume
            </a>

            <div className="mt-6">
              <p className="font-heading text-xs uppercase tracking-[0.2em] text-prussian-blue/60 dark:text-bright-snow/60">
                Social Handles
              </p>
              <div className="mt-2 space-y-2">
                {socialHandles.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-between rounded-2xl border border-prussian-blue/10 bg-bright-snow/70 px-3 py-2 font-description text-sm text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue/50 dark:text-bright-snow"
                  >
                    <span>{item.label}</span>
                    <span className="inline-flex items-center gap-1 text-xs opacity-80">
                      {item.display}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="font-heading text-xs uppercase tracking-[0.2em] text-prussian-blue/60 dark:text-bright-snow/60">
                  Languages
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.languages.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-prussian-blue/15 bg-bright-snow/65 px-2.5 py-1 text-xs font-description text-prussian-blue dark:border-alice-blue/10 dark:bg-prussian-blue/50 dark:text-bright-snow"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-heading text-xs uppercase tracking-[0.2em] text-prussian-blue/60 dark:text-bright-snow/60">
                  ML / GenAI
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.ml.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-prussian-blue/15 bg-bright-snow/65 px-2.5 py-1 text-xs font-description text-prussian-blue dark:border-alice-blue/10 dark:bg-prussian-blue/50 dark:text-bright-snow"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-heading text-xs uppercase tracking-[0.2em] text-prussian-blue/60 dark:text-bright-snow/60">
                  Systems & Infra
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.systems.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-prussian-blue/15 bg-bright-snow/65 px-2.5 py-1 text-xs font-description text-prussian-blue dark:border-alice-blue/10 dark:bg-prussian-blue/50 dark:text-bright-snow"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <ResumeSection title="Summary">
              <p>
                AI / ML Engineer focused on building and shipping end-to-end AI systems, from fine-tuning SLMs to deploying production-ready applications on cloud and edge. Experienced in multi-agent workflows, real-time inference systems, and scalable backends. I care about turning models into usable products, not just training them.
              </p>
            </ResumeSection>

            <ResumeSection title="Experience">
              <article>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                    Founder | Gurmat Darbar
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-prussian-blue/60 dark:text-bright-snow/60">
                    Sept 2025 - Present
                  </span>
                </div>
                <a href="https://gurmatdarbar.com" target="_blank" rel="noopener noreferrer" className="text-sm text-sky-surge underline underline-offset-4">
                  gurmatdarbar.com
                </a>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Gained over 200+ users in the first month of launch, eventually leading to 80+ samagams (events) globally.</li>
                  <li>Led and built the biggest full-stack platform for Sikh community events with Find Samagams Near Me feature.</li>
                  <li>Designed a GenAI pipeline to extract structured multilingual data (EN/HI/PA) and auto event poster generation.</li>
                  <li>Backend deployed on GCP Cloud Run using FastAPI, Redis caching, PostgreSQL, and GCP buckets.</li>
                </ul>
              </article>

              <article>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                    AI Research Intern | mPragati Lab, IIT Delhi
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-prussian-blue/60 dark:text-bright-snow/60">
                    Sept 2025 - Feb 2025
                  </span>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Worked on 3D skull implant generation using deep learning for biomedical reconstruction.</li>
                  <li>Created and trained a pipeline of 3D U-Net based architectures for skull implant reconstruction.</li>
                </ul>
              </article>

              <article>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                    Junior Applications Engineer | Coridors (Remote)
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-prussian-blue/60 dark:text-bright-snow/60">
                    Aug 2024 - Sep 2025
                  </span>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Built a Streamlit-based data ingestion platform with 30+ interactive screens integrated with Snowflake.</li>
                  <li>Worked on backend integrations with Snowflake Snowpark for scalable data workflows.</li>
                  <li>Designed, deployed, and maintained the company website using JavaScript + Tailwind CSS with multi-branch deployments via Vercel and Cloudflare Workers.</li>
                </ul>
              </article>

              <article>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                    Educator | YouTube (@Param3021)
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-prussian-blue/60 dark:text-bright-snow/60">
                    Jan 2023 - Present
                  </span>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Delivered 70+ live sessions on Python and ML, reaching 175K+ learners.</li>
                </ul>
              </article>
            </ResumeSection>

            <ResumeSection title="Education">
              <article>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                    IIT Madras, BS in Data Science and Applications
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-prussian-blue/60 dark:text-bright-snow/60">
                    GPA: 8.3 | Sept 2022 - Present
                  </span>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li><strong>Core Subjects:</strong> LLMs, Maths for Gen AI, Software Engineering.</li>
                  <li><strong>Completed Diplomas:</strong> Diploma in Programming, Diploma in Data Science.</li>
                  <li><strong>NPTEL Electives:</strong> Intro to Quantum Computing, Applied Accelerated AI.</li>
                </ul>
              </article>
            </ResumeSection>

            <ResumeSection title="Projects">
              <article>
                <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                  Pocket Coder | Local Coding Assistant
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://github.com/param302/pocket-coder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-prussian-blue/15 px-2.5 py-1 text-sky-surge"
                  >
                    GitHub
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="mt-1 text-sm"><strong>Tools:</strong> PyTorch, LoRA, SFT, Unsloth, Ollama, MCP, GGUF</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Fine-tuned a 1.2B Liquid Foundation Model (LFM 2.5) using LoRA on custom datasets for coding tasks.</li>
                  <li>Engineered an SFT pipeline to scale context length from 4K to 16K (local + Kaggle multi-GPU).</li>
                  <li>Created an MCP server and integrated the model (Ollama) with Jupyter notebook magic command (%%code).</li>
                </ul>
              </article>

              <article>
                <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                  GRWM | Get README With Me
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://getreadmewithme.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-prussian-blue/15 px-2.5 py-1 text-sky-surge"
                  >
                    Live
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://github.com/param302/grwm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-prussian-blue/15 px-2.5 py-1 text-sky-surge"
                  >
                    GitHub
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="mt-1 text-sm"><strong>Tools:</strong> LangGraph, FastAPI, Next.js, GCP Cloud Run, SSE</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Achieved 100+ unique users in first 16 hours and 200+ within 24 hours.</li>
                  <li>Built a multi-agent GenAI system with three specialized agents: Detective, CTO, and Ghostwriter.</li>
                  <li>Implemented agent orchestration with LangGraph, real-time SSE, and personalized README generation.</li>
                  <li>Deployed backend on GCP Cloud Run with rate limiting and rolling API key management.</li>
                </ul>
              </article>

              <article>
                <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                  Hand Gesture Segmentation with LNN
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://github.com/param302/hand-gesture-lnn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-prussian-blue/15 px-2.5 py-1 text-sky-surge"
                  >
                    GitHub
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="mt-1 text-sm"><strong>Tools:</strong> PyTorch, Liquid Neural Networks, Time-Series Modeling</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Explored Liquid Neural Networks (continuous-time recurrent models using LTC dynamics for temporal adaptability).</li>
                  <li>Reproduced LTC architecture and implemented hand gesture segmentation on 32-dimensional time-series motion data.</li>
                  <li>Built custom LTC cells and benchmarked against LSTM, achieving 54.6% validation accuracy with improved generalization stability.</li>
                </ul>
              </article>

              <article>
                <h3 className="font-heading text-base font-semibold text-prussian-blue dark:text-bright-snow sm:text-lg">
                  Quizzo | Quiz Management System
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://github.com/param302/quizzo-v2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-prussian-blue/15 px-2.5 py-1 text-sky-surge"
                  >
                    GitHub
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="mt-1 text-sm"><strong>Tools:</strong> Flask, Vue.js, Redis, Celery, PostgreSQL</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Engineered a scalable full-stack quiz platform with background task queues and API rate limiting.</li>
                  <li>Implemented certificate generation and automated email workflows.</li>
                </ul>
              </article>
            </ResumeSection>

            <ResumeSection title="Co-Curricular & Achievements">
              <ul className="list-disc space-y-1 pl-5">
                <li>Presented research paper at GLEX 2025: Real-Time DEM for Autonomous Space Exploration.</li>
                <li>Delivered Python One-Liners Talk.</li>
                <li>ML Specialization Notes (120+ stars).</li>
                <li>Best #23 Contributor in Winter of Code 2023 by IIIT Kalyani.</li>
                <li>Gold Badge in Python on HackerRank.</li>
                <li>Top 3 in High School Code Connect coding competition.</li>
              </ul>
            </ResumeSection>
          </section>
        </div>
      </div>
    </main>
  );
}
