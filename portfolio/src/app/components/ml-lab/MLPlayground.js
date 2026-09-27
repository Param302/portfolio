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
  { name: "Gradient descent", category: "OPTIMIZATION", description: "Guide a point down a three-dimensional loss surface and feel what the learning rate changes.", component: GradientDescent },
  { name: "Self-attention", category: "TRANSFORMERS", description: "Move through a field of words. Focus one to reveal the concepts it attends to.", component: SelfAttentionPlayground },
  { name: "Next-token prediction", category: "NEURAL NETWORKS", description: "Change the temperature, then trace how a tiny network ranks the next word.", component: ForwardPassNetwork },
];

export default function MLPlayground() {
  const { theme, mounted, toggleTheme } = useTheme();

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.identity}><Image src="/parampreet_singh.png" alt="" width={32} height={38} /><span>Parampreet Singh</span></Link>
        <div className={styles.topActions}>
          <Link href="/"><ArrowLeft size={16} /><span>Back home</span></Link>
          <button onClick={toggleTheme} aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme"}>{mounted && theme === "dark" ? <SunMedium size={19} /> : <MoonStar size={19} />}</button>
        </div>
      </header>

      <section className={styles.intro} aria-labelledby="not-found-title">
        <div><p className={styles.eyebrow}>404 / PAGE NOT FOUND</p><h1 id="not-found-title">Lost page. <em>Found a playground.</em></h1><p>Three ideas, one scroll at a time.</p></div>
        <a href="#experiment-1" className={styles.scrollCue}>Start exploring <ArrowDown size={17} /></a>
      </section>

      <div className={styles.experimentFlow} aria-label="Machine learning playground">
        {experiments.map((experiment, index) => {
          const Experiment = experiment.component;
          return (
            <section key={experiment.name} id={`experiment-${index + 1}`} className={styles.experimentSection}>
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>{String(index + 1).padStart(2, "0")} / {experiment.category}</p>
                <h2>{experiment.name}</h2>
                <p>{experiment.description}</p>
              </div>
              <div className={styles.experimentCanvas}><Experiment /></div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
