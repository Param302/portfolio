"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import styles from "./ResumeRows.module.css";

const rowInput = styles.input;

export function PdfCheck({ included, onChange, label }) {
  return <label className={styles.checkTarget} title={label}>
    <input type="checkbox" checked={included !== false} onChange={(event) => onChange(event.target.checked)} aria-label={label} className={styles.checkbox} />
  </label>;
}

export function RowActions({ index, length, onMove, onRemove, label, stackedOnMobile = false }) {
  const buttonClass = styles.iconButton;
  return <div className={`${styles.actions} ${stackedOnMobile ? styles.rowActions : ""}`}>
    <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} className={buttonClass} aria-label={`Move ${label} up`} title="Move up"><ArrowUp className="h-4 w-4" /></button>
    <button type="button" disabled={index === length - 1} onClick={() => onMove(index, index + 1)} className={buttonClass} aria-label={`Move ${label} down`} title="Move down"><ArrowDown className="h-4 w-4" /></button>
    {onRemove ? <button type="button" onClick={onRemove} className={`${buttonClass} ${styles.deleteButton}`} aria-label={`Delete ${label}`} title="Delete"><Trash2 className="h-4 w-4" /></button> : null}
  </div>;
}

export function RowsTable({ label, heading, children }) {
  return <div role="table" aria-label={label} className={styles.table}>
    <div role="rowgroup" className={styles.tableHeader}>
      <div role="row" className={`${styles.rowGrid} ${styles.headingRow}`}>
        <span role="columnheader" className="text-center">PDF</span>
        <div role="columnheader">{heading}</div>
        <span role="columnheader" className={`${styles.actionColumn} text-right`}><span className="sr-only">Actions</span></span>
      </div>
    </div>
    <div role="rowgroup" className={styles.tableBody}>{children}</div>
  </div>;
}

export function EditableRow({ children, included, onToggle, controls, label }) {
  return <div role="row" className={`${styles.rowGrid} ${styles.editableRow}`}>
    <div role="cell"><PdfCheck included={included} onChange={onToggle} label={`Include ${label} in PDF`} /></div>
    <div role="cell" className="min-w-0">{children}</div>
    <div role="cell">{controls}</div>
  </div>;
}

export function LinkRows({ title = "Links", items, onChange, maxItems = 8 }) {
  function update(index, field, value) { onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)); }
  function move(from, to) { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); onChange(next); }
  return <div className="space-y-2">
    <div className="flex items-center justify-between gap-3">
      <h3 className={styles.groupTitle}>{title}</h3>
      <button type="button" disabled={items.length >= maxItems} onClick={() => onChange([...items, { id: crypto.randomUUID(), label: "", href: "", includeInPdf: true }])} className={styles.addButton} aria-label={`Add ${title.toLowerCase()} link`}><Plus className="h-3.5 w-3.5" />Add link</button>
    </div>
    <RowsTable label={title} heading={<div className={styles.linkFields}><span>Name<span className={styles.combinedLabel}> / URL</span></span><span className={styles.urlHeading}>URL</span></div>}>
      {items.map((item, index) => {
        const label = `${title.toLowerCase()} ${index + 1}`;
        return <EditableRow key={item.id || index} label={label} included={item.includeInPdf} onToggle={(value) => update(index, "includeInPdf", value)} controls={<RowActions stackedOnMobile index={index} length={items.length} onMove={move} onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} label={label} />}>
          <div className={styles.linkFields}>
            <input aria-label={`${label} name`} placeholder="e.g. LinkedIn" value={item.label} onChange={(event) => update(index, "label", event.target.value)} className={rowInput} />
            <input aria-label={`${label} URL`} placeholder="https://…" type="url" value={item.href} onChange={(event) => update(index, "href", event.target.value)} className={rowInput} />
          </div>
        </EditableRow>;
      })}
      {!items.length && <div role="row"><p role="cell" className={styles.emptyState}>No links yet. Add one above.</p></div>}
    </RowsTable>
  </div>;
}

function GrowingArea({ label, value, onChange, placeholder = "Add an achievement or activity…" }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const field = ref.current;
    function resize() { if (field.clientWidth) { field.style.height = "auto"; field.style.height = `${field.scrollHeight + field.offsetHeight - field.clientHeight}px`; } }
    resize();
    let width = field.clientWidth;
    const observer = new ResizeObserver(() => { if (field.clientWidth !== width) { width = field.clientWidth; resize(); } });
    observer.observe(field);
    return () => observer.disconnect();
  }, [value]);
  return <textarea ref={ref} aria-label={label} rows={2} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${rowInput} min-h-[60px] resize-y leading-6`} />;
}

export function EducationRows({ items, onChange, title = "Education details", pointLabel = "education point", placeholder = "e.g. LLMs, Maths for Gen AI, Software Engineering" }) {
  const normalize = (item) => typeof item === "string" ? { label: "", text: item, includeInPdf: true } : item;
  function update(index, field, value) { onChange(items.map((item, row) => row === index ? { ...normalize(item), [field]: value } : item)); }
  function move(from, to) { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); onChange(next); }
  return <div className="space-y-2">
    <div className="flex items-center justify-between gap-2"><h3 className={styles.groupTitle}>{title}</h3><button type="button" disabled={items.length >= 16} onClick={() => onChange([...items, { id: crypto.randomUUID(), label: "", text: "", includeInPdf: true }])} className={styles.addButton}><Plus className="h-3.5 w-3.5" />Add point</button></div>
    <RowsTable label={`${title} rows`} heading="Label (optional) / Detail">
      {items.map((value, index) => {
        const item = normalize(value);
        const label = `${pointLabel} ${index + 1}`;
        return <EditableRow key={item.id || index} label={label} included={item.includeInPdf} onToggle={(next) => update(index, "includeInPdf", next)} controls={<RowActions stackedOnMobile index={index} length={items.length} onMove={move} onRemove={() => onChange(items.filter((_, row) => row !== index))} label={label} />}>
          <div className="space-y-2">
            <input aria-label={`${label} bold label`} placeholder="Bold label · optional" value={item.label || ""} onChange={(event) => update(index, "label", event.target.value)} className={`${rowInput} font-semibold`} />
            <GrowingArea label={`${label} text`} value={item.text} onChange={(text) => update(index, "text", text)} placeholder={placeholder} />
          </div>
        </EditableRow>;
      })}
      {!items.length && <div role="row"><p role="cell" className={styles.emptyState}>No details yet. Add a point above.</p></div>}
    </RowsTable>
  </div>;
}

export function AchievementRows({ items, onChange }) {
  function update(index, field, value) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...(typeof item === "string" ? { text: item, includeInPdf: true } : item), [field]: value } : item));
  }
  function move(from, to) { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); onChange(next); }
  return <RowsTable label="Co-curricular points" heading="Achievement or activity">
    {items.map((value, index) => {
      const item = typeof value === "string" ? { text: value, includeInPdf: true } : value;
      const label = `achievement ${index + 1}`;
      return <EditableRow key={item.id || index} label={label} included={item.includeInPdf} onToggle={(included) => update(index, "includeInPdf", included)} controls={<RowActions stackedOnMobile index={index} length={items.length} onMove={move} onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} label={label} />}>
        <GrowingArea label={label} value={item.text} onChange={(text) => update(index, "text", text)} />
      </EditableRow>;
    })}
    {!items.length && <div role="row"><p role="cell" className={styles.emptyState}>Add an achievement or activity to get started.</p></div>}
  </RowsTable>;
}
