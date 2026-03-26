"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2, Mail, SendHorizontal } from "lucide-react";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Param302", handle: "@Param302" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/param302", handle: "/in/param302" },
  { label: "YouTube", href: "https://www.youtube.com/@Param3021", handle: "@Param3021" },
  { label: "X", href: "https://x.com/Param3021", handle: "@Param3021" },
];

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to send message right now.");
      }

      setFormData(initialForm);
      setStatus({ type: "success", message: "Message sent successfully. I will get back to you soon." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to send message. Please email me directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-anchor">
      <article className="p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 md:grid-cols-[0.44fr_0.56fr] md:items-start lg:grid-cols-[0.42fr_0.58fr]">
          <div className="space-y-6">
            <div>
              <p className="font-accent text-5xl font-semibold italic leading-none tracking-tight text-prussian-blue dark:text-papaya-whip sm:text-6xl">
                Contact
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-3xl">
                Build something meaningful together.
              </h2>
              <p className="mt-4 max-w-2xl font-description text-base leading-7 text-prussian-blue/75 dark:text-bright-snow/75">
                I am open to AI engineering collaborations, product-focused builds, speaking, and research-driven projects.
              </p>
            </div>

            <div className="rounded-3xl border border-[#d8b595] bg-papaya-whip p-5 dark:border-[#d8b595] dark:bg-papaya-whip">
              <p className="font-heading text-xs uppercase tracking-[0.2em] text-prussian-blue/60 dark:text-prussian-blue/65">
                Email
              </p>
              <a
                href="mailto:hey@itsparam.in"
                className="mt-2 inline-flex items-center gap-2 font-heading text-lg font-semibold text-prussian-blue transition hover:text-sky-surge dark:text-prussian-blue"
              >
                <Mail className="h-4 w-4" />
                hey@itsparam.in
              </a>
            </div>

            <div className="rounded-3xl border border-[#d8b595] bg-papaya-whip p-5 dark:border-[#d8b595] dark:bg-papaya-whip">
              <p className="font-heading text-xs uppercase tracking-[0.2em] text-prussian-blue/60 dark:text-prussian-blue/65">
                Social Handles
              </p>
              <div className="mt-3 grid gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl border border-[#d8b595] bg-[#f7e4d1] px-3 py-2 font-description text-sm text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:border-[#d8b595] dark:bg-[#f7e4d1] dark:text-prussian-blue"
                  >
                    <span>{link.label}</span>
                    <span className="inline-flex items-center gap-1 opacity-80 text-xs sm:text-sm">
                      {link.handle}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-alice-blue/70 bg-bright-snow/55 p-5 dark:border-alice-blue/10 dark:bg-prussian-blue/55 sm:p-6"
          >
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-prussian-blue/60 dark:text-bright-snow/60">
              Send a Message
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="font-description text-sm text-prussian-blue/75 dark:text-bright-snow/75">Name</span>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-alice-blue/80 bg-bright-snow px-4 py-3 font-description text-sm text-prussian-blue outline-none transition focus:border-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue dark:text-bright-snow"
                  placeholder="Your name"
                />
              </label>

              <label className="space-y-1">
                <span className="font-description text-sm text-prussian-blue/75 dark:text-bright-snow/75">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-alice-blue/80 bg-bright-snow px-4 py-3 font-description text-sm text-prussian-blue outline-none transition focus:border-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue dark:text-bright-snow"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-1">
              <span className="font-description text-sm text-prussian-blue/75 dark:text-bright-snow/75">What are we building?</span>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-2xl border border-alice-blue/80 bg-bright-snow px-4 py-3 font-description text-sm text-prussian-blue outline-none transition focus:border-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue dark:text-bright-snow"
                placeholder="Collab, product sprint, workshop, speaking..."
              />
            </label>

            <label className="mt-4 block space-y-1">
              <span className="font-description text-sm text-prussian-blue/75 dark:text-bright-snow/75">Tell more (give context)</span>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full resize-none rounded-2xl border border-alice-blue/80 bg-bright-snow px-4 py-3 font-description text-sm text-prussian-blue outline-none transition focus:border-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue dark:text-bright-snow"
                placeholder="Share your idea, goal, timeline, and how I can help ship it."
              />
            </label>

            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-surge px-5 py-3 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {status.type !== "idle" ? (
                <p
                  className={`text-xs font-description ${status.type === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                    }`}
                >
                  {status.message}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </article>
    </section>
  );
}
