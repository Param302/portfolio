"use client";

import { useEffect, useState } from "react";
import styles from "./AboutBio.module.css";

export default function AboutBio() {
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const toggle = () => {
    if (mobile) setExpanded((current) => !current);
  };
  return (
    <div
      className={`${styles.bio} mt-6 grid max-w-[70ch] gap-5 font-description text-base font-medium leading-8 text-foreground sm:gap-6`}
      data-about-bio
      data-expanded={expanded}
      role={mobile ? "button" : undefined}
      tabIndex={mobile ? 0 : undefined}
      aria-expanded={mobile ? expanded : undefined}
      aria-label={mobile ? (expanded ? "Show shorter biography" : "Read full biography") : undefined}
      onClick={toggle}
      onKeyDown={(event) => {
        if (mobile && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          toggle();
        }
      }}
    >
      <p>I&apos;m an AI Engineer focused on building production-grade AI systems, fine-tuning small language models, and scaling Gurmat Darbar, a full-stack platform for the Sikh community. My work sits where deep learning, agentic workflows, and scalable backend architecture meet.</p>
      <p>Beyond products, I build communities and learning spaces: organizing PyDelhi meetups, hosting Codex events and hackathons in New Delhi, and teaching Python and machine learning through 70+ live sessions. I care about turning complex ideas into useful tools, confidence, and momentum.</p>
    </div>
  );
}
