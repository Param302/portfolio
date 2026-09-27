"use client";

import { useState } from "react";
import { classifyFlower } from "./moreDemoMath.mjs";
import styles from "./MoreDemos.module.css";

const nodes = [
  { id: "length", x: 300, y: 47, label: "Petal length < 2.5 cm?", width: 208 },
  { id: "setosa", x: 125, y: 178, label: "Setosa", width: 144 },
  { id: "width", x: 419, y: 178, label: "Petal width < 1.8 cm?", width: 204 },
  { id: "versicolor", x: 303, y: 309, label: "Versicolor", width: 150 },
  { id: "virginica", x: 505, y: 309, label: "Virginica", width: 150 },
];
const branches = [
  { from: "length", to: "setosa", label: "yes", lx: 189, ly: 112 },
  { from: "length", to: "width", label: "no", lx: 382, ly: 112 },
  { from: "width", to: "versicolor", label: "yes", lx: 345, ly: 244 },
  { from: "width", to: "virginica", label: "no", lx: 490, ly: 244 },
];

export default function DecisionTree() {
  const [length, setLength] = useState(4.2);
  const [width, setWidth] = useState(1.2);
  const result = classifyFlower(length, width);
  return (
    <div className={styles.panel}>
      <div className={styles.dualControls}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Petal length <span className={styles.value}>{length.toFixed(1)} cm</span></span>
          <input className={styles.range} type="range" min="1" max="7" step="0.1" value={length} onChange={(event) => setLength(Number(event.target.value))} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Petal width <span className={styles.value}>{width.toFixed(1)} cm</span></span>
          <input className={styles.range} type="range" min="0.1" max="2.5" step="0.1" value={width} onChange={(event) => setWidth(Number(event.target.value))} />
        </label>
      </div>
      <div className={styles.stage}>
        <svg viewBox="0 0 620 370" className={`${styles.plot} ${styles.treeDiagram}`} role="img" aria-label={`Decision path: ${result.path.join(" to ")}. Predicted class ${result.label}.`}>
          {branches.map((branch) => {
            const from = nodes.find((node) => node.id === branch.from);
            const to = nodes.find((node) => node.id === branch.to);
            const active = result.path.includes(branch.from) && result.path.includes(branch.to);
            return <g key={branch.to} opacity={active ? 1 : 0.35}>
              <path d={`M${from.x} ${from.y + 25} L${to.x} ${to.y - 25}`} fill="none" stroke={active ? "#1bb6e0" : "currentColor"} strokeWidth={active ? 4 : 1.5} />
              <rect x={branch.lx - 18} y={branch.ly - 12} width="36" height="24" rx="10" fill="var(--color-background)" />
              <text x={branch.lx} y={branch.ly + 4} fill="currentColor" textAnchor="middle" fontSize="12">{branch.label}</text>
            </g>;
          })}
          {nodes.map((node) => {
            const active = result.path.includes(node.id);
            const leaf = result.path.at(-1) === node.id;
            return <g key={node.id}>
              <rect x={node.x - node.width / 2} y={node.y - 25} width={node.width} height="50" rx="14" fill={leaf ? "#1bb6e0" : "var(--color-surface)"} stroke={active ? "#1bb6e0" : "var(--color-border)"} strokeWidth={active ? 2 : 1} />
              <text x={node.x} y={node.y + 5} textAnchor="middle" fill={leaf ? "#0b0f19" : "currentColor"} fontSize="14" fontWeight={active ? 650 : 400}>{node.label}</text>
            </g>;
          })}
        </svg>
        <ol className={styles.mobileTree} aria-label="Selected decision path">
          <li className={styles.mobileDecision}><span>Petal length &lt; 2.5 cm?</span><strong className={styles.value}>{length < 2.5 ? "Yes" : "No"}</strong></li>
          {length >= 2.5 && <li className={styles.mobileDecision}><span>Petal width &lt; 1.8 cm?</span><strong className={styles.value}>{width < 1.8 ? "Yes" : "No"}</strong></li>}
          <li className={styles.mobileLeaf}>↳ {result.label}</li>
        </ol>
      </div>
      <div className={styles.caption} aria-live="polite"><span>Predicted class: <strong>{result.label}</strong></span><span className={styles.stat}>{result.path.length - 1} {result.path.length === 2 ? "decision" : "decisions"} → one leaf</span></div>
      <p className={styles.muted}>Change a feature to follow a different branch. These are illustrative rules, not a trained flower classifier.</p>
    </div>
  );
}
