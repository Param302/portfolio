"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { defaultPdfLayout } from "@/lib/resume-layout";
import styles from "./ResumeRows.module.css";

const selectClass = styles.select;
const presets = {
  Compact: { fontSize: 8.5, lineHeight: 1.1, bulletGap: 0, entryGap: 2, sectionGap: 6 },
  Balanced: { fontSize: 9, lineHeight: 1.15, bulletGap: 0, entryGap: 4, sectionGap: 8 },
  Comfortable: { fontSize: 10, lineHeight: 1.2, bulletGap: 2, entryGap: 7, sectionGap: 12 },
};

export function BulletLimitControl({ value, onChange, defaultLimit, label = "PDF points" }) {
  const canInherit = defaultLimit !== undefined;
  const mode = value == null && canInherit ? "default" : value > 0 ? "custom" : "all";
  const lastCustomCount = useRef(value > 0 ? value : null);
  const customCount = value > 0 ? value : lastCustomCount.current ?? (defaultLimit > 0 ? defaultLimit : 3);
  const [draft, setDraft] = useState(String(customCount));
  useEffect(() => {
    if (value > 0) {
      lastCustomCount.current = value;
      setDraft(String(value));
    }
  }, [value]);
  function commitCount(count) {
    const next = Math.min(12, Math.max(1, Math.round(count)));
    setDraft(String(next));
    if (next !== value) onChange(next);
  }
  return <div className={styles.limitControl} role="group" aria-label={label}>
    <span className={styles.limitLabel}>{label}</span>
      <div className={styles.limitModes}>
        {canInherit ? <button type="button" aria-pressed={mode === "default"} onClick={() => { if (mode !== "default") onChange(null); }} title="Follow the PDF layout setting">Default <span>{defaultLimit === 0 ? "all" : defaultLimit}</span></button> : null}
        <button type="button" aria-pressed={mode === "all"} onClick={() => { if (mode !== "all") onChange(0); }}>All</button>
        <button type="button" aria-pressed={mode === "custom"} onClick={() => { setDraft(String(customCount)); if (mode !== "custom") onChange(customCount); }}>Custom</button>
      </div>
      {mode === "custom" ? <div className={styles.limitStepper}>
        <button type="button" aria-label={`Decrease ${label.toLowerCase()} count`} disabled={value <= 1} onClick={() => commitCount(value - 1)}><Minus aria-hidden="true" /></button>
        <input type="number" inputMode="numeric" min="1" max="12" step="1" aria-label={`${label} custom count`} value={draft} onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          const count = Number(next);
          if (next && Number.isInteger(count) && count >= 1 && count <= 12) onChange(count);
        }} onBlur={() => { if (draft && Number.isFinite(Number(draft))) commitCount(Number(draft)); else setDraft(String(value)); }} onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setDraft(String(value));
        }} />
        <button type="button" aria-label={`Increase ${label.toLowerCase()} count`} disabled={value >= 12} onClick={() => commitCount(value + 1)}><Plus aria-hidden="true" /></button>
      </div> : null}
  </div>;
}

function LayoutSlider({ label, value, onChange, min, max, step = 1, unit = "pt" }) {
  return <label className={styles.sliderLabel}>
    <span><span>{label}</span><span className={styles.sliderValue}>{Number(value).toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0)}{unit === "×" ? "×" : ` ${unit}`}</span></span>
    <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className={styles.slider} />
  </label>;
}

export function PdfLayoutControls({ value, onChange }) {
  const layout = { ...defaultPdfLayout, ...value };
  function update(key, next) { onChange({ ...layout, [key]: next }); }
  return <div className={styles.layoutControls}>
    <div className={styles.presets} role="group" aria-label="PDF spacing presets">
      {Object.entries(presets).map(([name, settings]) => {
        const selected = Object.entries(settings).every(([key, setting]) => layout[key] === setting);
        return <button key={name} type="button" aria-pressed={selected} onClick={() => onChange({ ...layout, ...settings })} className={styles.preset}>{name}</button>;
      })}
    </div>
    <div className={styles.sliderGrid}>
      <LayoutSlider label="Body text size" value={layout.fontSize} min={8.5} max={11} step={0.5} onChange={(next) => update("fontSize", next)} />
      <LayoutSlider label="Line spacing" value={layout.lineHeight} min={1} max={1.5} step={0.05} unit="×" onChange={(next) => update("lineHeight", next)} />
      <LayoutSlider label="Between points" value={layout.bulletGap} min={0} max={6} onChange={(next) => update("bulletGap", next)} />
      <LayoutSlider label="Between entries" value={layout.entryGap} min={0} max={16} onChange={(next) => update("entryGap", next)} />
      <LayoutSlider label="Between sections" value={layout.sectionGap} min={4} max={24} onChange={(next) => update("sectionGap", next)} />
    </div>
    <div className={styles.limitsGroup}>
      <h3 className={styles.groupTitle}>Default PDF points</h3>
      <div className={styles.limits}>
        <BulletLimitControl label="Experience" value={layout.experienceBulletLimit} onChange={(next) => update("experienceBulletLimit", next)} />
        <BulletLimitControl label="Projects" value={layout.projectBulletLimit} onChange={(next) => update("projectBulletLimit", next)} />
        <BulletLimitControl label="Education" value={layout.educationBulletLimit} onChange={(next) => update("educationBulletLimit", next)} />
      </div>
    </div>
    <label className={styles.toolsControl}>Project tools
      <select aria-label="Project tools placement" className={selectClass} value={layout.projectToolsPlacement} onChange={(event) => update("projectToolsPlacement", event.target.value)}>
        <option value="heading">In heading · italic brackets</option>
        <option value="line">Separate line · italic brackets</option>
        <option value="hidden">Hide in PDF</option>
      </select>
    </label>
  </div>;
}
