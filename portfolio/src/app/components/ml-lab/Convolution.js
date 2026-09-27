"use client";

import { useState } from "react";
import { correlateValid } from "./moreDemoMath.mjs";
import styles from "./MoreDemos.module.css";

const initialImage = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];
const presets = [
  { name: "Vertical edge", kernel: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]] },
  { name: "Horizontal edge", kernel: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]] },
  { name: "Sharpen", kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] },
  { name: "Box blur", kernel: Array.from({ length: 3 }, () => [1 / 9, 1 / 9, 1 / 9]) },
];
const formatted = (value) => Number(value.toFixed(2)).toString();

export default function Convolution() {
  const [input, setInput] = useState(initialImage);
  const [kernel, setKernel] = useState(presets[0].kernel);
  const [preset, setPreset] = useState("Vertical edge");
  const [selected, setSelected] = useState([1, 1]);
  const output = correlateValid(input, kernel);
  const maxValue = Math.max(1, ...output.flat().map(Math.abs));
  const [row, col] = selected;
  const terms = kernel.flatMap((line, kr) => line.map((weight, kc) => ({ pixel: input[row + kr][col + kc], weight })));

  function updateWeight(kr, kc, value) {
    if (!Number.isFinite(value)) return;
    setPreset("Custom");
    setKernel((previous) => previous.map((line, ri) => line.map((weight, ci) => ri === kr && ci === kc ? Math.max(-9, Math.min(9, value)) : weight)));
  }

  return <div className={styles.panel}>
    <div className={styles.controls}>
      {presets.map((option) => <button key={option.name} className={`${styles.button} ${preset === option.name ? styles.primary : ""}`} aria-pressed={preset === option.name} onClick={() => { setKernel(option.kernel); setPreset(option.name); }}>{option.name}</button>)}
      <button className={`${styles.button} sm:ml-auto`} onClick={() => setInput(initialImage)}>Reset image</button>
    </div>
    <div className={`${styles.stage} ${styles.matrixLayout}`}>
      <div>
        <h3 className={styles.matrixTitle}>Input · 7 × 7</h3>
        <div className={styles.matrix} style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
          {input.flatMap((line, ir) => line.map((pixel, ic) => {
            const inPatch = ir >= row && ir < row + 3 && ic >= col && ic < col + 3;
            return <button key={`${ir}-${ic}`} className={styles.pixel} style={{ background: pixel ? "#1bb6e0" : "rgba(127,145,170,.12)", borderColor: inPatch ? "#d87827" : "transparent", color: pixel ? "#0b0f19" : "var(--color-foreground)", boxShadow: inPatch ? "inset 0 0 0 1px #d87827" : "none" }} aria-label={`Input row ${ir + 1}, column ${ic + 1}: ${pixel}. Toggle pixel.`} onClick={() => setInput((previous) => previous.map((values, ri) => values.map((value, ci) => ri === ir && ci === ic ? 1 - value : value)))}>{pixel}</button>;
          }))}
        </div>
        <p className={`${styles.muted} mt-3`}>Tap pixels to draw.</p>
      </div>
      <div className={styles.kernel}>
        <h3 className={styles.matrixTitle}>Kernel · 3 × 3</h3>
        <div className={styles.matrix} style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {kernel.flatMap((line, kr) => line.map((value, kc) => <input key={`${kr}-${kc}`} className={styles.input} type="number" min="-9" max="9" step="0.1" value={Number(value.toFixed(3))} aria-label={`Kernel row ${kr + 1}, column ${kc + 1}`} onChange={(event) => updateWeight(kr, kc, Number(event.target.value))} />))}
        </div>
        <p className={`${styles.muted} mt-3`}>Editable weights</p>
      </div>
      <div>
        <h3 className={styles.matrixTitle}>Output · 5 × 5</h3>
        <div className={styles.matrix} style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
          {output.flatMap((line, or) => line.map((value, oc) => <button key={`${or}-${oc}`} className={`${styles.pixel} ${or === row && oc === col ? styles.selectedPixel : ""}`} style={{ background: value > 0 ? `rgba(27,182,224,${0.15 + Math.abs(value) / maxValue * 0.65})` : value < 0 ? `rgba(229,144,71,${0.15 + Math.abs(value) / maxValue * 0.65})` : "rgba(127,145,170,.12)", color: Math.abs(value) / maxValue > 0.65 ? "#0b0f19" : "var(--color-foreground)" }} aria-pressed={or === row && oc === col} aria-label={`Inspect output row ${or + 1}, column ${oc + 1}: ${formatted(value)}`} onMouseEnter={() => setSelected([or, oc])} onFocus={() => setSelected([or, oc])} onClick={() => setSelected([or, oc])}>{formatted(value)}</button>))}
        </div>
        <p className={`${styles.muted} mt-3`}>Select a cell to inspect.</p>
      </div>
    </div>
    <div className={styles.caption}><span>Multiply the highlighted patch by the kernel, then add.</span><span className={styles.stat}>Output [{row + 1}, {col + 1}] = <strong>{formatted(output[row][col])}</strong></span></div>
    <p className={styles.formula} aria-label="Selected output calculation">{terms.map(({ pixel, weight }) => `${pixel} × (${formatted(weight)})`).join(" + ")} = <strong>{formatted(output[row][col])}</strong></p>
    <p className={styles.muted}>Stride 1, no padding. Like most CNN layers, this uses cross-correlation: the kernel is not flipped. Cyan is positive; peach is negative.</p>
  </div>;
}
