"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Moon, Quote, Sun } from "lucide-react";
import { useTheme } from "@/app/ThemeContext";
import { allFeedbacks } from "@/app/data/teachingImpactData";
import CursorEyes from "./CursorEyes";
import styles from "./AdminLogin.module.css";

const loginFeedbacks = allFeedbacks.filter((quote) => quote.length >= 40 && quote.length <= 180).slice(0, 16);

function FeedbackRail({ items, reverse = false }) {
  return (
    <aside className={`${styles.rail} ${reverse ? styles.reverseRail : ""}`} aria-label="Learner feedback">
      <div className={styles.railTrack}>
        {[false, true].map((duplicate) => (
          <div key={String(duplicate)} className={styles.quoteGroup} aria-hidden={duplicate ? "true" : undefined}>
            {items.map((quote, index) => (
              <blockquote key={quote} className={styles.quoteCard}>
                <Quote size={18} aria-hidden="true" className={styles.quoteIcon} />
                <p>{quote}</p>
                <span className={styles.quoteMark} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </blockquote>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function AdminLogin() {
  const router = useRouter();
  const { theme, mounted, toggleTheme } = useTheme();
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
    <main className={styles.root}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}><ArrowLeft size={16} />Back to portfolio</Link>
        <button type="button" onClick={toggleTheme} disabled={!mounted} className={styles.themeToggle} aria-label={mounted && theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title={mounted && theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>{mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
      </header>
      <div className={styles.content}>
        <FeedbackRail items={loginFeedbacks.slice(0, 8)} />
        <div className={styles.formWrap}>
          <div className={styles.intro}>
            <div className={styles.introTop}>
              <span className={styles.adminBadge}>Admin</span>
              <CursorEyes />
            </div>
            <h1>Well, hello there.</h1>
            <p>This corner is just for Param.</p>
          </div>
          <form onSubmit={submit} className={styles.form} aria-busy={loading}>
            <label className={styles.field}><span>Email</span><input required type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label className={styles.field}>
              <span>Password</span>
              <span className={styles.passwordField}>
                <input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className={styles.passwordToggle} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>
            {error ? <p role="alert" className={styles.error}>{error}</p> : null}
            <button disabled={loading} className={styles.submit}><span>{loading ? "Signing in…" : "Sign in"}</span>{loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}</button>
          </form>
          <Link href="/walloffame" className={styles.wallLink}>Wall of Fame<ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        <FeedbackRail items={loginFeedbacks.slice(8, 16)} reverse />
      </div>
      <footer className={styles.footer}>
        <span>itsparam.in</span>
      </footer>
    </main>
  );
}
