"use client";

import { useEffect, useId, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { getProjectTheme, interpolateProjectColor, normalizeProjectGradient, projectPalette, projectThemes } from "@/lib/project-themes";
import { useTheme } from "@/app/ThemeContext";
import styles from "./ProjectThemePicker.module.css";

function ColorField({ color, onChange, index }) {
  const [draft, setDraft] = useState(color);
  useEffect(() => { setDraft(color); }, [color]);
  const valid = /^#[0-9a-f]{6}$/i.test(draft);
  return <div className={styles.colorField}>
    <input type="color" value={color} onChange={(event) => onChange(event.target.value.toUpperCase())} aria-label={`Stop ${index + 1} color picker`} />
    <input type="text" value={draft} maxLength={7} spellCheck={false} aria-label={`Stop ${index + 1} hex color`} aria-invalid={!valid} onChange={(event) => { setDraft(event.target.value); if (/^#[0-9a-f]{6}$/i.test(event.target.value)) onChange(event.target.value.toUpperCase()); }} onBlur={() => { if (!valid) setDraft(color); }} />
  </div>;
}

function NumberControl({ label, value, maximum, suffix, onChange }) {
  const id = useId();
  return <label className={styles.numberControl} htmlFor={id}>
    <span>{label}</span>
    <div><input aria-label={`${label} slider`} type="range" min="0" max={maximum} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className={styles.numberValue}><input id={id} aria-label={label} type="number" min="0" max={maximum} step="1" value={value} onChange={(event) => { const number = Number(event.target.value); if (Number.isFinite(number)) onChange(Math.min(maximum, Math.max(0, number))); }} /><span aria-hidden="true">{suffix}</span></span>
    </div>
  </label>;
}

export default function ProjectThemePicker({ value, gradient: inputGradient, onChange, onGradientChange }) {
  const { theme: mode } = useTheme();
  const gradient = normalizeProjectGradient(inputGradient);
  const selected = projectThemes.find((theme) => theme.id === value) || projectThemes[0];
  const [activeStop, setActiveStop] = useState(0);
  const stopIndex = Math.min(activeStop, gradient.stops.length - 1);
  const update = (patch) => onGradientChange?.({ ...gradient, ...patch });
  const updateStop = (index, patch) => update({ stops: gradient.stops.map((stop, itemIndex) => itemIndex === index ? { ...stop, ...patch } : stop) });
  const addStop = () => {
    if (gradient.stops.length >= 5) return;
    const ordered = [...gradient.stops].sort((first, second) => first.position - second.position);
    let pair = [ordered[0], ordered[1]];
    for (let index = 1; index < ordered.length; index += 1) if (ordered[index].position - ordered[index - 1].position > pair[1].position - pair[0].position) pair = [ordered[index - 1], ordered[index]];
    const stop = { color: interpolateProjectColor(pair[0].color, pair[1].color), position: Math.round((pair[0].position + pair[1].position) / 2) };
    setActiveStop(gradient.stops.length);
    update({ stops: [...gradient.stops, stop] });
  };
  return <fieldset className={styles.root}>
    <legend>Theme</legend>
    <div className={styles.themes} role="group" aria-label="Project theme">
      {projectThemes.map((theme) => <button key={theme.id} type="button" aria-label={`Use ${theme.label} theme`} aria-pressed={selected.id === theme.id} onClick={() => onChange(theme.id)}>
        <span className={styles.swatch} style={{ background: getProjectTheme(theme.id, mode, gradient).colors.background }} aria-hidden="true">{selected.id === theme.id ? <span className={styles.selectedMark}><Check /></span> : null}</span>
        <span>{theme.label}</span>
      </button>)}
    </div>
    {selected.id === "custom" ? <div className={styles.custom}>
      <div className={styles.selects}>
        <label><span>Gradient</span><select value={gradient.type} onChange={(event) => update({ type: event.target.value })}><option value="linear">Linear</option><option value="radial">Radial</option><option value="conic">Conic</option></select></label>
        {gradient.type === "radial" ? <label><span>Shape</span><select value={gradient.shape} onChange={(event) => update({ shape: event.target.value })}><option value="circle">Circle</option><option value="ellipse">Ellipse</option></select></label> : null}
        <label><span>Text</span><select value={gradient.textMode} onChange={(event) => update({ textMode: event.target.value })}><option value="auto">Auto contrast</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
      </div>
      {gradient.type !== "radial" ? <NumberControl label="Angle" maximum={360} suffix="°" value={gradient.angle} onChange={(angle) => update({ angle })} /> : null}
      {gradient.type !== "linear" ? <div className={styles.position}>
        <NumberControl label="Center X" maximum={100} suffix="%" value={gradient.center.x} onChange={(x) => update({ center: { ...gradient.center, x } })} />
        <NumberControl label="Center Y" maximum={100} suffix="%" value={gradient.center.y} onChange={(y) => update({ center: { ...gradient.center, y } })} />
      </div> : null}
      <div className={styles.stopHeading}><span>Color stops</span><button type="button" onClick={addStop} disabled={gradient.stops.length >= 5}><Plus aria-hidden="true" /> Add stop</button></div>
      <div className={styles.stops}>
        <div className={styles.stopLabels} aria-hidden="true"><span>Color</span><span>Position</span><span /></div>
        {gradient.stops.map((stop, index) => <div key={index} className={styles.stop} onFocusCapture={() => setActiveStop(index)}>
          <ColorField color={stop.color} index={index} onChange={(color) => updateStop(index, { color })} />
          <span className={styles.numberValue}><span className={styles.stopPositionLabel} aria-hidden="true">Position</span><input type="number" aria-label={`Stop ${index + 1} position`} min="0" max="100" value={stop.position} onChange={(event) => { const number = Number(event.target.value); if (Number.isFinite(number)) updateStop(index, { position: Math.min(100, Math.max(0, number)) }); }} /><span aria-hidden="true">%</span></span>
          <button className={styles.remove} type="button" aria-label={`Remove color stop ${index + 1}`} disabled={gradient.stops.length <= 2} onClick={() => { setActiveStop(Math.max(0, index - 1)); update({ stops: gradient.stops.filter((_, itemIndex) => itemIndex !== index) }); }}><Trash2 aria-hidden="true" /></button>
        </div>)}
      </div>
      <div className={styles.palette} role="group" aria-label={`Portfolio colors for stop ${stopIndex + 1}`}>
        <span>Stop {stopIndex + 1}</span>
        {projectPalette.map(({ label, color }) => <button type="button" key={color} title={label} aria-label={`Use ${label} for stop ${stopIndex + 1}`} style={{ "--palette-color": color }} onClick={() => updateStop(stopIndex, { color })}><span /></button>)}
      </div>
    </div> : null}
  </fieldset>;
}
