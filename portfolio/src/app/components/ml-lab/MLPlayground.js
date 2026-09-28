"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "@/app/ThemeContext";
import GradientDescent from "./GradientDescent";
import SelfAttentionPlayground from "../SelfAttentionPlayground";
import ForwardPassNetwork from "../ForwardPassNetwork";
import styles from "./Lab.module.css";

const experiments = [
  { name: "Gradient descent", component: GradientDescent },
  { name: "Self attention", component: SelfAttentionPlayground },
  { name: "How Neural Network Works?", component: ForwardPassNetwork },
];

export default function MLPlayground() {
  const { theme, mounted, toggleTheme } = useTheme();

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.identity}><Image src="/optimized/parampreet_singh.webp" alt="" width={32} height={38} /><span>Parampreet Singh</span></Link>
        <div className={styles.topActions}>
          <Link href="/"><ArrowLeft size={16} /><span>Back home</span></Link>
          <button onClick={toggleTheme} aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme"}>{mounted && theme === "dark" ? <SunMedium size={19} /> : <MoonStar size={19} />}</button>
        </div>
      </header>

      <section className={styles.intro} aria-labelledby="not-found-title">
        <div className={styles.introContent}>
          <h1 id="not-found-title">404 not found</h1>
          <p className={styles.rescue}>But, I&apos;ve got you</p>
          <nav className={styles.routeChips} aria-label="Useful pages">
            <Link href="/">Home</Link>
            <Link href="/resume">Resume</Link>
            <Link href="/walloffame">Wall of Fame</Link>
            <Link href="/#contact">Contact</Link>
          </nav>
          <a href="#experiment-1" className={styles.scrollCue}><span>scroll to see something special</span><ArrowDown size={19} /></a>
        </div>
      </section>

      <div className={styles.experimentFlow} aria-label="Machine learning playground">
        {experiments.map((experiment, index) => {
          const Experiment = experiment.component;
          return (
            <section key={experiment.name} id={`experiment-${index + 1}`} className={styles.experimentSection}>
              <div className={styles.sectionHeading}>
                <h2>{experiment.name}</h2>
              </div>
              <div className={styles.experimentCanvas}><Experiment /></div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
