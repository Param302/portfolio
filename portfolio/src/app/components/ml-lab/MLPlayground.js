"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "@/app/ThemeContext";
import GradientDescent from "./GradientDescent";
import SelfAttentionPlayground from "../SelfAttentionPlayground";
import ForwardPassNetwork from "../ForwardPassNetwork";
import DecisionTree from "./DecisionTree";
import KMeans from "./KMeans";
import Convolution from "./Convolution";
import QLearning from "./QLearning";
import styles from "./Lab.module.css";

const experiments = [
  { name: "Gradient descent", category: "OPTIMIZATION", description: "Find the bottom of a 3D loss landscape. Change the learning rate and watch the path respond.", component: GradientDescent },
  { name: "Self-attention", category: "TRANSFORMERS", description: "Choose a query token. See how dot products become attention weights over the other tokens.", component: SelfAttentionPlayground },
  { name: "Next-token prediction", category: "NEURAL NETWORKS", description: "Inspect a word's score in a tiny network. Turn the temperature up to make its choices less certain.", component: ForwardPassNetwork },
  { name: "Decision tree", category: "CLASSIFICATION", description: "A sequence of simple questions becomes a decision. Change the inputs and follow your branch.", component: DecisionTree },
  { name: "K-means", category: "UNSUPERVISED LEARNING", description: "No labels, just nearby points. Alternate between assigning clusters and moving their centers.", component: KMeans },
  { name: "Convolution", category: "COMPUTER VISION", description: "Slide a tiny filter across an image. Inspect how nine pixels produce one new value.", component: Convolution },
  { name: "Q-learning", category: "REINFORCEMENT LEARNING", description: "An agent learns from rewards, not directions. Train it, then inspect the policy it discovers.", component: QLearning },
];

export default function MLPlayground() {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const { theme, mounted, toggleTheme } = useTheme();
  const experiment = experiments[active];
  const Experiment = experiment.component;

  function navigateTabs(event, index) {
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % experiments.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + experiments.length - 1) % experiments.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = experiments.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.identity}><Image src="/parampreet_singh.png" alt="" width={32} height={38} /><span>Parampreet Singh</span></Link>
        <div className={styles.topActions}><Link href="/" aria-label="Back home"><ArrowLeft size={16} /><span>Back home</span></Link><button onClick={toggleTheme} aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme"}>{mounted && theme === "dark" ? <SunMedium size={19} /> : <MoonStar size={19} />}</button></div>
      </header>
      <section className={styles.intro} aria-labelledby="not-found-title">
        <div><p className={styles.eyebrow}>404 / PAGE NOT FOUND</p><h1 id="not-found-title">Lost page. <em>Found a playground.</em></h1><p>This route doesn’t exist. Stay for a little machine learning?</p></div>
        <div className={styles.indexMark} aria-hidden="true"><span>7</span><p>small experiments<br />big ideas</p></div>
      </section>
      <section className={styles.lab} aria-label="Machine learning playground">
        <div className={styles.tabs} role="tablist" aria-label="Choose an experiment">{experiments.map((item, index) => <button key={item.name} ref={(element) => { tabs.current[index] = element; }} id={`lab-tab-${index}`} role="tab" type="button" aria-selected={active === index} aria-controls={`lab-panel-${index}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => navigateTabs(event, index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.name}</button>)}</div>
        <div key={active} id={`lab-panel-${active}`} role="tabpanel" aria-labelledby={`lab-tab-${active}`} tabIndex={0} className={styles.panel}>
          <div className={styles.panelHeading}><p className={styles.eyebrow}>{experiment.category}</p><h2>{experiment.name}</h2><p>{experiment.description}</p></div>
          <Experiment />
        </div>
      </section>
      <footer className={styles.footer}><p>Small, illustrative models. Real calculations. Everything runs in your browser.</p><Link href="/#projects">See what I build <ArrowUpRight size={16} /></Link></footer>
    </main>
  );
}
