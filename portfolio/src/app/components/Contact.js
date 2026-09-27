"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2, SendHorizontal } from "lucide-react";

const socials = [
  ["GitHub", "https://github.com/Param302"],
  ["LinkedIn", "https://www.linkedin.com/in/param302"],
  ["YouTube", "https://www.youtube.com/@Param3021"],
  ["X", "https://x.com/Param3021"],
];

const emptyForm = { name: "", email: "", message: "", website: "" };

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

  return (
    <section id="contact" className="section-anchor px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center"><p className="font-accent text-6xl font-semibold italic leading-none tracking-tight text-prussian-blue dark:text-papaya-whip sm:text-7xl">Contact</p><h2 className="mt-5 font-heading text-2xl font-semibold text-prussian-blue dark:text-bright-snow sm:text-3xl">Let&apos;s build something useful.</h2><a href="mailto:hey@itsparam.in" className="mt-3 inline-block font-description text-sky-surge">hey@itsparam.in</a><div className="mt-5 flex flex-wrap justify-center gap-2">{socials.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-prussian-blue/15 px-4 py-2 font-heading text-sm transition hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/15">{label}<ArrowUpRight className="h-3.5 w-3.5" /></a>)}</div></div>
        <form onSubmit={submit} className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-alice-blue/70 bg-bright-snow/60 p-5 dark:border-alice-blue/10 dark:bg-prussian-blue/55 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1"><span className="font-description text-sm">Name</span><input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-2xl border border-alice-blue bg-bright-snow px-4 py-3 outline-none focus:border-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue" autoComplete="name" /></label><label className="space-y-1"><span className="font-description text-sm">Email</span><input required type="email" maxLength={240} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-alice-blue bg-bright-snow px-4 py-3 outline-none focus:border-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue" autoComplete="email" /></label></div>
          <label className="mt-4 block space-y-1"><span className="font-description text-sm">Message</span><textarea required minLength={10} maxLength={5000} rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="w-full resize-y rounded-2xl border border-alice-blue bg-bright-snow px-4 py-3 outline-none focus:border-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue" /></label>
          <label className="sr-only" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-surge px-6 py-3 font-heading text-sm font-semibold text-ink-black disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}{loading ? "Sending…" : "Send message"}</button>{status.type !== "idle" && <p role="status" className={`font-description text-sm ${status.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>{status.message}</p>}</div>
        </form>
      </div>
    </section>
  );
}
