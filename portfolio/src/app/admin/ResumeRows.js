"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import styles from "./ResumeRows.module.css";

const rowGrid = "grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-2 sm:gap-3";
const rowInput = "min-w-0 w-full rounded-lg border border-prussian-blue/15 bg-white px-3 py-2 text-sm text-prussian-blue outline-none transition focus:border-sky-surge focus:ring-2 focus:ring-sky-surge/15";

export function PdfCheck({ included, onChange, label }) {
  return <label className="inline-flex h-9 w-8 cursor-pointer items-center justify-center" title={label}>
    <input type="checkbox" checked={included !== false} onChange={(event) => onChange(event.target.checked)} aria-label={label} className="h-4 w-4 cursor-pointer rounded border-prussian-blue/25 accent-prussian-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-surge" />
  </label>;
}

export function RowActions({ index, length, onMove, onRemove, label, stackedOnMobile = false }) {
  const buttonClass = "inline-flex h-8 w-8 items-center justify-center rounded-lg text-prussian-blue/65 transition hover:bg-prussian-blue/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-surge disabled:cursor-default disabled:opacity-25 disabled:hover:bg-transparent";
  return <div className={`flex shrink-0 gap-0.5 pt-0.5 ${stackedOnMobile ? styles.rowActions : ""}`}>
    <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} className={buttonClass} aria-label={`Move ${label} up`} title="Move up"><ArrowUp className="h-4 w-4" /></button>
    <button type="button" disabled={index === length - 1} onClick={() => onMove(index, index + 1)} className={buttonClass} aria-label={`Move ${label} down`} title="Move down"><ArrowDown className="h-4 w-4" /></button>
    <button type="button" onClick={onRemove} className={`${buttonClass} text-rose-600 hover:bg-rose-50`} aria-label={`Delete ${label}`} title="Delete"><Trash2 className="h-4 w-4" /></button>
  </div>;
}

export function RowsTable({ label, heading, children }) {
  return <div role="table" aria-label={label} className={`${styles.table} overflow-hidden rounded-xl border border-prussian-blue/10`}>
    <div role="rowgroup" className="border-b border-prussian-blue/10 bg-[#f8fafc] px-2 py-2 sm:px-3">
      <div role="row" className={`${rowGrid} items-center text-[10px] font-semibold uppercase tracking-[0.1em] text-prussian-blue/55`}>
        <span role="columnheader" className="text-center">PDF</span>
        <div role="columnheader">{heading}</div>
        <span role="columnheader" className={`${styles.actionColumn} text-right`}><span className="sr-only">Actions</span></span>
      </div>
    </div>
    <div role="rowgroup" className="divide-y divide-prussian-blue/10">{children}</div>
  </div>;
}

export function EditableRow({ children, included, onToggle, controls, label }) {
  return <div role="row" className={`${rowGrid} px-2 py-3 sm:px-3`}>
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
      <h3 className="text-sm font-semibold">{title}</h3>
      <button type="button" disabled={items.length >= maxItems} onClick={() => onChange([...items, { id: crypto.randomUUID(), label: "", href: "", includeInPdf: true }])} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-prussian-blue/70 hover:bg-prussian-blue/5 disabled:opacity-35" aria-label={`Add ${title.toLowerCase()} link`}><Plus className="h-3.5 w-3.5" />Add link</button>
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
      {!items.length && <div role="row"><p role="cell" className="px-4 py-5 text-sm text-prussian-blue/50">No links yet. Add one above.</p></div>}
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

export function EducationRows({ items, onChange }) {
  const normalize = (item) => typeof item === "string" ? { label: "", text: item, includeInPdf: true } : item;
  function update(index, field, value) { onChange(items.map((item, row) => row === index ? { ...normalize(item), [field]: value } : item)); }
  function move(from, to) { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); onChange(next); }
  return <div className="space-y-2">
    <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Education details</h3><button type="button" disabled={items.length >= 16} onClick={() => onChange([...items, { id: crypto.randomUUID(), label: "", text: "", includeInPdf: true }])} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-prussian-blue/70 hover:bg-prussian-blue/5 disabled:opacity-35"><Plus className="h-3.5 w-3.5" />Add point</button></div>
    <p className="text-xs leading-5 text-prussian-blue/55">Add one or more points. The optional label appears in bold.</p>
    <RowsTable label="Education points" heading="Label (optional) / Detail">
      {items.map((value, index) => {
        const item = normalize(value);
        const label = `education point ${index + 1}`;
        return <EditableRow key={item.id || index} label={label} included={item.includeInPdf} onToggle={(next) => update(index, "includeInPdf", next)} controls={<RowActions stackedOnMobile index={index} length={items.length} onMove={move} onRemove={() => onChange(items.filter((_, row) => row !== index))} label={label} />}>
          <div className="space-y-2">
            <input aria-label={`${label} bold label`} placeholder="Bold label · optional" value={item.label || ""} onChange={(event) => update(index, "label", event.target.value)} className={`${rowInput} font-semibold`} />
            <GrowingArea label={`${label} text`} value={item.text} onChange={(text) => update(index, "text", text)} placeholder="e.g. LLMs, Maths for Gen AI, Software Engineering" />
          </div>
        </EditableRow>;
      })}
      {!items.length && <div role="row"><p role="cell" className="px-4 py-5 text-sm text-prussian-blue/50">No details yet. Add a point above.</p></div>}
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
    {!items.length && <div role="row"><p role="cell" className="px-4 py-5 text-sm text-prussian-blue/50">Add an achievement or activity to get started.</p></div>}
  </RowsTable>;
}
