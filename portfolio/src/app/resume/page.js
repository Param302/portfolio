import Link from "next/link";
import { Download, ExternalLink, Home, Mail } from "lucide-react";

import { getPublishedResume } from "@/lib/resume-content";

export const metadata = { title: "Parampreet Singh Resume", description: "Resume of Parampreet Singh, an AI Engineer building production AI systems.", alternates: { canonical: "/resume" } };

function Section({ title, children }) {
  return <section className="rounded-3xl border border-prussian-blue/10 bg-bright-snow/70 p-5 dark:border-alice-blue/10 dark:bg-prussian-blue/35 sm:p-7"><h2 className="font-heading text-xl font-semibold sm:text-2xl">{title}</h2><div className="mt-4 space-y-5 font-description text-sm leading-7 sm:text-base">{children}</div></section>;
}

function Bullets({ items }) { return <ul className="mt-2 list-disc space-y-1 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul>; }

export default async function ResumePage() {
  const { id, content } = await getPublishedResume();
  const { profile } = content;
  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-24 text-prussian-blue dark:text-bright-snow sm:px-6 lg:px-8">
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center"><Link href="/" className="glass-card inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-heading text-sm font-semibold"><Home className="h-4 w-4" />Home</Link></div>
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <aside className="glass-card rounded-[2rem] p-5 lg:sticky lg:top-24"><h1 className="font-heading text-3xl font-bold">{profile.name}</h1><p className="mt-1 font-accent text-2xl italic text-sky-surge">{profile.headline}</p><p className="mt-2 font-description text-sm opacity-65">{profile.location}</p><a href={`mailto:${profile.email}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-prussian-blue/15 px-4 py-2.5 text-sm dark:border-alice-blue/15"><Mail className="h-4 w-4" />{profile.email}</a><a href={id === "repository-default" ? "/resume.pdf" : `/api/resume/${id}`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-surge px-4 py-2.5 font-heading text-sm font-semibold text-ink-black"><Download className="h-4 w-4" />Download PDF</a><div className="mt-6 space-y-2">{profile.socials.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-prussian-blue/10 px-3 py-2 text-sm dark:border-alice-blue/10">{link.label}<ExternalLink className="h-3.5 w-3.5" /></a>)}</div></aside>
        <div className="space-y-5">
          <Section title="Summary"><p>{content.summary}</p></Section>
          <Section title="Experience">{content.experience.map((item) => <article key={item.id}><div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><h3 className="font-heading text-lg font-semibold">{item.role} | {item.company}</h3><span className="text-xs uppercase tracking-[0.14em] opacity-60">{item.dates}</span></div>{item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-sky-surge">{item.link.replace(/^https?:\/\//, "")}</a>}<Bullets items={item.bullets} /></article>)}</Section>
          <Section title="Education">{content.education.map((item) => <article key={item.id}><div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><h3 className="font-heading text-lg font-semibold">{item.school} | {item.program}</h3><span className="text-xs uppercase tracking-[0.14em] opacity-60">{item.dates}</span></div><Bullets items={item.details} /></article>)}</Section>
          <Section title="Projects">{content.projects.map((project) => <article key={project.id}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading text-lg font-semibold">{project.name} | {project.subtitle}</h3><div className="flex gap-2">{project.links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="text-xs text-sky-surge">{link.label}</a>)}</div></div><p className="mt-2">{project.description}</p><p className="mt-1 text-sm opacity-70">{project.skills.join(" · ")}</p><Bullets items={project.bullets} /></article>)}</Section>
          <Section title="Skills">{content.skills.map((group) => <p key={group.label}><strong>{group.label}:</strong> {group.items.join(", ")}</p>)}</Section>
          <Section title="Co-Curricular & Achievements"><Bullets items={content.achievements} /></Section>
        </div>
      </div>
    </main>
  );
}
