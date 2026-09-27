"use client";

import { useState } from "react";
import { ACTION_ARROWS, GRID_GOAL, GRID_PITS, GRID_START, GRID_WALLS, initialQLearning, qLearningStep, trainQLearning } from "./moreDemoMath.mjs";
import styles from "./MoreDemos.module.css";

export default function QLearning() {
  const [state, setState] = useState(initialQLearning);
  const [epsilon, setEpsilon] = useState(0.25);
  return <div className={styles.panel}>
    <div className={styles.controls}>
      <button className={`${styles.button} ${styles.primary}`} onClick={() => setState((previous) => qLearningStep(previous, epsilon))}>Take a step</button>
      <button className={styles.button} onClick={() => setState((previous) => trainQLearning(previous, 100, epsilon))}>Train 100 episodes</button>
      <button className={styles.button} onClick={() => setState(initialQLearning())}>Reset</button>
      <span className={`${styles.stat} sm:ml-auto`}>{state.episodes} episodes · {state.successes} goals</span>
    </div>
    <div className={`${styles.stage} ${styles.gridLayout}`}>
      <div className={styles.world} role="img" aria-label={`Five by five grid world. Agent at row ${Math.floor(state.position / 5) + 1}, column ${state.position % 5 + 1}. Goal is top right. Arrows show the learned policy.`}>
        {state.q.map((values, index) => {
          const wall = GRID_WALLS.includes(index);
          const pit = GRID_PITS.includes(index);
          const goal = index === GRID_GOAL;
          const agent = state.position === index;
          const max = Math.max(...values);
          const learned = values.some((value) => value !== 0);
          const action = values.indexOf(max);
          const color = wall ? "rgba(127,145,170,.3)" : pit ? "rgba(229,144,71,.2)" : goal ? "rgba(77,176,133,.23)" : `rgba(27,182,224,${Math.max(0.025, Math.max(0, max) * .35)})`;
          return <div key={index} className={styles.cell} style={{ background: color }}>
            {agent ? <span className={styles.agent}>A</span> : wall ? <span className="opacity-50">■</span> : pit ? <span className="text-[#b86520] dark:text-[#efb375]">×</span> : goal ? <span className="text-[#297451] dark:text-[#86d4b0]">★</span> : <span style={{ opacity: learned ? 0.8 : 0.25 }}>{learned ? ACTION_ARROWS[action] : "·"}</span>}
            {!wall && !pit && !goal && <span className={styles.cellValue}>{index === GRID_START && !learned ? "start" : learned ? max.toFixed(2) : ""}</span>}
          </div>;
        })}
      </div>
      <div className={styles.worldInfo}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Exploration <span className={styles.value}>{Math.round(epsilon * 100)}%</span></span>
          <input className={styles.range} type="range" min="0" max="0.8" step="0.05" value={epsilon} onChange={(event) => setEpsilon(Number(event.target.value))} />
          <span className={styles.muted}>Chance of trying a random move instead of the best-known action.</span>
        </label>
        <div className={styles.legend}>
          <span>★ Goal +1</span><span>× Pit −1</span><span>■ Wall</span><span>Move −0.04</span>
        </div>
        <p className={styles.formula}>Q(s,a) ← Q(s,a) + α [r + γ max Q(s′,a′) − Q(s,a)]<br /><span className="opacity-60">α = 0.35 · γ = 0.95</span></p>
      </div>
    </div>
    <div className={styles.caption} aria-live="polite"><span>{state.last}</span><span className={styles.stat}>Episode step {state.steps}</span></div>
    <p className={styles.muted}>The agent learns through rewards, not a supplied route. Arrows show greedy actions; numbers are learned action values. Training uses seeded randomness, and episodes stop after 80 steps.</p>
  </div>;
}
