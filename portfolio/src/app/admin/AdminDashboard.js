"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, ChevronRight, Circle, FileText, History, Inbox, LayoutList, Loader2, LogOut, Menu, Monitor, Moon, PanelLeftClose, PanelLeftOpen, Plus, RefreshCw, RotateCcw, Save, ScrollText, Send, SlidersHorizontal, Smartphone, Sun, UserRound, X } from "lucide-react";

import { generateResumeLatex } from "@/lib/latex";
import { defaultPdfLayout } from "@/lib/resume-layout";
import { isCustomResumeSection, isProtectedResumeSection, resolveResumeSections } from "@/lib/resume-sections";
import { BulletLimitControl, PdfLayoutControls } from "./ResumePdfControls";
import { AchievementRows, EducationRows, LinkRows, PdfCheck, RowActions } from "./ResumeRows";

import { useTheme } from "@/app/ThemeContext";
import { ProjectsPreview } from "@/app/components/Projects";
import ProjectThemePicker from "./ProjectThemePicker";
import ResumeSections from "./ResumeSections";
import ConfirmDialog from "./ConfirmDialog";
import { LogsWorkspace, InboxWorkspace } from "./AdminActivity";
import styles from "./AdminWorkspace.module.css";

const inputClass = styles.input;

function Field({ label, value, onChange, type = "text" }) { return <label className={styles.field}><span className={styles.label}>{label}</span><input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>; }
function Area({ label, value, onChange, rows = 4 }) { return <label className={styles.field}><span className={styles.label}>{label}</span><textarea rows={rows} value={value || ""} onChange={(event) => onChange(event.target.value)} className={`${inputClass} resize-y`} /></label>; }

function BulletField({ value, onChange, limit, onLimitChange, defaultLimit }) {
  const bulletCount = value.filter((bullet) => bullet.trim()).length;
  const effectiveLimit = limit ?? defaultLimit;
  return <div className="space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><span className={styles.label}>Bullets · one per line</span><BulletLimitControl value={limit} defaultLimit={defaultLimit} onChange={onLimitChange} /></div><textarea aria-label="Bullets · one per line" rows={4} value={value.join("\n")} onChange={(event) => onChange(event.target.value.split("\n"))} className={`${inputClass} resize-y`} />{effectiveLimit > 0 && bulletCount > effectiveLimit ? <p role="status" className={styles.warning}>PDF: first {effectiveLimit} {effectiveLimit === 1 ? "point" : "points"} · /resume: all {bulletCount}</p> : null}</div>;
}
function ListField({ label, items, onChange, multiline = false }) {
  const separator = multiline ? "\n" : ", ";
  const signature = JSON.stringify(items);
  const emitted = useRef(signature);
  const [draft, setDraft] = useState(() => items.join(separator));
  useEffect(() => {
    if (signature !== emitted.current) {
      emitted.current = signature;
      setDraft(JSON.parse(signature).join(separator));
    }
  }, [signature, separator]);
  function edit(value) {
    setDraft(value);
    const values = value.split(multiline ? "\n" : ",").map((item) => item.trim()).filter(Boolean);
    emitted.current = JSON.stringify(values);
    onChange(values);
  }
  return multiline ? <Area label={label} value={draft} onChange={edit} rows={3} /> : <Field label={label} value={draft} onChange={edit} />;
}
function toBase64(bytes) { let binary = ""; const chunk = 0x8000; for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk)); return btoa(binary); }

