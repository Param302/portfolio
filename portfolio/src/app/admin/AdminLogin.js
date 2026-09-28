"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { allFeedbacks } from "@/app/data/teachingImpactData";

function FeedbackRail({ items, reverse = false }) {
  return (
    <div className="admin-feedback-rail-wrap h-28 min-w-0 overflow-hidden xl:h-[calc(100vh-64px)]">
      <div className={`admin-feedback-rail flex w-max flex-row gap-3 px-2 xl:w-auto xl:flex-col xl:px-0 xl:py-3 ${reverse ? "admin-feedback-rail-reverse" : ""}`}>
        {[...items, ...items].map((quote, index) => (
          <Link key={index} href="/walloffame" className="flex w-64 shrink-0 items-center rounded-[1.15rem] border border-prussian-blue/10 bg-white p-4 font-description text-xs leading-6 text-prussian-blue/58 shadow-[0_12px_36px_rgba(20,38,68,0.04)] transition hover:border-sky-surge hover:text-prussian-blue focus-visible:border-sky-surge focus-visible:outline-none xl:w-full xl:min-h-24">
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
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f8fa] px-4 text-prussian-blue sm:px-6 xl:px-8">
      <div className="grid min-h-screen w-full grid-rows-[112px_minmax(520px,1fr)_112px] items-center gap-5 py-4 xl:grid-cols-3 xl:grid-rows-1 xl:gap-10 xl:py-8">
        <FeedbackRail items={allFeedbacks.slice(0, 8)} />

        <form onSubmit={submit} className="mx-auto w-full max-w-[420px] rounded-[1.5rem] border border-prussian-blue/10 bg-white p-6 shadow-[0_28px_80px_rgba(20,38,68,0.08)] sm:p-8">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-surge/12 text-sky-surge"><LockKeyhole className="h-5 w-5" /></span>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight">Admin</h1>
          <p className="mt-1 font-description text-sm text-prussian-blue/48">Sign in to continue.</p>

          <label className="mt-7 block space-y-2"><span className="font-description text-sm font-medium">Email</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-prussian-blue/12 bg-[#f8fafc] px-4 py-3.5 outline-none transition focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10" /></label>
          <label className="mt-5 block space-y-2">
            <span className="font-description text-sm font-medium">Password</span>
            <span className="relative block">
              <input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-prussian-blue/12 bg-[#f8fafc] px-4 py-3.5 pr-12 outline-none transition focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-prussian-blue/42 transition hover:bg-prussian-blue/5 hover:text-prussian-blue" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </span>
          </label>
          {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 font-description text-sm text-rose-700">{error}</p> : null}
          <button disabled={loading} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-prussian-blue px-5 py-3.5 font-heading font-semibold text-white transition hover:bg-sky-surge hover:text-ink-black disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{loading ? "Signing in…" : "Sign in"}</button>
          <Link href="/walloffame" className="mt-5 block text-center font-description text-xs text-prussian-blue/42 transition hover:text-sky-surge">Wall of Fame</Link>
        </form>

        <FeedbackRail items={allFeedbacks.slice(8, 16)} reverse />
      </div>
    </main>
  );
}
