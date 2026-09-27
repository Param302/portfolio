"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Loader2 } from "lucide-react";

import { allFeedbacks } from "@/app/data/teachingImpactData";

function FeedbackRail({ items, reverse = false }) {
  const doubled = [...items, ...items];
  return (
    <div className="admin-feedback-rail-wrap hidden h-[660px] overflow-hidden xl:block">
      <div className={`admin-feedback-rail flex flex-col gap-3 py-3 ${reverse ? "admin-feedback-rail-reverse" : ""}`}>
        {doubled.map((quote, index) => (
          <Link key={index} href="/walloffame" className="rounded-[1.35rem] border border-bright-snow/10 bg-prussian-blue/62 p-4 font-description text-xs leading-6 text-bright-snow/58 transition hover:border-sky-surge hover:bg-prussian-blue hover:text-bright-snow focus-visible:border-sky-surge focus-visible:outline-none">
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
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-ink-black px-4 py-6 text-bright-snow">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(27,182,224,0.13),transparent_42%)]" />
      <Link href="/" className="relative z-20 mx-auto inline-flex items-center gap-3 rounded-full border border-bright-snow/12 bg-prussian-blue/70 px-3 py-2 font-heading text-sm font-semibold backdrop-blur transition hover:border-sky-surge">
        <Image src="/parampreet.png" alt="Parampreet Singh" width={34} height={34} className="h-8 w-8 rounded-full object-cover" />
        Parampreet Singh
      </Link>

      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] flex-1 items-center gap-8 py-8 xl:grid-cols-[minmax(220px,290px)_minmax(390px,460px)_minmax(220px,290px)]">
        <FeedbackRail items={allFeedbacks.slice(0, 8)} />

        <form onSubmit={submit} className="mx-auto w-full rounded-[2rem] border border-bright-snow/12 bg-prussian-blue/72 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-surge text-ink-black"><LockKeyhole className="h-5 w-5" /></span>
            <div>
              <h1 className="font-heading text-2xl font-bold">Admin</h1>
              <p className="font-description text-sm text-bright-snow/52">Sign in to continue.</p>
            </div>
          </div>

          <label className="mt-8 block space-y-2"><span className="font-description text-sm">Email</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-bright-snow/12 bg-ink-black/72 px-4 py-3.5 outline-none transition placeholder:text-bright-snow/25 focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10" /></label>
          <label className="mt-5 block space-y-2">
            <span className="font-description text-sm">Password</span>
            <span className="relative block">
              <input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-bright-snow/12 bg-ink-black/72 px-4 py-3.5 pr-12 outline-none transition focus:border-sky-surge focus:ring-4 focus:ring-sky-surge/10" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-bright-snow/45 transition hover:bg-bright-snow/8 hover:text-bright-snow" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </span>
          </label>
          {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 px-3 py-2 font-description text-sm text-rose-300">{error}</p> : null}
          <button disabled={loading} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-surge px-5 py-3.5 font-heading font-semibold text-ink-black transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{loading ? "Signing in…" : "Sign in"}</button>
          <Link href="/walloffame" className="mt-5 block text-center font-description text-xs text-bright-snow/42 transition hover:text-sky-surge">Read the Wall of Fame</Link>
        </form>

        <FeedbackRail items={allFeedbacks.slice(8, 16)} reverse />
      </div>
    </main>
  );
}
