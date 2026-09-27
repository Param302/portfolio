"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Loader2 } from "lucide-react";

import { allFeedbacks } from "@/app/data/teachingImpactData";

function FeedbackRail({ items, reverse = false, side }) {
  const doubled = [...items, ...items];
  return (
    <div className={`admin-feedback-rail-wrap pointer-events-none absolute inset-y-0 hidden w-[min(25vw,330px)] overflow-hidden xl:block ${side === "left" ? "left-6" : "right-6"}`} aria-hidden="true">
      <div className={`admin-feedback-rail flex flex-col gap-4 py-4 ${reverse ? "admin-feedback-rail-reverse" : ""}`}>
        {doubled.map((quote, index) => (
          <Link key={`${side}-${index}`} href="/walloffame" tabIndex={-1} className="pointer-events-auto rounded-[1.5rem] border border-bright-snow/10 bg-prussian-blue/70 p-4 font-description text-xs leading-6 text-bright-snow/65 shadow-lg backdrop-blur transition hover:border-sky-surge hover:text-bright-snow">
            “{quote}”
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.refresh();
    } catch (caught) {
      setError(caught.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  const leftQuotes = allFeedbacks.slice(0, 8);
  const rightQuotes = allFeedbacks.slice(8, 16);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-black px-4 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(27,182,224,0.16),transparent_44%)]" />
      <FeedbackRail items={leftQuotes} side="left" />
      <FeedbackRail items={rightQuotes} reverse side="right" />

      <Link href="/" className="absolute left-1/2 top-5 z-20 inline-flex -translate-x-1/2 items-center gap-3 rounded-full border border-bright-snow/12 bg-prussian-blue/75 px-3 py-2 font-heading text-sm font-semibold text-bright-snow backdrop-blur transition hover:border-sky-surge">
        <Image src="/parampreet.png" alt="Parampreet Singh" width={34} height={34} className="h-8 w-8 rounded-full object-cover" />
        Parampreet Singh
      </Link>

      <form onSubmit={submit} className="relative z-10 w-full max-w-md rounded-[2rem] border border-bright-snow/10 bg-prussian-blue/92 p-7 text-bright-snow shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur sm:p-9">
        <span className="inline-flex rounded-2xl bg-sky-surge p-3 text-ink-black"><LockKeyhole className="h-6 w-6" /></span>
        <h1 className="mt-6 font-heading text-4xl font-bold">Welcome back</h1>
        <p className="mt-2 font-accent text-lg italic text-bright-snow/60">A private corner of itsparam.in.</p>
        <label className="mt-8 block space-y-2"><span className="font-description text-sm">Email</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-bright-snow/10 bg-ink-black px-4 py-3.5 outline-none transition focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10" /></label>
        <label className="mt-5 block space-y-2"><span className="font-description text-sm">Password</span><input required type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-bright-snow/10 bg-ink-black px-4 py-3.5 outline-none transition focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10" /></label>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 px-3 py-2 font-description text-sm text-rose-300">{error}</p> : null}
        <button disabled={loading} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-surge px-5 py-3.5 font-heading font-semibold text-ink-black transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{loading ? "Signing in…" : "Sign in"}</button>
        <Link href="/walloffame" className="mt-5 block text-center font-description text-xs text-bright-snow/45 transition hover:text-sky-surge">A little encouragement while you&apos;re here →</Link>
      </form>
    </main>
  );
}
