"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, SendHorizontal } from "lucide-react";
import styles from "./Contact.module.css";

const socials = [
  { label: "GitHub", href: "https://github.com/Param302", icon: "/optimized/socials/github.webp", handle: "@Param302" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/param302", icon: "/optimized/socials/linkedin.webp", handle: "/in/param302" },
  { label: "YouTube", href: "https://www.youtube.com/@Param3021", icon: "/optimized/socials/youtube.webp", handle: "@Param3021" },
  { label: "X", href: "https://x.com/Param3021", icon: "/optimized/socials/twitter.webp", handle: "@Param3021" },
];

const collaborationIdeas = [
  {
    title: "Wanna build an AI-native product",
    shortTitle: "AI-native product",
    compactTitle: "AI product",
    description: "Shape an idea, prototype the core workflow, and ship a useful AI product.",
    message: "I’d like to discuss an AI-native product.",
  },
  {
    title: "Research on Applied AI",
    shortTitle: "Applied AI research",
    compactTitle: "AI research",
    description: "Explore an applied research question, evaluation, or practical experiment.",
    message: "I’d like to discuss an Applied AI research collaboration.",
  },
  {
    title: "Co-host a meetup or hackathon",
    shortTitle: "Meetup or hackathon",
    compactTitle: "Meetup / event",
    description: "Plan a hands-on session, community meetup, or focused hackathon together.",
    message: "I’d like to discuss co-hosting a meetup or hackathon.",
  },
  {
    title: "Something else",
    shortTitle: "Something else",
    compactTitle: "Something else",
    description: "Start with your own idea and tell me what you have in mind.",
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

  const fieldClass = styles.field;
  const motionTransition = reduceMotion ? { duration: 0 } : { duration: 0.36, ease: [0.22, 1, 0.36, 1] };

  return (
    <section id="contact" className={`${styles.section} section-anchor bg-background px-4 py-12 sm:px-6 lg:px-8 lg:py-20`}>
      <div className="mx-auto max-w-[1440px]">
        <header className="text-center">
          <p className="font-accent text-6xl font-semibold italic leading-none tracking-tight text-prussian-blue dark:text-papaya-whip sm:text-7xl">Contact</p>
          <h2 className="mt-5 font-heading text-2xl font-semibold text-prussian-blue dark:text-bright-snow sm:text-3xl">Let&apos;s build something useful.</h2>
          <a href="mailto:hey@itsparam.in" className="mt-3 inline-block font-description text-sky-surge transition hover:text-prussian-blue dark:hover:text-papaya-whip">hey@itsparam.in</a>
        </header>

        <div className={styles.panel}>
          <aside className={styles.socials} aria-label="Social profiles">
            <p className={styles.socialHeading}><span className={styles.socialHeadingMobile}>Socials</span><span className={styles.socialHeadingDesktop}>Find me online</span></p>
            <div className={styles.socialLinks}>
              {socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label} className={styles.socialLink}>
                  <Image src={social.icon} alt="" width={22} height={22} className="h-5 w-5 object-contain" />
                  <span className={styles.socialMeta}><span className={styles.socialLabel}>{social.label}</span><span className={styles.socialHandle}>{social.handle}</span></span>
                </a>
              ))}
            </div>
          </aside>

          <div className={styles.content}>
            <h3 className={styles.question}>{selectedIdea === null ? "How should we collaborate?" : "Let’s talk."}</h3>
            <div className={styles.topics} data-selected={selectedIdea !== null} aria-label="Collaboration topic">
              {collaborationIdeas.map((idea, index) => (
                <button key={idea.title} type="button" onClick={() => chooseIdea(index)} aria-label={idea.shortTitle} aria-pressed={selectedIdea === index} className={styles.topic} data-other={index === 3}>
                  <span className={styles.topicCopy}>
                    <span className={styles.topicLong}>{idea.title}</span>
                    <span className={styles.topicShort}>{idea.compactTitle}</span>
                    <span className={styles.topicDescription}>{idea.description}</span>
                  </span>
                </button>
              ))}
            </div>
            <AnimatePresence initial={false}>
              {selectedIdea !== null && (
                <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={motionTransition}>
                  <form onSubmit={submit} className={styles.form}>
                    <p className={styles.formHeading}>Send me a note</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2"><span className="font-description text-sm font-medium">Name</span><input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} autoComplete="name" /></label>
                      <label className="space-y-2"><span className="font-description text-sm font-medium">Email</span><input required type="email" maxLength={240} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClass} autoComplete="email" /></label>
                    </div>
                    <label className="mt-4 block space-y-2"><span className="font-description text-sm font-medium">What&apos;s on your mind?</span><input required minLength={3} maxLength={180} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className={fieldClass} placeholder="A project, event, idea, or collaboration" /></label>
                    <label className="mt-4 block space-y-2"><span className="font-description text-sm font-medium">A little more context</span><textarea required minLength={10} maxLength={5000} rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className={`${fieldClass} resize-y`} placeholder="A few details help me reply with something useful." /></label>
                    <label className="sr-only" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button type="submit" disabled={loading} className={styles.send}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}{loading ? "Sending…" : "Send message"}</button>
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