export default function AdminDashboard({ session }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("profile");
  const [previewKind, setPreviewKind] = useState("pdf");
  const [previewSize, setPreviewSize] = useState("fluid");
  const worker = useRef(null);
  const editorRef = useRef(null);
  const mainRef = useRef(null);
  const topbarRef = useRef(null);
  const confirmationTrigger = useRef(null);
  const editVersion = useRef(0);
  const compileRequest = useRef(0);
  const pendingTabs = useRef(new Map());
  const loadedTabs = useRef(new Set());
  const [document, setDocument] = useState(null);
  const [revisionState, setRevisionState] = useState({ draftRevisionId: null, publishedRevisionId: null });
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState({ events: [], sessions: [], users: [] });
  const [activeTab, setActiveTab] = useState("resume");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [resumeView, setResumeView] = useState("edit");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [preview, setPreview] = useState({ status: "idle", url: "", bytes: null, pageCount: 0, log: "" });
  const [notice, setNotice] = useState("");
  const [removedSection, setRemovedSection] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [cacheNeedsRetry, setCacheNeedsRetry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tabStatus, setTabStatus] = useState({ resume: "idle", history: "idle", logs: "idle", inbox: "idle" });

  const loadTab = useCallback(async (tab, { force = false } = {}) => {
    if (pendingTabs.current.has(tab)) return pendingTabs.current.get(tab);
    if (!force && loadedTabs.current.has(tab)) return undefined;
    const endpoints = { resume: "/api/admin/content?section=resume", history: "/api/admin/content?section=history", logs: "/api/admin/logs", inbox: "/api/admin/inbox" };
    const request = (async () => {
      setTabStatus((current) => ({ ...current, [tab]: loadedTabs.current.has(tab) ? "refreshing" : "loading" }));
      try {
        const response = await fetch(endpoints[tab], { cache: "no-store" });
        if (response.status === 401) { router.refresh(); return; }
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `Unable to load ${tab}.`);
        if (tab === "resume") {
          setDocument(result.document);
          setRemovedSection(null);
          setRevisionState({ draftRevisionId: result.draftRevisionId ?? null, publishedRevisionId: result.publishedRevisionId ?? null });
          setDirty(false);
        } else if (tab === "history") {
          setHistory(result.history || []);
        } else if (tab === "logs") {
          setLogs({ events: result.events || [], sessions: result.sessions || [], users: result.users || [] });
        } else {
          setMessages(result.messages || []);
        }
        loadedTabs.current.add(tab);
        setTabStatus((current) => ({ ...current, [tab]: "ready" }));
      } catch (error) {
        setNotice(error.message || `Unable to load ${tab}.`);
        setTabStatus((current) => ({ ...current, [tab]: loadedTabs.current.has(tab) ? "ready" : "error" }));
      } finally {
        pendingTabs.current.delete(tab);
      }
    })();
    pendingTabs.current.set(tab, request);
    return request;
  }, [router]);

  useEffect(() => { loadTab(activeTab); }, [activeTab, loadTab]);
  useEffect(() => {
    let cancelled = false;
    let idleId;
    let timerId;
    const pauseForIdle = () => new Promise((resolve) => {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(resolve, { timeout: 1200 });
      else timerId = window.setTimeout(resolve, 350);
    });
    const preload = async () => {
      for (const tab of ["resume", "history", "logs", "inbox"]) {
        if (cancelled) return;
        await loadTab(tab);
        if (cancelled) return;
        await pauseForIdle();
      }
    };
    preload();
    return () => {
      cancelled = true;
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId) window.clearTimeout(timerId);
    };
  }, [loadTab]);
  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("portfolio-admin-sidebar") === "collapsed");
  }, []);
  useEffect(() => {
    const topbar = topbarRef.current;
    const updateHeight = () => mainRef.current?.style.setProperty("--admin-topbar-height", `${topbar.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(topbar);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => { setIsMobile(query.matches); if (!query.matches) setMobileMenuOpen(false); };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    worker.current = new Worker("/workers/resume-compiler.worker.js");
    worker.current.onmessage = (event) => {
      if (event.data.requestId !== compileRequest.current) return;
      if (event.data.type === "success") { const bytes = new Uint8Array(event.data.pdf); const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })); setPreview((old) => { if (old.url) URL.revokeObjectURL(old.url); return { status: event.data.pageCount >= 1 && event.data.pageCount <= 20 ? "ready" : "oversize", url, bytes, pageCount: event.data.pageCount, log: event.data.log }; }); }
      else setPreview((old) => ({ ...old, status: "error", log: event.data.log || "Compilation failed." }));
    };
    return () => { worker.current?.terminate(); };
  }, []);
  useEffect(() => { if (!document || !worker.current) return undefined; const requestId = compileRequest.current + 1; compileRequest.current = requestId; setPreview((old) => ({ ...old, status: old.url ? "stale" : "compiling" })); const timer = window.setTimeout(() => { setPreview((old) => ({ ...old, status: "compiling" })); worker.current.postMessage({ type: "compile", requestId, source: generateResumeLatex(document) }); }, 700); return () => window.clearTimeout(timer); }, [document]);

  function markEdited() { editVersion.current += 1; setDirty(true); }
  useEffect(() => {
    editorRef.current?.scrollTo({ top: 0 });
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [activeSection, activeTab, resumeView]);
  function set(path, value) { markEdited(); setDocument((current) => { const clone = structuredClone(current); let target = clone; for (let i = 0; i < path.length - 1; i += 1) target = target[path[i]]; target[path.at(-1)] = value; return clone; }); }
  function setPdfSection(section, included) { markEdited(); setDocument((current) => ({ ...current, pdfSections: { ...current.pdfSections, [section]: included } })); }
  function move(collection, from, to) { markEdited(); setDocument((current) => { const clone = structuredClone(current); const [item] = clone[collection].splice(from, 1); clone[collection].splice(to, 0, item); return clone; }); }
  function remove(collection, index) { markEdited(); setDocument((current) => ({ ...current, [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index) })); }
  function add(collection, item) { markEdited(); setDocument((current) => ({ ...current, [collection]: [...current[collection], item] })); }

  function renameSection(id, title) {
    if (isProtectedResumeSection(id)) return;
    markEdited();
    setDocument((current) => ({ ...current, sections: resolveResumeSections(current).map((section) => section.id === id ? { ...section, title } : section) }));
  }
  function moveSection(from, to) {
    markEdited();
    setDocument((current) => {
      const sections = resolveResumeSections(current);
      const [section] = sections.splice(from, 1);
      sections.splice(to, 0, section);
      return { ...current, sections };
    });
  }
  function editCustomSection(id, changes) {
    markEdited();
    setDocument((current) => ({ ...current, sections: resolveResumeSections(current).map((section) => section.id === id ? { ...section, ...changes } : section) }));
  }
  function addSection(section) {
    markEdited();
    setDocument((current) => {
      const sections = resolveResumeSections(current);
      if (sections.length >= 16 || sections.some((item) => item.id === section.id)) return current;
      return { ...current, sections: [...sections, section] };
    });
    setActiveSection(section.id);
    setPreviewKind("pdf");
  }
  function requestRemoveSection(id, trigger) {
    confirmationTrigger.current = trigger;
    if (isProtectedResumeSection(id)) return;
    const section = resolveResumeSections(document).find((item) => item.id === id);
    if (section) setConfirmation({ type: "section", id, title: section.title });
  }
  function removeSection(id) {
    if (isProtectedResumeSection(id)) return;
    const sections = resolveResumeSections(document);
    const index = sections.findIndex((section) => section.id === id);
    if (index < 0) return;
    const message = `${sections[index].title} removed.`;
    setRemovedSection({ section: sections[index], index, message });
    setNotice(message);
    markEdited();
    setDocument((current) => ({ ...current, sections: resolveResumeSections(current).filter((section) => section.id !== id) }));
    if (activeSection === id) setActiveSection("sections");
  }
  function undoRemoveSection() {
    if (!removedSection) return;
    markEdited();
    setDocument((current) => {
      const sections = resolveResumeSections(current);
      if (sections.length >= 16 || sections.some((section) => section.id === removedSection.section.id)) return current;
      sections.splice(Math.min(removedSection.index, sections.length), 0, removedSection.section);
      return { ...current, sections };
    });
    setRemovedSection(null);
    setNotice("");
  }
  useEffect(() => {
    if (!document || ["profile", "sections", "layout", "history"].includes(activeSection)) return;
    if (!resolveResumeSections(document).some((section) => section.id === activeSection)) setActiveSection("sections");
  }, [document, activeSection]);
  function renderResumeSection(section) {
    const common = {
      sectionId: section.id,
      title: section.title,

    };
    if (isCustomResumeSection(section)) return <EditorSection key={section.id} {...common}>
      <label className={styles.field}><span>Content</span><select className={styles.input} aria-label="Section content format" value={section.format} onChange={(event) => editCustomSection(section.id, { format: event.target.value })}><option value="bullets">Bullet points</option><option value="text">Text</option></select></label>
      {section.format === "text" ? <Area label="Text" value={section.text} rows={8} onChange={(value) => editCustomSection(section.id, { text: value })} /> : <EducationRows title="Points" pointLabel="section point" placeholder="Point text" items={section.items} onChange={(value) => editCustomSection(section.id, { items: value })} />}
    </EditorSection>;
    if (section.id === "summary") return <EditorSection key={section.id} {...common}><textarea aria-label="Summary text" rows={4} value={document.summary} onChange={(event) => set(["summary"], event.target.value)} className={`${inputClass} resize-y`} /></EditorSection>;
    if (section.id === "experience") return <EditorSection key={section.id} {...common} onAdd={() => add("experience", { id: crypto.randomUUID(), includeInPdf: true, role: "", company: "", dates: "", link: "", bullets: [""] })}>{document.experience.map((item, index) => <Item key={item.id} pdfIncluded={item.includeInPdf} onPdfChange={(value) => set(["experience", index, "includeInPdf"], value)} title={`Experience ${index + 1}`} controls={<RowActions label={`experience ${index + 1}`} index={index} length={document.experience.length} onMove={(from, to) => move("experience", from, to)} onRemove={() => remove("experience", index)} />}><div className={styles.fields}><Field label="Role" value={item.role} onChange={(value) => set(["experience", index, "role"], value)} /><Field label="Company" value={item.company} onChange={(value) => set(["experience", index, "company"], value)} /><Field label="Dates" value={item.dates} onChange={(value) => set(["experience", index, "dates"], value)} /><Field label="Link" value={item.link} onChange={(value) => set(["experience", index, "link"], value)} /></div><BulletField value={item.bullets} onChange={(value) => set(["experience", index, "bullets"], value)} limit={item.pdfBulletLimit} defaultLimit={document.pdfLayout?.experienceBulletLimit ?? defaultPdfLayout.experienceBulletLimit} onLimitChange={(value) => set(["experience", index, "pdfBulletLimit"], value)} /></Item>)}</EditorSection>;
    if (section.id === "education") return <EditorSection key={section.id} {...common} onAdd={() => add("education", { id: crypto.randomUUID(), includeInPdf: true, school: "", program: "", dates: "", score: "", details: [] })}>{document.education.map((item, index) => <Item key={item.id} pdfIncluded={item.includeInPdf} onPdfChange={(value) => set(["education", index, "includeInPdf"], value)} title={`Education ${index + 1}`} controls={<RowActions label={`education ${index + 1}`} index={index} length={document.education.length} onMove={(from, to) => move("education", from, to)} onRemove={() => remove("education", index)} />}><div className={styles.fields}><Field label="School" value={item.school} onChange={(value) => set(["education", index, "school"], value)} /><Field label="Program" value={item.program} onChange={(value) => set(["education", index, "program"], value)} /><Field label="Dates" value={item.dates} onChange={(value) => set(["education", index, "dates"], value)} /><Field label="Grade / score" value={item.score} onChange={(value) => set(["education", index, "score"], value)} /></div><div className="flex justify-end"><BulletLimitControl value={item.pdfBulletLimit} defaultLimit={document.pdfLayout?.educationBulletLimit ?? defaultPdfLayout.educationBulletLimit} onChange={(value) => set(["education", index, "pdfBulletLimit"], value)} /></div><EducationRows items={item.details} onChange={(value) => set(["education", index, "details"], value)} /></Item>)}</EditorSection>;
    if (section.id === "projects") return <EditorSection key={section.id} {...common} onAdd={() => add("projects", { id: crypto.randomUUID(), includeInPdf: true, name: "", subtitle: "", description: "", bullets: [""], skills: [], image: "/projects/pocket-coder.png", theme: "surface", links: [] })}>{document.projects.map((item, index) => <Item key={item.id} pdfIncluded={item.includeInPdf} onPdfChange={(value) => set(["projects", index, "includeInPdf"], value)} title={`Project ${index + 1}`} controls={<RowActions label={`project ${index + 1}`} index={index} length={document.projects.length} onMove={(from, to) => move("projects", from, to)} onRemove={() => remove("projects", index)} />}><div className={styles.fields}><Field label="Name" value={item.name} onChange={(value) => set(["projects", index, "name"], value)} /><Field label="Subtitle" value={item.subtitle} onChange={(value) => set(["projects", index, "subtitle"], value)} /><Field label="Image path" value={item.image} onChange={(value) => set(["projects", index, "image"], value)} /></div><ProjectThemePicker value={item.theme} gradient={item.gradient} onGradientChange={(value) => { set(["projects", index, "gradient"], value); setPreviewKind("homepage"); }} onChange={(value) => { set(["projects", index, "theme"], value); setPreviewKind("homepage"); }} /><Area label="Description" value={item.description} onChange={(value) => set(["projects", index, "description"], value)} /><BulletField value={item.bullets} onChange={(value) => set(["projects", index, "bullets"], value)} limit={item.pdfBulletLimit} defaultLimit={document.pdfLayout?.projectBulletLimit ?? defaultPdfLayout.projectBulletLimit} onLimitChange={(value) => set(["projects", index, "pdfBulletLimit"], value)} /><ListField label="Skills · comma separated" items={item.skills} onChange={(value) => set(["projects", index, "skills"], value)} /><LinkRows title="Project links" maxItems={4} items={item.links} onChange={(links) => set(["projects", index, "links"], links)} /></Item>)}</EditorSection>;
    if (section.id === "skills") return <EditorSection key={section.id} {...common} onAdd={() => add("skills", { includeInPdf: true, label: "", items: [] })}>{document.skills.map((group, index) => <Item key={index} pdfIncluded={group.includeInPdf} onPdfChange={(value) => set(["skills", index, "includeInPdf"], value)} title={`Skill group ${index + 1}`} controls={<RowActions label={`skill group ${index + 1}`} index={index} length={document.skills.length} onMove={(from, to) => move("skills", from, to)} onRemove={() => remove("skills", index)} />}><Field label="Group" value={group.label} onChange={(value) => set(["skills", index, "label"], value)} /><ListField label="Skills · comma separated" items={group.items} onChange={(value) => set(["skills", index, "items"], value)} /></Item>)}</EditorSection>;
    if (section.id === "achievements") return <EditorSection key={section.id} {...common} onAdd={() => add("achievements", { id: crypto.randomUUID(), text: "", includeInPdf: true })}>
          <AchievementRows items={document.achievements} onChange={(items) => set(["achievements"], items)} />
        </EditorSection>;
    return null;
  }

  async function save(action) {
    const savedVersion = editVersion.current;
    setSaving(true); setNotice("");
    try { const payload = { action, content: document, baseDraftRevisionId: revisionState.draftRevisionId, basePublishedRevisionId: revisionState.publishedRevisionId }; if (action === "publish") { payload.pageCount = preview.pageCount; payload.pdfBase64 = toBase64(preview.bytes); } const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setHistory(result.history || []); loadedTabs.current.add("history"); setTabStatus((current) => ({ ...current, history: "ready" })); setRevisionState({ draftRevisionId: result.draftRevisionId ?? null, publishedRevisionId: result.publishedRevisionId ?? null }); if (editVersion.current === savedVersion) setDirty(false); setCacheNeedsRetry(Boolean(result.cacheWarning)); setNotice(result.cacheWarning || (action === "publish" ? "Published successfully." : "Draft saved.")); }
    catch (error) { setNotice(error.message || "Save failed."); }
    finally { setSaving(false); }
  }
  async function restore(revisionId) { if (!window.confirm("Restore and publish this revision?")) return; setSaving(true); try { const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "restore", revisionId, basePublishedRevisionId: revisionState.publishedRevisionId }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); await loadTab("resume", { force: true }); setCacheNeedsRetry(Boolean(result.cacheWarning)); setNotice(result.cacheWarning || "Revision restored and published."); } catch (error) { setNotice(error.message); } finally { setSaving(false); } }
  async function retryCache() { setSaving(true); try { const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "refresh" }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setCacheNeedsRetry(false); setNotice("Public cache refreshed."); } catch (error) { setNotice(error.message); } finally { setSaving(false); } }
  async function updateMessage(id, action) {
    try {
      const response = await fetch("/api/admin/inbox", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update message.");
      await loadTab("inbox", { force: true });
    } catch (error) { setNotice(error.message || "Unable to update message. Please try again."); }
  }
  function requestLogout(event) {
    confirmationTrigger.current = event.currentTarget;
    setMobileMenuOpen(false);
    setConfirmation({ type: "logout" });
  }
  async function logout() {
    const response = await fetch("/api/admin/logout", { method: "POST" });
    if (!response.ok) throw new Error("Unable to sign out. Please try again.");
    router.refresh();
  }
  async function refreshActivePanel() {
    if (activeTab === "resume" && dirty && !window.confirm("Refresh the resume panel and discard unsaved changes?")) return;
    setNotice("");
    if (activeTab === "resume") await Promise.all([loadTab("resume", { force: true }), loadTab("history", { force: true })]);
    else await loadTab(activeTab, { force: true });
  }

  const selectedMessage = useMemo(() => messages.find((message) => message.id === selectedMessageId) || messages[0] || null, [messages, selectedMessageId]);
  const toggleSidebar = () => setSidebarCollapsed((current) => { const next = !current; window.localStorage.setItem("portfolio-admin-sidebar", next ? "collapsed" : "expanded"); return next; });
  const chooseTab = (tab) => { setActiveTab(tab); setMobileMenuOpen(false); };
  const activePanelRefreshing = ["loading", "refreshing"].includes(tabStatus[activeTab]) || (activeTab === "resume" && ["loading", "refreshing"].includes(tabStatus.history));
  const activePanelLabel = activeTab === "resume" ? "Resume" : activeTab === "logs" ? "Logs" : "Inbox";

  const sections = document ? resolveResumeSections(document) : [];
  const selectedSection = sections.find((section) => section.id === activeSection);
  const chooseSection = (id) => { setActiveSection(id); setActiveTab("resume"); setMobileMenuOpen(false); setResumeView("edit"); setPreviewKind(id === "projects" ? "homepage" : "pdf"); };
  const sectionOptions = [{ id: "sections", title: "Sections" }, { id: "profile", title: "Profile & contact" }, ...sections, { id: "layout", title: "PDF layout" }, { id: "history", title: "Revision history" }];
  const sectionSelect = <label className={styles.mobileSelect}><LayoutList aria-hidden="true" /><select className={styles.input} aria-label="Edit section" value={activeSection} onChange={(event) => chooseSection(event.target.value)}>{sectionOptions.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select></label>;
  const stateLabel = saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved";
  const saveStatus = <span role="status" className={`${styles.saveState} ${dirty ? styles.unsaved : ""}`}>{saving ? <Loader2 className="animate-spin" /> : dirty ? <Circle /> : <Check />}{stateLabel}</span>;
  const publishDisabled = saving || !document || preview.status !== "ready" || preview.pageCount < 1 || preview.pageCount > 20;

  return <main className={styles.root}>
    {confirmation?.type === "logout" ? <ConfirmDialog title="Sign out?" description={dirty ? "You have unsaved changes. Sign out without saving?" : "Sign out of the admin panel?"} confirmLabel="Sign out" returnFocusRef={confirmationTrigger} fallbackFocusRef={mainRef} onConfirm={logout} onCancel={() => setConfirmation(null)} /> : null}
    {confirmation?.type === "section" ? <ConfirmDialog key={confirmation.id} title="Delete section?" description={`This removes “${confirmation.title}” from your resume draft.`} confirmLabel="Delete section" requiredText={confirmation.title} destructive returnFocusRef={confirmationTrigger} fallbackFocusRef={mainRef} onConfirm={() => removeSection(confirmation.id)} onCancel={() => setConfirmation(null)} /> : null}
    <div className={`${styles.shell} ${sidebarCollapsed ? styles.collapsed : ""}`}>
      {mobileMenuOpen ? <button type="button" aria-label="Close navigation overlay" onClick={() => setMobileMenuOpen(false)} className={styles.backdrop} /> : null}
      <AdminSidebar activeTab={activeTab} onChange={chooseTab} collapsed={sidebarCollapsed} onToggle={toggleSidebar} onLogout={requestLogout} mobileOpen={mobileMenuOpen} isMobile={isMobile} onMobileClose={() => setMobileMenuOpen(false)} activeSection={activeSection} onSection={chooseSection} sections={sections} document={document} session={session} unreadCount={messages.filter((message) => message.status === "unread").length} />
      <div ref={mainRef} tabIndex={-1} className={styles.main} inert={isMobile && mobileMenuOpen}>
        <header ref={topbarRef} className={styles.topbar}>
          <button type="button" onClick={() => setMobileMenuOpen(true)} className={`${styles.iconButton} ${styles.mobileMenu}`} aria-label="Open navigation" aria-controls="admin-navigation" aria-expanded={mobileMenuOpen}><Menu /></button>
          <div className={styles.breadcrumb}><span>Workspace</span><ChevronRight /><strong>{activeTab === "resume" ? "Resume studio" : activeTab === "logs" ? "Activity" : "Inbox"}</strong></div>
          <div className={styles.headerActions}>
            {activeTab === "resume" && document ? saveStatus : null}
            <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className={styles.iconButton}>{theme === "dark" ? <Sun /> : <Moon />}</button>
            <button type="button" onClick={refreshActivePanel} disabled={activePanelRefreshing} className={styles.iconButton} aria-label={`Refresh ${activePanelLabel} panel`} title={`Refresh ${activePanelLabel}`}><RefreshCw className={activePanelRefreshing ? "animate-spin" : ""} /></button>
            {activeTab === "resume" ? <>
              <button type="button" disabled={saving || !document} onClick={() => save("save")} className={`${styles.button} ${styles.saveButton}`}><Save />Save draft</button>
              <button type="button" disabled={publishDisabled} onClick={() => save("publish")} title={preview.status !== "ready" ? "Waiting for a valid PDF preview" : "Save and publish your changes"} className={styles.primaryButton}><Send />Publish</button>
            </> : null}
          </div>
        </header>
        {notice ? <div role="status" className={styles.notice}><span>{notice}</span>{removedSection?.message === notice ? <button type="button" className={styles.button} disabled={sections.length >= 16} onClick={undoRemoveSection}>Undo</button> : null}{cacheNeedsRetry ? <button type="button" disabled={saving} onClick={retryCache} className={styles.button}>Retry cache refresh</button> : null}<button type="button" onClick={() => setNotice("")} className={styles.iconButton} aria-label="Dismiss notice"><X /></button></div> : null}

        {activeTab === "resume" ? document ? <>
          <div className={styles.mobileToolbar}>{sectionSelect}<div className={styles.segments} role="group" aria-label="Workspace view"><button type="button" aria-pressed={resumeView === "edit"} onClick={() => setResumeView("edit")}>Edit</button><button type="button" aria-pressed={resumeView === "preview"} onClick={() => setResumeView("preview")}>Preview</button></div></div>
          <div className={styles.workspace}>
            <div ref={editorRef} className={`${styles.editor} ${resumeView !== "edit" ? styles.hideOnSmall : ""}`}>
              {sectionSelect}
              {activeSection === "sections" ? <ResumeSections sections={sections.map((section) => ({ ...section, includeInPdf: isCustomResumeSection(section) ? section.includeInPdf : document.pdfSections?.[section.id] !== false }))} onPdfChange={(id, value) => isCustomResumeSection(sections.find((section) => section.id === id)) ? editCustomSection(id, { includeInPdf: value }) : setPdfSection(id, value)} onRename={renameSection} onMove={moveSection} onRemove={requestRemoveSection} onAdd={addSection} onEdit={chooseSection} /> : null}
              {activeSection === "profile" ? <EditorSection title="Profile & contact"><div className={styles.fields}><Field label="Name" value={document.profile.name} onChange={(value) => set(["profile", "name"], value)} /><Field label="Email" type="email" value={document.profile.email} onChange={(value) => set(["profile", "email"], value)} /><Field label="Phone" value={document.profile.phone} onChange={(value) => set(["profile", "phone"], value)} /><Field label="Website" value={document.profile.website} onChange={(value) => set(["profile", "website"], value)} /><Field label="Location" value={document.profile.location} onChange={(value) => set(["profile", "location"], value)} /></div><LinkRows title="Social links" items={document.profile.socials} onChange={(links) => set(["profile", "socials"], links)} /></EditorSection> : null}
              {selectedSection ? renderResumeSection(selectedSection) : null}
              {activeSection === "layout" ? <EditorSection title="PDF layout"><PdfLayoutControls value={document.pdfLayout} onChange={(value) => set(["pdfLayout"], value)} /></EditorSection> : null}
              {activeSection === "history" ? <RevisionHistory history={history} onRestore={restore} status={tabStatus.history} onRetry={() => loadTab("history", { force: true })} /> : null}
            </div>
            <aside className={`${styles.preview} ${resumeView !== "preview" ? styles.hideOnSmall : ""}`} aria-label="Live preview">
              <div className={styles.previewBar}><div className={styles.segments} role="group" aria-label="Preview content"><button type="button" aria-pressed={previewKind === "pdf"} onClick={() => setPreviewKind("pdf")}><FileText />Resume PDF</button><button type="button" aria-pressed={previewKind === "homepage"} onClick={() => setPreviewKind("homepage")}><Monitor />Homepage</button></div><span className={styles.previewStatus}>{previewKind === "homepage" ? "Live preview" : preview.status === "ready" ? `${preview.pageCount} ${preview.pageCount === 1 ? "page" : "pages"}` : preview.status === "error" ? "Compile error" : preview.status === "oversize" ? "Over 20 pages" : <><Loader2 className="animate-spin" />Updating</>}</span></div>
              {previewKind === "pdf" ? <PdfPreview preview={preview} /> : <><div className={styles.webPreviewToolbar}><span>Homepage / Projects</span><div className={styles.segments} role="group" aria-label="Project preview width"><button type="button" aria-label="Fill preview width" title="Fill preview width" aria-pressed={previewSize === "fluid"} onClick={() => setPreviewSize("fluid")}><Monitor /></button><button type="button" aria-label="Mobile preview width" title="Mobile preview width" aria-pressed={previewSize === "mobile"} onClick={() => setPreviewSize("mobile")}><Smartphone /></button></div></div><div className={styles.webPreviewScroll}><div className={`${styles.webPreviewCanvas} ${previewSize === "mobile" ? styles.mobileCanvas : ""}`}><ProjectsPreview projects={document.projects} theme={theme} /></div></div></>}
            </aside>
          </div>
          <div className={styles.mobileSave}>{saveStatus}<button type="button" disabled={saving} onClick={() => save("save")} className={styles.button}><Save />Save draft</button></div>
        </> : <WorkspaceState label="resume" status={tabStatus.resume} onRetry={() => loadTab("resume", { force: true })} /> : null}
        {activeTab === "logs" ? ["ready", "refreshing"].includes(tabStatus.logs) ? <LogsWorkspace logs={logs} /> : <WorkspaceState label="activity" status={tabStatus.logs} onRetry={() => loadTab("logs", { force: true })} /> : null}
        {activeTab === "inbox" ? ["ready", "refreshing"].includes(tabStatus.inbox) ? <InboxWorkspace messages={messages} selected={selectedMessage} onSelect={setSelectedMessageId} onUpdate={updateMessage} /> : <WorkspaceState label="inbox" status={tabStatus.inbox} onRetry={() => loadTab("inbox", { force: true })} /> : null}
      </div>
    </div>
  </main>;
}


function AdminSidebar({ activeTab, onChange, collapsed, onToggle, onLogout, mobileOpen, isMobile, onMobileClose, activeSection, onSection, sections, document, session, unreadCount }) {
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (!mobileOpen || !isMobile) return undefined;
    const previous = window.document.activeElement;
    const overflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    sidebarRef.current.querySelector('[aria-label="Close navigation"]')?.focus();
    return () => { window.document.body.style.overflow = overflow; previous?.focus(); };
  }, [mobileOpen, isMobile]);
  function handleKeyDown(event) {
    if (event.key === "Escape") onMobileClose();
    if (event.key !== "Tab" || !isMobile || !mobileOpen) return;
    const focusable = [...sidebarRef.current.querySelectorAll('a[href], button:not(:disabled)')].filter((element) => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && window.document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && window.document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  const items = [{ id: "resume", label: "Resume studio", icon: FileText }, { id: "inbox", label: "Inbox", icon: Inbox }, { id: "logs", label: "Activity", icon: ScrollText }];
  return <aside id="admin-navigation" ref={sidebarRef} className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`} aria-label="Workspace navigation" aria-hidden={isMobile && !mobileOpen ? true : undefined} inert={isMobile && !mobileOpen} role={isMobile && mobileOpen ? "dialog" : undefined} aria-modal={isMobile && mobileOpen ? true : undefined} onKeyDown={handleKeyDown}>
    <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true">p.</span><div className={styles.brandText}><span className={styles.brandName}>itsparam.in</span><span className={styles.eyebrow}>Portfolio studio</span></div><button type="button" className={`${styles.iconButton} ${styles.mobileClose}`} onClick={onMobileClose} aria-label="Close navigation"><X /></button></div>
    <nav className={styles.nav} aria-label="Admin pages">{items.map((item) => <button key={item.id} type="button" aria-current={activeTab === item.id ? "page" : undefined} onClick={() => onChange(item.id)} title={item.label}><item.icon /><span className={styles.navLabel}>{item.label}</span>{item.id === "inbox" && unreadCount > 0 ? <span className={styles.navBadge}>{unreadCount}</span> : null}</button>)}</nav>
    {activeTab === "resume" && document ? <nav className={styles.sectionNav} aria-label="Resume sections"><button type="button" aria-current={activeSection === "sections" ? "true" : undefined} onClick={() => onSection("sections")}><LayoutList /><span>Sections</span></button><button type="button" aria-current={activeSection === "profile" ? "true" : undefined} onClick={() => onSection("profile")}><UserRound /><span>Profile & contact</span></button>{sections.map((section, index) => <button key={section.id} type="button" aria-current={activeSection === section.id ? "true" : undefined} onClick={() => onSection(section.id)} title={section.title}><span className={styles.sectionNumber}>{String(index + 1).padStart(2,"0")}</span><span className={(isCustomResumeSection(section) ? section.includeInPdf === false : document.pdfSections?.[section.id] === false) ? styles.pdfHidden : ""}>{section.title}</span></button>)}<button type="button" aria-current={activeSection === "layout" ? "true" : undefined} onClick={() => onSection("layout")}><SlidersHorizontal /><span>PDF layout</span></button><button type="button" aria-current={activeSection === "history" ? "true" : undefined} onClick={() => onSection("history")}><History /><span>Revision history</span></button></nav> : null}
    <div className={styles.sideFooter}><a href="/" target="_blank" rel="noreferrer" title="View portfolio"><ArrowUpRight /><span className={styles.navLabel}>View portfolio</span></a><button type="button" onClick={onToggle} className={styles.desktopCollapse} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}<span className={styles.navLabel}>Collapse sidebar</span></button></div>
    <div className={styles.account}><span className={styles.avatar}><UserRound className="h-4 w-4" /></span><div className={styles.accountText}><strong title={session.email}>{session.email}</strong><span>Owner</span></div><button type="button" onClick={onLogout} className={styles.iconButton} title="Sign out" aria-label="Sign out"><LogOut /></button></div>
  </aside>;
}

