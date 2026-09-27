"use client";

import { useState } from "react";
import { initialCentroids, kMeansStep, makeClusterPoints } from "./moreDemoMath.mjs";
import styles from "./MoreDemos.module.css";

const points = makeClusterPoints();
const colors = ["#1bb6e0", "#e59047", "#a48df1", "#58b98c"];
const newState = (k) => ({ centroids: initialCentroids(k), assignments: [], iteration: 0, movement: Infinity, inertia: null });

export default function KMeans() {
  const [k, setK] = useState(3);
  const [state, setState] = useState(() => newState(3));
  const stable = state.movement < 0.001;
  function step() {
    setState((previous) => ({ ...kMeansStep(points, previous.centroids), iteration: previous.iteration + 1 }));
  }
  return <div className={styles.panel}>
    <div className={styles.controls}>
      <span className="text-sm font-medium">Clusters</span>
      {[2, 3, 4].map((count) => <button key={count} className={`${styles.button} ${k === count ? styles.primary : ""}`} aria-pressed={k === count} onClick={() => { setK(count); setState(newState(count)); }}>{count}</button>)}
      <button className={`${styles.button} ${styles.primary} sm:ml-auto`} disabled={stable} onClick={step}>Next iteration</button>
      <button className={styles.button} onClick={() => setState(newState(k))}>Reset</button>
    </div>
    <div className={styles.stage}>
      <svg viewBox="0 0 580 355" className={styles.plot} role="img" aria-label={`${points.length} points grouped into ${k} clusters, iteration ${state.iteration}. Colored crosses show cluster centers.`}>
        {[20, 40, 60, 80].map((line) => <g key={line} stroke="currentColor" opacity=".07"><line x1={40 + line * 5} y1="25" x2={40 + line * 5} y2="315" /><line x1="40" y1={315 - line * 2.9} x2="540" y2={315 - line * 2.9} /></g>)}
        {points.map((point, index) => <g key={index}>
          {state.assignments.length > 0 && <line x1={40 + point.x * 5} y1={315 - point.y * 2.9} x2={40 + state.centroids[state.assignments[index]].x * 5} y2={315 - state.centroids[state.assignments[index]].y * 2.9} stroke={colors[state.assignments[index]]} opacity=".15" />}
          <circle cx={40 + point.x * 5} cy={315 - point.y * 2.9} r="5.5" fill={state.assignments.length ? colors[state.assignments[index]] : "currentColor"} opacity={state.assignments.length ? 0.9 : 0.35} />
        </g>)}
        {state.centroids.map((center, index) => <g key={index} transform={`translate(${40 + center.x * 5} ${315 - center.y * 2.9})`}>
          <circle r="14" fill="var(--color-background)" stroke={colors[index]} strokeWidth="2" />
          <path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke={colors[index]} strokeWidth="3" />
          <text x="18" y="-10" fill="currentColor" fontSize="11" fontWeight="650">C{index + 1}</text>
        </g>)}
        <text x="290" y="343" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".5">Synthetic feature space</text>
      </svg>
    </div>
    <div className={styles.caption} aria-live="polite"><span>{state.iteration === 0 ? "Start with guesses for the cluster centers." : stable ? "Converged. The centers have stopped moving." : "Assigned each point, then moved every center to its mean."}</span><span className={styles.stat}>Iteration {state.iteration}{state.inertia !== null ? ` · error ${Math.round(state.inertia).toLocaleString()}` : ""}</span></div>
    <p className={styles.muted}>Dots are unlabeled data; crosses are centroids. Error is the sum of squared distances. Try a different number of clusters on the same data.</p>
  </div>;
}
