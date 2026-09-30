"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronDown, FileText, History, Inbox, Loader2, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Plus, RefreshCw, RotateCcw, Save, ScrollText, Send, Trash2, UserRound, X } from "lucide-react";

import { generateResumeLatex } from "@/lib/latex";

const inputClass = "w-full rounded-xl border border-prussian-blue/15 bg-white px-3 py-2 text-sm text-prussian-blue outline-none focus:border-sky-surge";

function Field({ label, value, onChange, type = "text" }) { return <label className="block space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-prussian-blue/55">{label}</span><input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>; }
function Area({ label, value, onChange, rows = 4 }) { return <label className="block space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-prussian-blue/55">{label}</span><textarea rows={rows} value={value || ""} onChange={(event) => onChange(event.target.value)} className={`${inputClass} resize-y`} /></label>; }
function MoveButtons({ index, length, onMove, onRemove }) { return <div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button><button type="button" disabled={index === length - 1} onClick={() => onMove(index, index + 1)} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button><button type="button" onClick={onRemove} className="rounded-lg border p-2 text-rose-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button></div>; }
function toBase64(bytes) { let binary = ""; const chunk = 0x8000; for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk)); return btoa(binary); }

export default function AdminDashboard({ session }) {
  const router = useRouter();
  const worker = useRef(null);
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [resumeView, setResumeView] = useState("edit");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [now, setNow] = useState(null);
  const [preview, setPreview] = useState({ status: "idle", url: "", bytes: null, pageCount: 0, log: "" });
  const [notice, setNotice] = useState("");
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
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    worker.current = new Worker("/workers/resume-compiler.worker.js");
    worker.current.onmessage = (event) => {
      if (event.data.requestId !== compileRequest.current) return;
      if (event.data.type === "success") { const bytes = new Uint8Array(event.data.pdf); const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })); setPreview((old) => { if (old.url) URL.revokeObjectURL(old.url); return { status: event.data.pageCount >= 1 && event.data.pageCount <= 2 ? "ready" : "oversize", url, bytes, pageCount: event.data.pageCount, log: event.data.log }; }); }
      else setPreview((old) => ({ ...old, status: "error", log: event.data.log || "Compilation failed." }));
    };
    return () => { worker.current?.terminate(); };
  }, []);
  useEffect(() => { if (!document || !worker.current) return undefined; const requestId = compileRequest.current + 1; compileRequest.current = requestId; setPreview((old) => ({ ...old, status: old.url ? "stale" : "compiling" })); const timer = window.setTimeout(() => { setPreview((old) => ({ ...old, status: "compiling" })); worker.current.postMessage({ type: "compile", requestId, source: generateResumeLatex(document) }); }, 700); return () => window.clearTimeout(timer); }, [document]);

  function set(path, value) { setDirty(true); setDocument((current) => { const clone = structuredClone(current); let target = clone; for (let i = 0; i < path.length - 1; i += 1) target = target[path[i]]; target[path.at(-1)] = value; return clone; }); }
  function move(collection, from, to) { setDirty(true); setDocument((current) => { const clone = structuredClone(current); const [item] = clone[collection].splice(from, 1); clone[collection].splice(to, 0, item); return clone; }); }
  function remove(collection, index) { setDirty(true); setDocument((current) => ({ ...current, [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index) })); }
  function add(collection, item) { setDirty(true); setDocument((current) => ({ ...current, [collection]: [...current[collection], item] })); }

  async function save(action) {
    setSaving(true); setNotice("");
    try { const payload = { action, content: document, baseDraftRevisionId: revisionState.draftRevisionId, basePublishedRevisionId: revisionState.publishedRevisionId }; if (action === "publish") { payload.pageCount = preview.pageCount; payload.pdfBase64 = toBase64(preview.bytes); } const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setHistory(result.history || []); loadedTabs.current.add("history"); setTabStatus((current) => ({ ...current, history: "ready" })); setRevisionState({ draftRevisionId: result.draftRevisionId ?? null, publishedRevisionId: result.publishedRevisionId ?? null }); setDirty(false); setCacheNeedsRetry(Boolean(result.cacheWarning)); setNotice(result.cacheWarning || (action === "publish" ? "Published successfully." : "Draft saved.")); }
    catch (error) { setNotice(error.message || "Save failed."); }
    finally { setSaving(false); }
  }
  async function restore(revisionId) { if (!window.confirm("Restore and publish this revision?")) return; setSaving(true); try { const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "restore", revisionId, basePublishedRevisionId: revisionState.publishedRevisionId }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); await loadTab("resume", { force: true }); setCacheNeedsRetry(Boolean(result.cacheWarning)); setNotice(result.cacheWarning || "Revision restored and published."); } catch (error) { setNotice(error.message); } finally { setSaving(false); } }
  async function retryCache() { setSaving(true); try { const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "refresh" }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setCacheNeedsRetry(false); setNotice("Public cache refreshed."); } catch (error) { setNotice(error.message); } finally { setSaving(false); } }
  async function updateMessage(id, action) { const response = await fetch("/api/admin/inbox", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action }) }); const result = await response.json(); if (!response.ok) { setNotice(result.error); return; } await loadTab("inbox", { force: true }); }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.refresh(); }
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

  return <main className="min-h-screen bg-[#eef3f7] text-prussian-blue">
    <div className={`grid min-h-screen transition-[grid-template-columns] duration-300 ${sidebarCollapsed ? "md:grid-cols-[82px_minmax(0,1fr)]" : "md:grid-cols-[250px_minmax(0,1fr)]"}`}>
      {mobileMenuOpen ? <button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-ink-black/35 backdrop-blur-[2px] md:hidden" /> : null}
      <AdminSidebar activeTab={activeTab} onChange={chooseTab} collapsed={sidebarCollapsed} onToggle={toggleSidebar} onLogout={logout} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-prussian-blue/10 bg-white/92 px-4 py-3 backdrop-blur sm:px-6">
          <div className="relative flex items-center justify-between md:hidden">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-prussian-blue/10" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
            <button type="button" onClick={() => setProfileOpen((current) => !current)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-prussian-blue text-bright-snow" aria-label="Show signed in account" aria-expanded={profileOpen}><UserRound className="h-5 w-5" /></button>
            {profileOpen ? <div className="absolute right-0 top-12 max-w-[calc(100vw-2rem)] rounded-xl border border-prussian-blue/10 bg-white px-4 py-3 text-sm shadow-xl"><p className="truncate font-heading font-semibold">{session.email}</p><p className="mt-1 text-xs text-prussian-blue/45">Owner</p></div> : null}
          </div>
          {activeTab === "resume" ? <div className="mt-3 grid grid-cols-2 gap-2 md:hidden"><button type="button" disabled={saving || !document} onClick={() => save("save")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-prussian-blue/15 px-4 py-2.5 text-sm disabled:opacity-40"><Save className="h-4 w-4" />Save draft</button><button type="button" disabled={saving || !document || preview.status !== "ready" || preview.pageCount < 1 || preview.pageCount > 2} onClick={() => save("publish")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-surge px-4 py-2.5 text-sm font-semibold text-ink-black disabled:opacity-40"><Send className="h-4 w-4" />Publish</button></div> : null}
          <div className="hidden items-center justify-between gap-5 md:flex">
            <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-2 font-heading font-semibold"><UserRound className="h-4 w-4 text-sky-surge" />{session.email}<span className="rounded-full bg-sky-surge/12 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">Owner</span></span>
              <span className="opacity-60">{session.browser || "Unknown browser"} · {session.os || "Unknown OS"}</span>
              <span className="opacity-60">IP {session.ip_address || "Unavailable"}</span>
              <span className="font-mono opacity-60">{now ? now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium" }) : "-"}</span>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={refreshActivePanel} disabled={activePanelRefreshing} className="inline-flex items-center gap-2 rounded-full border border-prussian-blue/15 px-4 py-2 text-sm font-semibold disabled:cursor-wait disabled:opacity-60" aria-label={`Refresh ${activePanelLabel} panel`}><RefreshCw className={`h-4 w-4 ${activePanelRefreshing ? "animate-spin" : ""}`} />Refresh {activePanelLabel}</button>
              {activeTab === "resume" ? <><button type="button" disabled={saving || !document} onClick={() => save("save")} className="inline-flex items-center gap-2 rounded-full border border-prussian-blue/15 px-4 py-2 text-sm disabled:opacity-40"><Save className="h-4 w-4" />Save draft</button><button type="button" disabled={saving || !document || preview.status !== "ready" || preview.pageCount < 1 || preview.pageCount > 2} onClick={() => save("publish")} className="inline-flex items-center gap-2 rounded-full bg-sky-surge px-4 py-2 text-sm font-semibold text-ink-black disabled:opacity-40"><Send className="h-4 w-4" />Save &amp; Publish</button></> : null}
            </div>
          </div>
        </header>
        {notice && <div role="status" className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-surge/25 bg-sky-surge/10 px-6 py-3 text-sm"><span>{notice}</span>{cacheNeedsRetry && <button type="button" disabled={saving} onClick={retryCache} className="rounded-full border border-prussian-blue/20 px-3 py-1.5 font-semibold">Retry cache refresh</button>}</div>}

        {activeTab === "resume" ? document ? <>
          <div className="z-30 flex justify-center border-b border-prussian-blue/10 bg-[#eef3f7] p-3 xl:hidden">
            <div className="grid w-full max-w-sm grid-cols-2 rounded-xl border border-prussian-blue/10 bg-white p-1">
              <button type="button" onClick={() => setResumeView("edit")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${resumeView === "edit" ? "bg-prussian-blue text-white" : "text-prussian-blue/60"}`}>Edit</button>
              <button type="button" onClick={() => setResumeView("preview")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${resumeView === "preview" ? "bg-prussian-blue text-white" : "text-prussian-blue/60"}`}>Preview</button>
            </div>
          </div>
          <div className="grid items-start xl:grid-cols-2">
          <div className={`${resumeView === "edit" ? "block" : "hidden"} space-y-4 p-4 sm:p-6 xl:block xl:h-[calc(100vh-77px)] xl:overflow-y-auto`}>
            <div><h1 className="font-heading text-3xl font-bold">Resume</h1></div>
        <EditorSection title="Profile & summary" collapsible defaultOpen><div className="grid gap-3 sm:grid-cols-2"><Field label="Name" value={document.profile.name} onChange={(value) => set(["profile", "name"], value)} /><Field label="Email" type="email" value={document.profile.email} onChange={(value) => set(["profile", "email"], value)} /><Field label="Phone" value={document.profile.phone} onChange={(value) => set(["profile", "phone"], value)} /><Field label="Website" value={document.profile.website} onChange={(value) => set(["profile", "website"], value)} /><Field label="Location" value={document.profile.location} onChange={(value) => set(["profile", "location"], value)} /></div><Area label="Social links · Label | URL" value={document.profile.socials.map((link) => `${link.label} | ${link.href}`).join("\n")} onChange={(value) => set(["profile", "socials"], value.split("\n").map((line) => { const [label, href] = line.split("|").map((part) => part.trim()); return { label: label || "Link", href: href || "" }; }).filter((link) => link.href))} /><Area label="Summary" value={document.summary} onChange={(value) => set(["summary"], value)} /></EditorSection>
        <EditorSection title="Experience" collapsible onAdd={() => add("experience", { id: crypto.randomUUID(), role: "New role", company: "Company", dates: "Dates", link: "", bullets: ["Achievement"] })}>{document.experience.map((item, index) => <Item key={item.id} title={`${item.role} · ${item.company}`} controls={<MoveButtons index={index} length={document.experience.length} onMove={(from, to) => move("experience", from, to)} onRemove={() => remove("experience", index)} />}><div className="grid gap-3 sm:grid-cols-2"><Field label="Role" value={item.role} onChange={(value) => set(["experience", index, "role"], value)} /><Field label="Company" value={item.company} onChange={(value) => set(["experience", index, "company"], value)} /><Field label="Dates" value={item.dates} onChange={(value) => set(["experience", index, "dates"], value)} /><Field label="Link" value={item.link} onChange={(value) => set(["experience", index, "link"], value)} /></div><Area label="Bullets · one per line" value={item.bullets.join("\n")} onChange={(value) => set(["experience", index, "bullets"], value.split("\n").filter(Boolean))} /></Item>)}</EditorSection>
        <EditorSection title="Education" collapsible onAdd={() => add("education", { id: crypto.randomUUID(), school: "School", program: "Program", dates: "Dates", details: ["Detail"] })}>{document.education.map((item, index) => <Item key={item.id} title={item.school} controls={<MoveButtons index={index} length={document.education.length} onMove={(from, to) => move("education", from, to)} onRemove={() => remove("education", index)} />}><div className="grid gap-3 sm:grid-cols-2"><Field label="School" value={item.school} onChange={(value) => set(["education", index, "school"], value)} /><Field label="Program" value={item.program} onChange={(value) => set(["education", index, "program"], value)} /><Field label="Dates" value={item.dates} onChange={(value) => set(["education", index, "dates"], value)} /></div><Area label="Details · one per line" value={item.details.join("\n")} onChange={(value) => set(["education", index, "details"], value.split("\n").filter(Boolean))} /></Item>)}</EditorSection>
        <EditorSection title="Projects" collapsible onAdd={() => add("projects", { id: crypto.randomUUID(), name: "New project", subtitle: "", description: "Description", bullets: ["Achievement"], skills: [], image: "/projects/pocket-coder.png", theme: "surface", links: [] })}>{document.projects.map((item, index) => <Item key={item.id} title={item.name} controls={<MoveButtons index={index} length={document.projects.length} onMove={(from, to) => move("projects", from, to)} onRemove={() => remove("projects", index)} />}><div className="grid gap-3 sm:grid-cols-2"><Field label="Name" value={item.name} onChange={(value) => set(["projects", index, "name"], value)} /><Field label="Subtitle" value={item.subtitle} onChange={(value) => set(["projects", index, "subtitle"], value)} /><Field label="Image path" value={item.image} onChange={(value) => set(["projects", index, "image"], value)} /><Field label="Theme" value={item.theme} onChange={(value) => set(["projects", index, "theme"], value)} /></div><Area label="Description" value={item.description} onChange={(value) => set(["projects", index, "description"], value)} /><Area label="Bullets · one per line" value={item.bullets.join("\n")} onChange={(value) => set(["projects", index, "bullets"], value.split("\n").filter(Boolean))} /><Field label="Skills · comma separated" value={item.skills.join(", ")} onChange={(value) => set(["projects", index, "skills"], value.split(",").map((part) => part.trim()).filter(Boolean))} /><Area label="Links · Label | URL" value={item.links.map((link) => `${link.label} | ${link.href}`).join("\n")} onChange={(value) => set(["projects", index, "links"], value.split("\n").map((line) => { const [label, href] = line.split("|").map((part) => part.trim()); return { label: label || "Link", href: href || "" }; }).filter((link) => link.href))} /></Item>)}</EditorSection>
        <EditorSection title="Skills" collapsible onAdd={() => add("skills", { label: "Group", items: [] })}>{document.skills.map((group, index) => <Item key={`${group.label}-${index}`} title={group.label} controls={<MoveButtons index={index} length={document.skills.length} onMove={(from, to) => move("skills", from, to)} onRemove={() => remove("skills", index)} />}><Field label="Group" value={group.label} onChange={(value) => set(["skills", index, "label"], value)} /><Field label="Items · comma separated" value={group.items.join(", ")} onChange={(value) => set(["skills", index, "items"], value.split(",").map((part) => part.trim()).filter(Boolean))} /></Item>)}</EditorSection>
        <EditorSection title="Co-Curricular & Achievements" collapsible onAdd={() => add("achievements", "")}>
          {document.achievements.map((achievement, index) => <Item key={index} title={`Point ${index + 1}`} controls={<MoveButtons index={index} length={document.achievements.length} onMove={(from, to) => move("achievements", from, to)} onRemove={() => remove("achievements", index)} />}>
            <Area label={`Achievement ${index + 1}`} rows={3} value={achievement} onChange={(value) => set(["achievements", index], value)} />
          </Item>)}
          {!document.achievements.length ? <p className="text-sm text-prussian-blue/55">Add a point for a co-curricular activity or achievement.</p> : null}
        </EditorSection>
            <RevisionHistory history={history} onRestore={restore} status={tabStatus.history} onRetry={() => loadTab("history", { force: true })} />
          </div>
          <PdfPreview preview={preview} className={resumeView === "preview" ? "block" : "hidden xl:block"} />
        </div></> : <WorkspaceState label="resume" status={tabStatus.resume} onRetry={() => loadTab("resume", { force: true })} /> : null}

        {activeTab === "logs" ? ["ready", "refreshing"].includes(tabStatus.logs) ? <LogsWorkspace logs={logs} /> : <WorkspaceState label="activity logs" status={tabStatus.logs} onRetry={() => loadTab("logs", { force: true })} /> : null}
        {activeTab === "inbox" ? ["ready", "refreshing"].includes(tabStatus.inbox) ? <InboxWorkspace messages={messages} selected={selectedMessage} onSelect={setSelectedMessageId} onUpdate={updateMessage} /> : <WorkspaceState label="inbox" status={tabStatus.inbox} onRetry={() => loadTab("inbox", { force: true })} /> : null}
        <button type="button" onClick={refreshActivePanel} disabled={activePanelRefreshing} className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-prussian-blue text-bright-snow shadow-[0_12px_36px_rgba(8,28,42,0.32)] transition hover:bg-ink-black disabled:cursor-wait disabled:opacity-70 md:hidden" aria-label={`Refresh ${activePanelLabel} panel`} title={`Refresh ${activePanelLabel}`}><RefreshCw className={`h-5 w-5 ${activePanelRefreshing ? "animate-spin" : ""}`} /></button>
      </div>
    </div>
  </main>;
}

function AdminSidebar({ activeTab, onChange, collapsed, onToggle, onLogout, mobileOpen, onMobileClose }) {
  const items = [
    { id: "resume", label: "Resume", icon: FileText },
    { id: "logs", label: "Logs", icon: ScrollText },
    { id: "inbox", label: "Inbox", icon: Inbox },
  ];
  return <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(82vw,290px)] min-w-0 -translate-x-full flex-col items-stretch gap-2 border-r border-bright-snow/10 bg-ink-black p-4 text-bright-snow shadow-2xl transition-transform md:sticky md:top-0 md:h-screen md:w-auto md:translate-x-0 md:shadow-none ${mobileOpen ? "translate-x-0" : ""}`}>
    <div className="flex items-center justify-between md:hidden"><p className="font-heading text-lg font-bold">itsparam.in</p><button type="button" onClick={onMobileClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bright-snow/10" aria-label="Close navigation"><X className="h-5 w-5" /></button></div>
    <div className="hidden items-center justify-between gap-2 md:flex"><div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}><p className="font-heading text-lg font-bold">itsparam.in</p><p className="text-xs text-bright-snow/45">Private workspace</p></div><button type="button" onClick={onToggle} className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-bright-snow/10 text-bright-snow/70 hover:border-sky-surge hover:text-sky-surge" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</button></div>
    <nav className="mt-8 flex flex-1 flex-col gap-2">
      {items.map((item) => <button key={item.id} type="button" onClick={() => onChange(item.id)} className={`inline-flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm transition md:justify-start ${activeTab === item.id ? "bg-sky-surge text-ink-black" : "text-bright-snow/65 hover:bg-bright-snow/8 hover:text-bright-snow"}`} title={item.label}><item.icon className="h-5 w-5 shrink-0" /><span className={collapsed ? "md:hidden" : ""}>{item.label}</span></button>)}
    </nav>
    <button type="button" onClick={onLogout} className="inline-flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 transition hover:bg-rose-400/10 md:justify-start" title="Logout"><LogOut className="h-5 w-5 shrink-0" /><span className={collapsed ? "md:hidden" : ""}>Logout</span></button>
  </aside>;
}

function RevisionHistory({ history, onRestore, status, onRetry }) {
  return <EditorSection title="Revision history" icon={<History className="h-5 w-5" />} collapsible>
    {status === "error" && !history.length ? <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-rose-700">Revision history could not load.</span><button type="button" onClick={onRetry} className="rounded-full border border-prussian-blue/15 px-3 py-1.5 font-semibold">Try again</button></div> : null}
    {["idle", "loading"].includes(status) && !history.length ? <div className="flex items-center gap-2 text-sm opacity-55"><Loader2 className="h-4 w-4 animate-spin text-sky-surge" />Loading revision history…</div> : null}
    {history.length ? <>{status === "refreshing" ? <div className="mb-3 flex items-center gap-2 text-xs opacity-55"><Loader2 className="h-3.5 w-3.5 animate-spin text-sky-surge" />Refreshing history…</div> : null}{history.map((revision) => <div key={revision.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-prussian-blue/10 p-3 text-sm"><div><span className={`rounded-full px-2 py-1 text-xs ${revision.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>{revision.status}</span><span className="ml-2 opacity-60">{new Date(revision.created_at).toLocaleString()}</span></div>{revision.page_count >= 1 && revision.page_count <= 2 ? <button type="button" onClick={() => onRestore(revision.id)} className="inline-flex items-center gap-1 rounded-full border border-prussian-blue/15 px-3 py-1.5"><RotateCcw className="h-3.5 w-3.5" />Restore</button> : null}</div>)}</> : null}
    {status === "ready" && !history.length ? <p className="text-sm opacity-55">No saved revisions yet.</p> : null}
  </EditorSection>;
}

function PdfPreview({ preview, className = "" }) {
  return <aside className={`${className} border-t border-prussian-blue/10 p-4 sm:p-6 xl:sticky xl:top-[77px] xl:h-[calc(100vh-77px)] xl:border-l xl:border-t-0`}><div className="h-[calc(100svh-190px)] min-h-[520px] overflow-hidden rounded-[1.5rem] border border-prussian-blue/10 bg-white xl:h-full">{preview.url ? <iframe title="Compiled resume PDF" src={`${preview.url}#toolbar=0&navpanes=0&scrollbar=1`} className="h-full w-full bg-white" /> : <div className="flex h-full items-center justify-center bg-white"><Loader2 className="h-7 w-7 animate-spin text-sky-surge" /></div>}</div></aside>;
}

function WorkspaceState({ label, status, onRetry }) {
  return <div className="flex min-h-[55vh] items-center justify-center p-6">{status === "error" ? <div className="text-center"><p className="font-heading text-xl font-semibold">Unable to load {label}.</p><button type="button" onClick={onRetry} className="mt-4 rounded-full bg-prussian-blue px-5 py-2 text-sm font-semibold text-bright-snow">Try again</button></div> : <div className="flex items-center gap-3 text-sm text-prussian-blue/60"><Loader2 className="h-5 w-5 animate-spin text-sky-surge" />Loading {label}…</div>}</div>;
}

function LogsWorkspace({ logs }) {
  return <div className="space-y-6 p-4 sm:p-6">
    <div><p className="font-heading text-xs uppercase tracking-[0.2em] text-sky-surge">Private activity</p><h1 className="mt-1 font-heading text-3xl font-bold">Logs, sessions & users</h1><p className="mt-2 font-description text-sm opacity-60">Authentication and publishing activity with request metadata. Passwords and message bodies are never logged here.</p></div>
    <div className="grid gap-4 lg:grid-cols-3"><Metric label="Audit events" value={logs.events.length} /><Metric label="Sessions" value={logs.sessions.length} /><Metric label="Admin users" value={logs.users.length} /></div>
    <EditorSection title="Users">{logs.users.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-prussian-blue/10 p-3 text-sm"><div><p className="font-semibold">{user.email}</p><p className="text-xs opacity-50">Created {new Date(user.created_at).toLocaleString()}</p></div><span className={`rounded-full px-2 py-1 text-xs ${user.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{user.active ? "Active" : "Disabled"}</span></div>)}</EditorSection>
    <EditorSection title="Sessions">{logs.sessions.map((item, index) => <div key={`${item.user_id}-${item.created_at}-${index}`} className="grid gap-2 rounded-xl border border-prussian-blue/10 p-3 text-sm lg:grid-cols-[1fr_1fr_auto]"><div><p className="font-semibold">{item.email}</p><p className="text-xs opacity-55">{item.browser || "Unknown"} · {item.os || "Unknown"}</p></div><div className="text-xs leading-5 opacity-60"><p>IP {item.ip_address || "Unavailable"}</p><p>{new Date(item.created_at).toLocaleString()}</p></div><span className={`h-fit rounded-full px-2 py-1 text-xs ${item.revoked_at ? "bg-slate-100" : "bg-emerald-100 text-emerald-700"}`}>{item.revoked_at ? "Revoked" : "Active"}</span></div>)}</EditorSection>
    <EditorSection title="Audit trail">{logs.events.map((event) => <article key={event.id} className="rounded-xl border border-prussian-blue/10 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="font-heading font-semibold">{event.event_type.replaceAll("_", " ")}</span><span className={`ml-2 rounded-full px-2 py-1 text-[10px] uppercase ${event.outcome === "success" ? "bg-emerald-100 text-emerald-700" : event.outcome === "throttled" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{event.outcome}</span></div><time className="text-xs opacity-50">{new Date(event.created_at).toLocaleString()}</time></div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs opacity-55"><span>{event.browser || "Unknown"} / {event.os || "Unknown"}</span><span>IP {event.ip_address || "Unavailable"}</span><span>Hash {event.ip_hash ? event.ip_hash.slice(0, 12) : "-"}</span></div>{event.metadata && Object.keys(event.metadata).length ? <pre className="mt-3 overflow-x-auto rounded-lg bg-[#f4f7f9] p-3 text-xs">{JSON.stringify(event.metadata, null, 2)}</pre> : null}</article>)}</EditorSection>
  </div>;
}

function InboxWorkspace({ messages, selected, onSelect, onUpdate }) {
  return <div className="p-4 sm:p-6"><div><p className="font-heading text-xs uppercase tracking-[0.2em] text-sky-surge">Contact inbox</p><h1 className="mt-1 font-heading text-3xl font-bold">Messages that survived delivery</h1><p className="mt-2 font-description text-sm opacity-60">Stored first, notified second, so an email outage never loses a message.</p></div>
    <div className="mt-6 grid min-h-[660px] overflow-hidden rounded-[2rem] border border-prussian-blue/10 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="border-b border-prussian-blue/10 p-3 lg:border-b-0 lg:border-r"><div className="max-h-[620px] space-y-2 overflow-y-auto">{messages.length ? messages.map((message) => <button key={message.id} type="button" onClick={() => onSelect(message.id)} className={`w-full rounded-2xl p-4 text-left transition ${selected?.id === message.id ? "bg-prussian-blue text-bright-snow" : "hover:bg-[#eef3f7]"}`}><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${message.status === "unread" ? "bg-sky-surge" : "bg-slate-300"}`} /><p className="truncate font-heading text-sm font-semibold">{message.subject || "Portfolio enquiry"}</p></div><p className="mt-1 truncate font-description text-xs opacity-65">{message.name} · {message.email}</p><p className="mt-2 text-[10px] uppercase tracking-[0.12em] opacity-45">{new Date(message.created_at).toLocaleString()}</p></button>) : <p className="p-6 text-center text-sm opacity-55">No messages yet.</p>}</div></div>
      <div className="p-5 sm:p-8">{selected ? <article><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-sky-surge">{selected.status}</p><h2 className="mt-1 font-heading text-2xl font-bold">{selected.subject || "Portfolio enquiry"}</h2><a href={`mailto:${selected.email}`} className="mt-2 inline-block text-sm text-sky-surge">{selected.name} · {selected.email}</a></div><div className="text-right text-xs opacity-55"><p>{new Date(selected.created_at).toLocaleString()}</p><p className="mt-1">Notification: {selected.notification_status}</p></div></div><p className="mt-8 whitespace-pre-wrap rounded-2xl bg-[#f6f8fa] p-5 font-description text-sm leading-7">{selected.message}</p><div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => onUpdate(selected.id, selected.status === "read" ? "unread" : "read")} className="rounded-full border border-prussian-blue/15 px-4 py-2 text-xs">{selected.status === "read" ? "Mark unread" : "Mark read"}</button>{selected.notification_status === "failed" ? <button type="button" onClick={() => onUpdate(selected.id, "retry")} className="rounded-full bg-sky-surge px-4 py-2 text-xs font-semibold text-ink-black">Retry notification</button> : null}<button type="button" onClick={() => onUpdate(selected.id, "archive")} className="rounded-full border border-prussian-blue/15 px-4 py-2 text-xs">Archive</button></div></article> : <div className="flex h-full items-center justify-center text-sm opacity-55">Select a message.</div>}</div>
    </div>
  </div>;
}

function Metric({ label, value }) { return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="font-heading text-3xl font-bold">{value}</p><p className="mt-1 text-xs uppercase tracking-[0.16em] opacity-50">{label}</p></div>; }

function EditorSection({ title, icon, onAdd, children, collapsible = false, defaultOpen = false }) {
  const content = <><div className={onAdd ? "mb-4 flex justify-end" : "hidden"}>{onAdd ? <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm"><Plus className="h-4 w-4" />Add</button> : null}</div><div className="space-y-4">{children}</div></>;
  if (collapsible) return <details open={defaultOpen} className="group overflow-hidden rounded-[1.35rem] border border-prussian-blue/10 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 sm:px-5"><h2 className="flex items-center gap-2 font-heading text-lg font-bold">{icon}{title}</h2><ChevronDown className="h-5 w-5 transition group-open:rotate-180" /></summary><div className="border-t border-prussian-blue/8 p-4 sm:p-5">{content}</div></details>;
  return <section className="rounded-[1.5rem] border border-prussian-blue/10 bg-white p-4 shadow-sm sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-heading text-xl font-bold">{icon}{title}</h2>{onAdd && <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm"><Plus className="h-4 w-4" />Add</button>}</div><div className="space-y-4">{children}</div></section>;
}
function Item({ title, controls, children }) { return <article className="space-y-3 rounded-2xl border border-prussian-blue/10 bg-[#f8fafc] p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-heading font-semibold">{title}</h3>{controls}</div>{children}</article>; }
