"use client";

import { defaultPdfLayout } from "@/lib/resume-layout";

const selectClass = "min-w-0 rounded-lg border border-prussian-blue/15 bg-white px-2 py-1.5 text-xs text-prussian-blue outline-none focus:border-sky-surge";
const presets = {
  Compact: { fontSize: 8.5, lineHeight: 1.1, bulletGap: 0, entryGap: 2, sectionGap: 6 },
  Balanced: { fontSize: 9, lineHeight: 1.15, bulletGap: 0, entryGap: 4, sectionGap: 8 },
  Comfortable: { fontSize: 10, lineHeight: 1.2, bulletGap: 2, entryGap: 7, sectionGap: 12 },
};

export function BulletLimitControl({ value, onChange, defaultLimit, label = "PDF points" }) {
  const canInherit = defaultLimit !== undefined;
  return <label className="inline-flex min-w-0 items-center gap-2 text-xs text-prussian-blue/60">
    <span>{label}</span>
    <select aria-label={label} value={value ?? (canInherit ? "default" : 0)} onChange={(event) => onChange(event.target.value === "default" ? null : Number(event.target.value))} className={selectClass}>
      {canInherit && <option value="default">Default · {defaultLimit === 0 ? "all" : defaultLimit}</option>}
      <option value={0}>All</option>
      {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>First {index + 1}</option>)}
    </select>
  </label>;
}

function LayoutSlider({ label, value, onChange, min, max, step = 1, unit = "pt" }) {
  return <label className="block space-y-2 text-xs text-prussian-blue/65">
    <span className="flex items-center justify-between gap-2"><span>{label}</span><span className="tabular-nums text-prussian-blue">{Number(value).toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0)}{unit === "×" ? "×" : ` ${unit}`}</span></span>
    <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full cursor-pointer accent-prussian-blue" />
  </label>;
}

export function PdfLayoutControls({ value, onChange }) {
  const layout = { ...defaultPdfLayout, ...value };
  function update(key, next) { onChange({ ...layout, [key]: next }); }
  return <div className="space-y-5">
    <p className="text-xs leading-5 text-prussian-blue/60">Adjust the PDF without changing /resume. Content flows onto the next page when it needs more room.</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label="PDF spacing presets">
      {Object.entries(presets).map(([name, settings]) => {
        const selected = Object.entries(settings).every(([key, setting]) => layout[key] === setting);
        return <button key={name} type="button" aria-pressed={selected} onClick={() => onChange({ ...layout, ...settings })} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${selected ? "border-prussian-blue bg-prussian-blue text-white" : "border-prussian-blue/15 hover:bg-prussian-blue/5"}`}>{name}</button>;
      })}
    </div>
    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
      <LayoutSlider label="Body text size" value={layout.fontSize} min={8.5} max={11} step={0.5} onChange={(next) => update("fontSize", next)} />
      <LayoutSlider label="Line spacing" value={layout.lineHeight} min={1} max={1.5} step={0.05} unit="×" onChange={(next) => update("lineHeight", next)} />
      <LayoutSlider label="Between points" value={layout.bulletGap} min={0} max={6} onChange={(next) => update("bulletGap", next)} />
      <LayoutSlider label="Between entries" value={layout.entryGap} min={0} max={16} onChange={(next) => update("entryGap", next)} />
      <LayoutSlider label="Between sections" value={layout.sectionGap} min={4} max={24} onChange={(next) => update("sectionGap", next)} />
    </div>
    <div className="space-y-3 border-t border-prussian-blue/10 pt-4">
      <h3 className="text-sm font-semibold">Default PDF points</h3>
      <div className="flex flex-wrap gap-3">
        <BulletLimitControl label="Experience" value={layout.experienceBulletLimit} onChange={(next) => update("experienceBulletLimit", next)} />
        <BulletLimitControl label="Projects" value={layout.projectBulletLimit} onChange={(next) => update("projectBulletLimit", next)} />
        <BulletLimitControl label="Education" value={layout.educationBulletLimit} onChange={(next) => update("educationBulletLimit", next)} />
      </div>
      <p className="text-xs text-prussian-blue/55">Override these for any entry. All points stay on /resume.</p>
    </div>
    <label className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">Project tools
      <select aria-label="Project tools placement" className={selectClass} value={layout.projectToolsPlacement} onChange={(event) => update("projectToolsPlacement", event.target.value)}>
        <option value="heading">In heading · italic brackets</option>
        <option value="line">Separate line · italic brackets</option>
        <option value="hidden">Hide in PDF</option>
      </select>
    </label>
  </div>;
}
