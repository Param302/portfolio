"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Loader2, SendHorizontal } from "lucide-react";

const socials = [
  { label: "GitHub", href: "https://github.com/Param302", icon: "/socials/github.png", handle: "@Param302" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/param302", icon: "/socials/linkedin.png", handle: "/in/param302" },
  { label: "YouTube", href: "https://www.youtube.com/@Param3021", icon: "/socials/youtube.png", handle: "@Param3021" },
  { label: "X", href: "https://x.com/Param3021", icon: "/socials/twitter.png", handle: "@Param3021" },
];

const collaborationIdeas = [
  {
    title: "Wanna build an AI-native product",
    shortTitle: "AI-native product",
    message: "I’d like to discuss an AI-native product.",
  },
  {
    title: "Research on Applied AI",
    shortTitle: "Applied AI research",
    message: "I’d like to discuss an Applied AI research collaboration.",
  },
  {
    title: "Co-host a meetup or hackathon",
    shortTitle: "Meetup or hackathon",
    message: "I’d like to discuss co-hosting a meetup or hackathon.",
  },
  {
    title: "Something else",
    shortTitle: "Something else",
    message: "I have another idea I’d like to discuss.",
  },
];

const emptyForm = { name: "", email: "", subject: "", message: "", website: "" };

export default function Contact() {
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState(emptyForm);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  function chooseIdea(index) {
    const idea = collaborationIdeas[index];
    setSelectedIdea(index);
    setStatus({ type: "idle", message: "" });
    setForm((current) => ({
      ...current,
      subject: idea.title,
      message: !current.message || collaborationIdeas.some((item) => item.message === current.message) ? idea.message : current.message,
    }));
  }

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

  const fieldClass = "w-full rounded-2xl border border-prussian-blue/15 bg-bright-snow/90 px-4 py-3.5 text-prussian-blue outline-none transition placeholder:text-prussian-blue/38 focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10 dark:border-bright-snow/15 dark:bg-ink-black/80 dark:text-bright-snow dark:placeholder:text-bright-snow/35";
  const motionTransition = reduceMotion ? { duration: 0 } : { duration: 0.36, ease: [0.22, 1, 0.36, 1] };

  return (
    <section id="contact" className="section-anchor overflow-hidden bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <header className="text-center">
          <p className="font-accent text-6xl font-semibold italic leading-none tracking-tight text-prussian-blue dark:text-papaya-whip sm:text-7xl">Contact</p>
          <h2 className="mt-5 font-heading text-2xl font-semibold text-prussian-blue dark:text-bright-snow sm:text-3xl">Let&apos;s build something useful.</h2>
          <a href="mailto:hey@itsparam.in" className="mt-3 inline-block font-description text-sky-surge transition hover:text-prussian-blue dark:hover:text-papaya-whip">hey@itsparam.in</a>
        </header>

        <div className="mt-12 rounded-[2.25rem] bg-papaya-whip p-4 text-prussian-blue dark:bg-transparent dark:text-bright-snow sm:p-6 lg:grid lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,2.3fr)] lg:gap-6 lg:p-7">
          <aside className="self-start rounded-[1.75rem] border border-prussian-blue/12 bg-bright-snow/55 p-4 dark:border-transparent dark:bg-transparent sm:p-5" aria-label="Social profiles">
            <p className="font-accent text-2xl italic">Find me online</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label} className="group inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-prussian-blue/12 bg-bright-snow transition hover:-translate-y-0.5 hover:border-sky-surge dark:border-papaya-whip/70 dark:bg-papaya-whip">
                  <Image src={social.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                </a>
              ))}
            </div>
          </aside>

          <div className="mt-4 rounded-[1.75rem] border border-prussian-blue/12 bg-bright-snow/55 p-4 dark:border-transparent dark:bg-transparent sm:p-6 lg:mt-0">
            <AnimatePresence mode="wait" initial={false}>
              {selectedIdea === null ? (
                <motion.div key="choices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -24 }} transition={motionTransition}>
                  <p className="font-accent text-3xl italic sm:text-4xl">How should we collaborate?</p>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {collaborationIdeas.map((idea, index) => (
                      <button key={idea.title} type="button" onClick={() => chooseIdea(index)} className="group min-h-28 rounded-[1.4rem] border border-prussian-blue/13 bg-bright-snow/80 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-sky-surge focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-surge/20 dark:border-bright-snow/13 dark:bg-ink-black/60 dark:hover:border-sky-surge">
                        <span className="font-heading text-xs font-bold tracking-[0.18em] text-sky-surge">0{index + 1}</span>
                        <h3 className="mt-3 max-w-sm font-heading text-lg font-semibold leading-snug dark:text-papaya-whip sm:text-xl">{idea.title}</h3>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={motionTransition} className="grid gap-5 md:grid-cols-[minmax(170px,0.55fr)_minmax(0,1.45fr)]">
                  <div>
                    <button type="button" onClick={() => setSelectedIdea(null)} className="inline-flex items-center gap-2 rounded-full border border-prussian-blue/14 px-4 py-2 font-heading text-sm font-semibold transition hover:border-sky-surge hover:text-sky-surge dark:border-bright-snow/14"><ArrowLeft className="h-4 w-4" /> Change</button>
                    <div className="mt-5 grid gap-2.5">
                      {collaborationIdeas.map((idea, index) => (
                        <button key={idea.title} type="button" onClick={() => chooseIdea(index)} aria-pressed={selectedIdea === index} className={`rounded-2xl border p-4 text-left transition ${selectedIdea === index ? "border-sky-surge bg-sky-surge/12" : "border-prussian-blue/10 bg-bright-snow/45 opacity-65 hover:opacity-100 dark:border-bright-snow/10 dark:bg-ink-black/35"}`}>
                          <span className="font-heading text-xs font-bold text-sky-surge">0{index + 1}</span>
                          <span className="mt-1 block font-heading text-sm font-semibold leading-5">{idea.shortTitle}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={submit} className="rounded-[1.6rem] border border-prussian-blue/10 bg-bright-snow/65 p-5 dark:border-bright-snow/10 dark:bg-ink-black/40 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2"><span className="font-description text-sm font-medium">Name</span><input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} autoComplete="name" /></label>
                      <label className="space-y-2"><span className="font-description text-sm font-medium">Email</span><input required type="email" maxLength={240} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClass} autoComplete="email" /></label>
                    </div>
                    <label className="mt-5 block space-y-2"><span className="font-description text-sm font-medium">What do you wanna discuss about</span><input required minLength={3} maxLength={180} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className={fieldClass} placeholder="A project, event, idea, or collaboration" /></label>
                    <label className="mt-5 block space-y-2"><span className="font-description text-sm font-medium">Give more context</span><textarea required minLength={10} maxLength={5000} rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className={`${fieldClass} resize-y`} placeholder="A few details help me reply with something useful." /></label>
                    <label className="sr-only" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button type="submit" disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-surge px-7 py-3 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}{loading ? "Sending…" : "Send message"}</button>
                      {status.type !== "idle" ? <p role="status" className={`font-description text-sm ${status.type === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>{status.message}</p> : null}
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
