"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Loader2, SendHorizontal } from "lucide-react";

const socials = [
  { label: "GitHub", href: "https://github.com/Param302", icon: "/socials/github.png", handle: "@Param302" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/param302", icon: "/socials/linkedin.png", handle: "/in/param302" },
  { label: "YouTube", href: "https://www.youtube.com/@Param3021", icon: "/socials/youtube.png", handle: "@Param3021" },
  { label: "X", href: "https://x.com/Param3021", icon: "/socials/twitter.png", handle: "@Param3021" },
];

const collaborationIdeas = [
  ["Production AI", "Useful systems that move from prototype to real users."],
  ["Voice + healthcare", "Indian-dialect voice agents and responsible clinical workflows."],
  ["Research + speaking", "Applied AI research, talks, workshops, and technical storytelling."],
  ["Community", "Meetups, hackathons, education, and developer experiences."],
];

const emptyForm = { name: "", email: "", subject: "", message: "", website: "" };

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your message.");
      setForm(emptyForm);
      setStatus({ type: "success", message: "Message received. I’ll get back to you soon." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to send your message." });
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = "w-full rounded-2xl border border-prussian-blue/12 bg-bright-snow px-4 py-3.5 text-prussian-blue outline-none transition placeholder:text-prussian-blue/35 focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10 dark:border-bright-snow/12 dark:bg-ink-black dark:text-bright-snow";

  return (
    <section id="contact" className="section-anchor overflow-hidden bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <header className="text-center">
          <p className="font-accent text-6xl font-semibold italic leading-none tracking-tight text-prussian-blue dark:text-papaya-whip sm:text-7xl">Contact</p>
          <h2 className="mt-5 font-heading text-2xl font-semibold text-prussian-blue dark:text-bright-snow sm:text-3xl">Let&apos;s build something useful.</h2>
          <a href="mailto:hey@itsparam.in" className="mt-3 inline-block font-description text-sky-surge transition hover:text-prussian-blue dark:hover:text-papaya-whip">hey@itsparam.in</a>
        </header>

        <div className="mt-12 grid gap-5 xl:grid-cols-[0.68fr_1.5fr_0.82fr] xl:items-stretch">
          <aside className="order-2 rounded-[2rem] bg-prussian-blue p-5 text-bright-snow sm:p-6 xl:order-1" aria-label="Social profiles">
            <p className="font-accent text-2xl italic">Find me online</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-bright-snow/12 bg-bright-snow/7 p-3 transition hover:-translate-y-0.5 hover:border-sky-surge hover:bg-bright-snow/12">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bright-snow"><Image src={social.icon} alt="" width={23} height={23} className="h-5 w-5 object-contain" /></span>
                  <span className="min-w-0">
                    <span className="block font-heading text-sm font-semibold">{social.label}</span>
                    <span className="block truncate font-description text-xs text-bright-snow/60">{social.handle}</span>
                  </span>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-bright-snow/55 transition group-hover:text-sky-surge" />
                </a>
              ))}
            </div>
          </aside>

          <form onSubmit={submit} className="order-1 rounded-[2rem] bg-papaya-whip p-5 text-prussian-blue shadow-[0_24px_70px_rgba(26,34,53,0.12)] sm:p-8 xl:order-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2"><span className="font-description text-sm font-medium">Name</span><input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} autoComplete="name" /></label>
              <label className="space-y-2"><span className="font-description text-sm font-medium">Email</span><input required type="email" maxLength={240} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClass} autoComplete="email" /></label>
            </div>
            <label className="mt-5 block space-y-2"><span className="font-description text-sm font-medium">What do you wanna discuss about</span><input required minLength={3} maxLength={180} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className={fieldClass} placeholder="A project, event, idea, or collaboration" /></label>
            <label className="mt-5 block space-y-2"><span className="font-description text-sm font-medium">Give more context</span><textarea required minLength={10} maxLength={5000} rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className={`${fieldClass} resize-y`} placeholder="A few details help me reply with something useful." /></label>
            <label className="sr-only" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-surge px-7 py-3 font-heading text-sm font-semibold text-ink-black shadow-md transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}{loading ? "Sending…" : "Send message"}</button>
              {status.type !== "idle" ? <p role="status" className={`font-description text-sm ${status.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{status.message}</p> : null}
            </div>
          </form>

          <aside className="order-3 rounded-[2rem] border border-prussian-blue/10 bg-bright-snow p-5 text-prussian-blue shadow-sm dark:border-bright-snow/10 dark:bg-prussian-blue dark:text-bright-snow sm:p-6">
            <p className="font-accent text-2xl italic">Ways to collaborate</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {collaborationIdeas.map(([title, description], index) => (
                <article key={title} className="rounded-2xl border border-prussian-blue/10 bg-background p-4 dark:border-bright-snow/10">
                  <span className="font-heading text-xs font-bold text-sky-surge">0{index + 1}</span>
                  <h3 className="mt-1 font-heading text-sm font-semibold">{title}</h3>
                  <p className="mt-1 font-description text-xs leading-5 opacity-65">{description}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
