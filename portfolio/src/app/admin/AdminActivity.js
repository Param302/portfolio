"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Archive, ArrowLeft, CheckCheck, Inbox, Loader2, Mail, Monitor, RotateCcw, Search, Users } from "lucide-react";

import styles from "./AdminActivity.module.css";

function formatDate(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function Status({ children, tone = "neutral" }) {
  return <span className={`${styles.status} ${tone === "positive" ? styles.positive : tone === "danger" ? styles.danger : ""}`}>{children}</span>;
}

function Panel({ title, count, children }) {
  return <section className={styles.panel}>
    <header className={styles.panelHeader}><h2>{title}</h2><span className={styles.count}>{count}</span></header>
    {children}
  </section>;
}

function EmptyState({ icon: Icon = Inbox, title, children }) {
  return <div className={styles.emptyState}><Icon size={24} aria-hidden="true" /><h3>{title}</h3>{children ? <p>{children}</p> : null}</div>;
}

export function LogsWorkspace({ logs }) {
  const events = logs.events || [];
  const sessions = logs.sessions || [];
  const users = logs.users || [];
  const metrics = [
    { label: "Audit events", value: events.length, icon: Activity },
    { label: "Sessions", value: sessions.length, icon: Monitor },
    { label: "Admin users", value: users.length, icon: Users },
  ];

  return <div className={styles.workspace}>
    <header className={styles.pageHeader}><h1>Activity</h1><p>Sign-ins, publishing activity, and access to your workspace.</p></header>
    <div className={styles.metrics}>{metrics.map(({ label, value, icon: Icon }) => <div key={label} className={styles.metric}>
      <div><p>{label}</p><strong>{value}</strong></div><Icon size={20} aria-hidden="true" />
    </div>)}</div>
    <div className={styles.accessGrid}>
      <Panel title="Users" count={users.length}>
        {users.length ? <ul className={styles.recordList}>{users.map((user) => <li key={user.id} className={styles.userRow}>
          <div className={styles.recordText}><strong>{user.email}</strong><p>Created {formatDate(user.created_at)}</p></div>
          <Status tone={user.active ? "positive" : "danger"}>{user.active ? "Active" : "Disabled"}</Status>
        </li>)}</ul> : <EmptyState icon={Users} title="No users to display" />}
      </Panel>
      <Panel title="Sessions" count={sessions.length}>
        {sessions.length ? <ul className={styles.recordList}>{sessions.map((item, index) => <li key={`${item.user_id}-${item.created_at}-${index}`} className={styles.sessionRow}>
          <div className={styles.recordText}><strong>{item.email}</strong><p>{item.browser || "Unknown browser"} · {item.os || "Unknown OS"}</p><p>IP {item.ip_address || "Unavailable"} · {formatDate(item.created_at)}</p></div>
          <Status tone={item.revoked_at ? "neutral" : "positive"}>{item.revoked_at ? "Revoked" : "Active"}</Status>
        </li>)}</ul> : <EmptyState icon={Monitor} title="No sessions to display" />}
      </Panel>
    </div>
    <Panel title="Audit trail" count={events.length}>
      {events.length ? <div className={styles.auditList}>{events.map((event) => <article key={event.id} className={styles.auditRow}>
        <div className={styles.auditHeading}><div className={styles.auditTitle}><h3>{event.event_type.replaceAll("_", " ")}</h3><Status tone={event.outcome === "success" ? "positive" : event.outcome === "throttled" ? "neutral" : "danger"}>{event.outcome}</Status></div><time dateTime={event.created_at}>{formatDate(event.created_at)}</time></div>
        <div className={styles.auditMeta}><span>{event.browser || "Unknown browser"} / {event.os || "Unknown OS"}</span><span>IP {event.ip_address || "Unavailable"}</span><span>Hash {event.ip_hash ? event.ip_hash.slice(0, 12) : "—"}</span></div>
        {event.metadata && Object.keys(event.metadata).length ? <details className={styles.metadata}><summary>Request details</summary><pre>{JSON.stringify(event.metadata, null, 2)}</pre></details> : null}
      </article>)}</div> : <EmptyState icon={Activity} title="No activity yet">Sign-ins and publishing activity will appear here.</EmptyState>}
    </Panel>
    <p className={styles.footnote}>Passwords and message bodies are never included in activity logs.</p>
  </div>;
}

export function InboxWorkspace({ messages, selected, onSelect, onUpdate }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const backButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const messageButtonRefs = useRef(new Map());
  const previousDetailOpen = useRef(false);
  const unreadCount = messages.filter((message) => message.status === "unread").length;
  const filteredMessages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return messages.filter((message) => (filter === "all" || message.status === filter) && (!needle || [message.subject, message.name, message.email, message.message].some((value) => value?.toLowerCase().includes(needle))));
  }, [messages, query, filter]);

  useEffect(() => {
    if (previousDetailOpen.current === detailOpen) return;
    previousDetailOpen.current = detailOpen;
    if (!window.matchMedia("(max-width: 799px)").matches) return;
    const target = detailOpen ? backButtonRef.current : messageButtonRefs.current.get(selected?.id) || searchInputRef.current;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: detailOpen ? "start" : "nearest", behavior: "instant" });
  }, [detailOpen, selected?.id]);

  async function update(action) {
    setPendingAction(action);
    try { await onUpdate(selected.id, action); }
    finally { setPendingAction(null); }
  }

  return <div className={styles.workspace}>
    <header className={styles.pageHeader}><div className={styles.pageTitle}><h1>Inbox</h1>{unreadCount ? <Status tone="positive">{unreadCount} unread</Status> : null}</div><p>Conversations from your portfolio.</p></header>
    <div className={`${styles.inbox} ${detailOpen ? styles.detailOpen : ""}`}>
      <section className={styles.messageList} aria-label="Messages">
        <div className={styles.listTools}>
          <label className={styles.search}><Search size={16} aria-hidden="true" /><input ref={searchInputRef} aria-label="Search messages" placeholder="Search messages…" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className={styles.listFilter}><span>{filteredMessages.length} {filteredMessages.length === 1 ? "message" : "messages"}</span><select aria-label="Filter messages" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All messages</option><option value="unread">Unread</option><option value="read">Read</option><option value="archived">Archived</option></select></div>
        </div>
        <div className={styles.messageButtons}>{filteredMessages.length ? filteredMessages.map((message) => <button key={message.id} ref={(node) => { if (node) messageButtonRefs.current.set(message.id, node); else messageButtonRefs.current.delete(message.id); }} type="button" aria-current={selected?.id === message.id ? "true" : undefined} className={`${styles.messageButton} ${selected?.id === message.id ? styles.selectedMessage : ""}`} onClick={() => { onSelect(message.id); setDetailOpen(true); }}>
          <div className={styles.messageSubject}><span className={`${styles.unreadDot} ${message.status === "unread" ? styles.unread : ""}`} aria-label={message.status === "unread" ? "Unread" : undefined} /><strong>{message.subject || "Portfolio enquiry"}</strong></div>
          <span className={styles.messageSender}>{message.name || message.email}</span><span className={styles.messageExcerpt}>{message.message}</span>
          <div className={styles.messageFooter}><time dateTime={message.created_at}>{formatDate(message.created_at)}</time>{message.status === "archived" ? <Archive size={13} aria-label="Archived" /> : null}</div>
        </button>) : <EmptyState icon={Inbox} title={messages.length ? "No matching messages" : "Your inbox is clear"}>{messages.length ? "Try another search or filter." : "New messages from your portfolio will appear here."}</EmptyState>}</div>
      </section>
      <section className={styles.messageDetail} aria-label="Message details">
        <button ref={backButtonRef} type="button" className={`${styles.button} ${styles.backButton}`} onClick={() => setDetailOpen(false)}><ArrowLeft size={16} aria-hidden="true" />All messages</button>
        {selected ? <article>
          <div className={styles.detailHeading}><Status tone={selected.status === "unread" ? "positive" : "neutral"}>{selected.status}</Status><time dateTime={selected.created_at}>{formatDate(selected.created_at)}</time></div>
          <h2 className={styles.detailSubject}>{selected.subject || "Portfolio enquiry"}</h2>
          <div className={styles.sender}><span className={styles.senderAvatar} aria-hidden="true">{(selected.name || selected.email || "?").slice(0, 1).toUpperCase()}</span><div><strong>{selected.name || "Portfolio visitor"}</strong><a href={`mailto:${selected.email}`}>{selected.email}</a></div></div>
          <p className={styles.messageBody}>{selected.message}</p>
          <div className={styles.messageActions}>
            <button type="button" disabled={Boolean(pendingAction)} onClick={() => update(selected.status === "read" ? "unread" : "read")} className={styles.button}>{["read", "unread"].includes(pendingAction) ? <Loader2 size={16} className={styles.spinner} aria-hidden="true" /> : <CheckCheck size={16} aria-hidden="true" />}{selected.status === "read" ? "Mark unread" : "Mark read"}</button>
            {selected.status !== "archived" ? <button type="button" disabled={Boolean(pendingAction)} onClick={() => update("archive")} className={styles.button}>{pendingAction === "archive" ? <Loader2 size={16} className={styles.spinner} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}Archive</button> : null}
          </div>
          <div className={styles.notification}><div><Mail size={15} aria-hidden="true" /><span>Email notification: <strong>{selected.notification_status || "pending"}</strong></span></div>{selected.notification_status === "failed" ? <button type="button" disabled={Boolean(pendingAction)} onClick={() => update("retry")} className={styles.button}>{pendingAction === "retry" ? <Loader2 size={15} className={styles.spinner} aria-hidden="true" /> : <RotateCcw size={15} aria-hidden="true" />}Retry notification</button> : null}</div>
          {selected.notification_status === "failed" && selected.notification_error ? <details className={styles.notificationError}><summary>Notification details</summary><p>{selected.notification_error}</p></details> : null}
        </article> : <EmptyState icon={Mail} title="Select a message">Choose a conversation to read it here.</EmptyState>}
      </section>
    </div>
  </div>;
}
