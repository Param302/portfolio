"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { gradientStep, hasEscaped, initialPoint, loss, projectPoint } from "./gradientMath.mjs";
import styles from "./Lab.module.css";

export default function GradientDescent() {
  const [rate, setRate] = useState(0.18);
  const [angle, setAngle] = useState(-0.55);
  const [points, setPoints] = useState([initialPoint]);
  const [running, setRunning] = useState(false);
  const current = points[points.length - 1];
  const escaped = hasEscaped(current);
  const converged = loss(current) < 0.0001;
  const done = escaped || converged || points.length >= 101;

  useEffect(() => {
    if (!running || done) return;
    const timer = setInterval(() => setPoints((previous) => [...previous, gradientStep(previous[previous.length - 1], rate)]), 380);
    return () => clearInterval(timer);
  }, [running, done, rate]);

  useEffect(() => {
    const stop = () => { if (document.hidden) setRunning(false); };
    document.addEventListener("visibilitychange", stop);
    return () => document.removeEventListener("visibilitychange", stop);
  }, []);

  const mesh = useMemo(() => {
    const cells = [];
    for (let xi = 0; xi < 20; xi++) {
      for (let yi = 0; yi < 20; yi++) {
        const x = -3 + xi * 0.3;
        const y = -3 + yi * 0.3;
        const corners = [[x, y], [x + 0.3, y], [x + 0.3, y + 0.3], [x, y + 0.3]];
        const projected = corners.map(([cx, cy]) => projectPoint(cx, cy, loss({ x: cx, y: cy }), angle));
        const depth = x * Math.sin(angle) + y * Math.cos(angle);
        cells.push({ depth, key: `${x},${y}`, points: projected.map((p) => `${p.x},${p.y}`).join(" "), opacity: 0.12 + Math.min(0.35, loss({ x, y }) / 48) });
      }
    }
    return cells.sort((a, b) => a.depth - b.depth);
  }, [angle]);

  const visible = points.filter((p) => !hasEscaped(p));
  const projectedPath = visible.map((p) => projectPoint(p.x, p.y, loss(p), angle));
  const ball = projectedPath[projectedPath.length - 1];
  const origin = projectPoint(0, 0, 0, angle);
  const status = escaped ? "Overshot the surface" : converged ? "Minimum found" : points.length >= 101 ? "100 steps completed" : running ? "Descending" : "Ready to step";
  const xStart = projectPoint(-3.5, 0, 0, angle);
  const xEnd = projectPoint(3.5, 0, 0, angle);
  const yStart = projectPoint(0, -3.5, 0, angle);
  const yEnd = projectPoint(0, 3.5, 0, angle);
  const zEnd = projectPoint(0, 0, 12, angle);

  function reset(nextRate = rate) {
    setRate(nextRate);
    setRunning(false);
    setPoints([initialPoint]);
  }

  return (
    <div className={styles.demoGrid}>
      <div className={styles.surface}>
        <div className={styles.visualLabel}><span>LOSS LANDSCAPE</span><span>f(x, y) = ½(x² + 3y²)</span></div>
        <svg viewBox="0 0 680 460" role="img" aria-label={`Three-dimensional loss surface. ${points.length - 1} gradient steps. Current loss ${loss(current).toFixed(4)}. ${status}.`} className={styles.surfaceSvg}>
          <defs>
            <radialGradient id="gd-glow"><stop stopColor="#1bb6e0" stopOpacity=".2" /><stop offset="1" stopColor="#1bb6e0" stopOpacity="0" /></radialGradient>
            <marker id="gd-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="currentColor" /></marker>
          </defs>
          <ellipse cx="340" cy="310" rx="310" ry="130" fill="url(#gd-glow)" />
          {mesh.map((cell) => <polygon key={cell.key} points={cell.points} fill="#1bb6e0" fillOpacity={cell.opacity} stroke="#1bb6e0" strokeOpacity=".3" strokeWidth=".65" />)}
          <g fill="currentColor" opacity=".78" stroke="currentColor" strokeWidth="1.5">
            <line x1={xStart.x} y1={xStart.y} x2={xEnd.x} y2={xEnd.y} markerEnd="url(#gd-arrow)" />
            <line x1={yStart.x} y1={yStart.y} x2={yEnd.x} y2={yEnd.y} markerEnd="url(#gd-arrow)" />
            <line x1={origin.x} y1={origin.y} x2={zEnd.x} y2={zEnd.y} markerEnd="url(#gd-arrow)" />
            <text x={xEnd.x + 8} y={xEnd.y + 15} stroke="none" fontSize="15">x</text>
            <text x={yEnd.x + 8} y={yEnd.y + 15} stroke="none" fontSize="15">y</text>
            <text x={zEnd.x + 10} y={zEnd.y - 5} stroke="none" fontSize="15">z</text>
          </g>
          <circle cx={origin.x} cy={origin.y} r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <polyline points={projectedPath.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#e47724" strokeWidth="3" strokeLinejoin="round" />
          {projectedPath.slice(0, -1).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.8" fill="#e47724" />)}
          <circle cx={ball.x} cy={ball.y} r="9" fill="#ffedd4" stroke="#9b4914" strokeWidth="3" />
        </svg>
        <label className={styles.rotation}>Rotate the surface<input aria-label="Surface rotation" type="range" min="-2.8" max="2.8" step="0.05" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></label>
      </div>
      <div className={styles.controls}>
        <label className={styles.sliderLabel} htmlFor="learning-rate">Learning rate <output>{rate.toFixed(2)}</output></label>
        <input id="learning-rate" type="range" min="0.01" max="0.9" step="0.01" value={rate} onChange={(event) => reset(Number(event.target.value))} />
        <div className={styles.rangeEnds}><span>Careful steps</span><span>Big jumps</span></div>
        <div className={styles.presets}>{[[0.05, "Slow"], [0.3, "Steady"], [0.72, "Too far"]].map(([value, label]) => <button key={label} onClick={() => reset(value)} aria-pressed={rate === value}>{label}</button>)}</div>
        <div className={styles.readouts}><div><span>Step</span><strong>{points.length - 1}</strong></div><div><span>Loss</span><strong>{loss(current).toFixed(4)}</strong></div></div>
        <div className={styles.transport}>
          <button className={styles.primaryButton} onClick={() => setRunning(!running)} disabled={done}>{running && !done ? <Pause size={16} /> : <Play size={16} />}{running && !done ? "Pause" : "Run"}</button>
          <button onClick={() => setPoints([...points, gradientStep(current, rate)])} disabled={done || running} aria-label="Take one gradient step"><SkipForward size={17} />Step</button>
          <button onClick={() => reset()} aria-label="Reset gradient descent"><RotateCcw size={17} /></button>
        </div>
      </div>
    </div>
  );
}
