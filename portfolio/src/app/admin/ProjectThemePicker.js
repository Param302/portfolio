"use client";

import { useId } from "react";
import { getProjectTheme, projectThemes } from "@/lib/project-themes";
import { useTheme } from "@/app/ThemeContext";
import styles from "./AdminWorkspace.module.css";

export default function ProjectThemePicker({ value, onChange }) {
  const id = useId();
  const { theme: mode } = useTheme();
  const selected = projectThemes.find((theme) => theme.id === value) || projectThemes[0];
  return <fieldset className={styles.appearance}>
    <legend>Homepage appearance</legend>
    <div className={styles.themePicker}>
      <span className={styles.largeSwatch} style={{ background: getProjectTheme(selected.id, mode).colors.background }} aria-hidden="true" />
      <label className={styles.field} htmlFor={id}>
        <span>Card theme</span>
        <select id={id} className={styles.input} value={selected.id} onChange={(event) => onChange(event.target.value)}>
          {["Solid", "Gradient"].map((kind) => <optgroup key={kind} label={`${kind} themes`}>{projectThemes.filter((theme) => theme.kind === kind).map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}</optgroup>)}
        </select>
      </label>
    </div>
    <div className={styles.swatches} role="group" aria-label="Project color previews">
      {projectThemes.map((theme) => <button key={theme.id} type="button" aria-label={`Use ${theme.label} theme`} aria-pressed={selected.id === theme.id} title={theme.description} onClick={() => onChange(theme.id)}><span style={{ background: getProjectTheme(theme.id, mode).colors.background }} aria-hidden="true" /><span>{theme.label}</span></button>)}
    </div>
    <p className={styles.hint}>{selected.description}</p>
  </fieldset>;
}
