"use client";

import { useState } from "react";
import { Check, LockKeyhole, Pencil, Plus, X } from "lucide-react";
import { defaultResumeSections, isProtectedResumeSection } from "@/lib/resume-sections";
import { PdfCheck, RowActions } from "./ResumeRows";
import styles from "./AdminWorkspace.module.css";
import sectionStyles from "./ResumeSections.module.css";

export default function ResumeSections({ sections, onRename, onMove, onRemove, onAdd, onEdit, onPdfChange }) {
  const [renaming, setRenaming] = useState(null);
  const [adding, setAdding] = useState(false);
  const [source, setSource] = useState("custom");
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("bullets");
  const available = defaultResumeSections.filter((section) => !sections.some((item) => item.id === section.id));
  function finishRename() {
    if (!renaming?.value.trim()) return;
    onRename(renaming.id, renaming.value.trim());
    setRenaming(null);
  }
  function addSection(event) {
    event.preventDefault();
    if (sections.length >= 16) return;
    if (source === "custom") {
      if (!title.trim()) return;
      onAdd({ id: `custom-${crypto.randomUUID()}`, type: "custom", title: title.trim(), format, text: "", items: [], includeInPdf: true });
    } else {
      const section = available.find((item) => item.id === source);
      if (!section) return;
      onAdd({ ...section });
    }
    setTitle(""); setSource("custom"); setAdding(false);
  }
  return <section className={styles.section} aria-label="Sections editor">
    <header className={styles.sectionHead}><div className={styles.sectionTitle}><h1>Sections</h1></div><button type="button" className={styles.button} disabled={sections.length >= 16} onClick={() => setAdding((value) => !value)} aria-expanded={adding}><Plus />Add section</button></header>
    <div className={sectionStyles.list} role="table" aria-label="Resume sections">
      <div role="row" className={sectionStyles.tableHeading}><span role="columnheader" className={sectionStyles.pdfCell}>PDF</span><span role="columnheader">Section</span><span role="columnheader" className={sectionStyles.actionsHeading}>Actions</span></div>
      {sections.map((section, index) => {
        const protectedSection = isProtectedResumeSection(section.id);
        const editing = renaming?.id === section.id;
        return <div key={section.id} role="row" className={sectionStyles.row}>
          <div role="cell" className={sectionStyles.pdfCell}><PdfCheck included={section.includeInPdf} onChange={(value) => onPdfChange(section.id, value)} label={`Include ${section.title} section in PDF`} /></div>
          <div role="cell" className={sectionStyles.nameCell}>
            <span className={sectionStyles.index}>{String(index + 1).padStart(2, "0")}</span>
            {editing ? <input className={styles.input} aria-label="Section name" autoFocus maxLength={80} value={renaming.value} onChange={(event) => setRenaming({ ...renaming, value: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter") finishRename(); if (event.key === "Escape") setRenaming(null); }} /> : <button type="button" onClick={() => onEdit(section.id)} className={sectionStyles.name}>{section.title}</button>}
            {protectedSection ? <LockKeyhole className={sectionStyles.lock} aria-label="Required by portfolio" /> : editing ? <div className={sectionStyles.renameActions}><button type="button" className={styles.iconButton} onClick={finishRename} disabled={!renaming.value.trim()} aria-label="Save section name"><Check /></button><button type="button" className={styles.iconButton} onClick={() => setRenaming(null)} aria-label="Cancel section rename"><X /></button></div> : <button type="button" className={styles.iconButton} onClick={() => setRenaming({ id: section.id, value: section.title })} aria-label={`Rename ${section.title} section`}><Pencil /></button>}
          </div>
          <div role="cell" className={sectionStyles.actionsCell}><RowActions label={`${section.title} section`} index={index} length={sections.length} onMove={onMove} onRemove={protectedSection ? undefined : (event) => { setRenaming(null); onRemove(section.id, event.currentTarget); }} /></div>
        </div>;
      })}
    </div>
    {adding ? <form onSubmit={addSection} className={sectionStyles.addForm}>
      <label className={styles.field}><span>Section</span><select aria-label="Section type" className={styles.input} value={source} onChange={(event) => setSource(event.target.value)}><option value="custom">Custom section</option>{available.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select></label>
      {source === "custom" ? <><label className={styles.field}><span>Name</span><input autoFocus required maxLength={80} className={styles.input} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className={styles.field}><span>Content</span><select aria-label="New section content" className={styles.input} value={format} onChange={(event) => setFormat(event.target.value)}><option value="bullets">Bullet points</option><option value="text">Text</option></select></label></> : null}
      <div className={sectionStyles.formActions}><button type="button" className={styles.button} onClick={() => setAdding(false)}>Cancel</button><button type="submit" className={styles.primaryButton} disabled={source === "custom" && !title.trim()}><Plus />{source === "custom" ? "Create section" : "Add section"}</button></div>
    </form> : null}
  </section>;
}