function RevisionHistory({ history, onRestore, status, onRetry }) {
  return <EditorSection title="Revision history">
    {status === "error" && !history.length ? <div><p className={styles.hint}>Revision history could not load.</p><button type="button" onClick={onRetry} className={styles.button}>Try again</button></div> : null}
    {["idle", "loading"].includes(status) && !history.length ? <p className={styles.hint}>Loading revision history…</p> : null}
    {history.map((revision) => <div key={revision.id} className={styles.revision}><div><strong>{revision.status === "published" ? "Published" : "Draft"}</strong><span>{new Date(revision.created_at).toLocaleString()}</span></div>{revision.page_count >= 1 && revision.page_count <= 20 ? <button type="button" onClick={() => onRestore(revision.id)} className={styles.button}><RotateCcw />Restore</button> : null}</div>)}
    {status === "ready" && !history.length ? <p className={styles.hint}>Your saved drafts and published versions will appear here.</p> : null}
  </EditorSection>;
}

function PdfPreview({ preview }) {
  const updating = ["idle", "stale", "compiling"].includes(preview.status);
  return <>{preview.status === "error" ? <details className={styles.previewError}><summary>View compilation details</summary><pre>{preview.log}</pre></details> : null}{preview.url ? <iframe title="Compiled resume PDF" src={`${preview.url}#toolbar=0&navpanes=0&scrollbar=1`} className={styles.pdfFrame} /> : <div className={styles.previewEmpty}>{updating ? <><Loader2 className="animate-spin" /><p>Preparing your resume…</p></> : <><FileText /><p>Update your resume to try the preview again.</p></>}</div>}</>;
}

