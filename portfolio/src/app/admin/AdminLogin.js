"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setError("");
    try { const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); router.refresh(); }
    catch (caught) { setError(caught.message || "Unable to sign in."); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-ink-black px-4"><form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-bright-snow/10 bg-prussian-blue p-7 text-bright-snow shadow-2xl"><span className="inline-flex rounded-2xl bg-sky-surge p-3 text-ink-black"><LockKeyhole className="h-6 w-6" /></span><h1 className="mt-5 font-heading text-3xl font-bold">Portfolio admin</h1><p className="mt-2 font-description text-sm text-bright-snow/60">Resume publishing and contact inbox.</p><label className="mt-7 block space-y-1"><span className="text-sm">Email</span><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-bright-snow/10 bg-ink-black px-4 py-3 outline-none focus:border-sky-surge" /></label><label className="mt-4 block space-y-1"><span className="text-sm">Password</span><input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-bright-snow/10 bg-ink-black px-4 py-3 outline-none focus:border-sky-surge" /></label>{error && <p className="mt-4 text-sm text-rose-400">{error}</p>}<button disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-surge px-5 py-3 font-heading font-semibold text-ink-black disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</button></form></main>;
}