function WorkspaceState({ label, status, onRetry }) {
  return <div className={styles.loading}>{status === "error" ? <div><p>Unable to load {label}.</p><button type="button" onClick={onRetry} className={styles.button}>Try again</button></div> : <><Loader2 className="animate-spin" />Loading {label}…</>}</div>;
}

function EditorSection({ title, onAdd, children, sectionId }) {
  return <section data-resume-section={sectionId} aria-label={`${title} editor`} className={`${styles.section} ${["experience", "education", "projects", "skills"].includes(sectionId) ? styles.entrySection : ""}`}>
    <header className={styles.sectionHead}><div className={styles.sectionTitle}><h1>{title}</h1></div>{onAdd ? <button type="button" onClick={onAdd} className={styles.button} aria-label={`Add ${title.toLowerCase()} entry`}><Plus />Add</button> : null}</header>
    <div className={styles.sectionBody}>{children}</div>
  </section>;
}
function Item({ title, controls, children, pdfIncluded, onPdfChange }) {
  return <article aria-label={title} className={styles.item}><div className={styles.itemBar}><h2 className={styles.itemIndex}>{title}</h2><div className={styles.itemTools}>{onPdfChange ? <PdfCheck included={pdfIncluded} onChange={onPdfChange} label={`Include ${title} in PDF`} /> : null}{controls}</div></div>{children}</article>;
}
