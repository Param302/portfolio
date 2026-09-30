"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({ title, description, confirmLabel, requiredText, destructive = false, returnFocusRef, fallbackFocusRef, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const submitting = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const [typedName, setTypedName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const matches = !requiredText || typedName.trim() === requiredText;

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = returnFocusRef?.current || document.activeElement;
    const fallbackFocus = fallbackFocusRef?.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && !previousFocus.closest?.("[inert]")) previousFocus.focus();
      if (!previousFocus?.isConnected || previousFocus.closest?.("[inert]") || document.activeElement === document.body) fallbackFocus?.focus();
    };
  }, [returnFocusRef, fallbackFocusRef]);

  async function confirm(event) {
    event.preventDefault();
    if (!matches || submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await onConfirm();
      onCancel();
    } catch (caught) {
      setError(caught.message || "Something went wrong. Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const controls = [...dialogRef.current.querySelectorAll("button:not(:disabled), input:not(:disabled)")];
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  const Icon = destructive ? Trash2 : LogOut;
  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onKeyDown={trapFocus} onCancel={(event) => { event.preventDefault(); if (!submitting.current) onCancel(); }}>
    <form onSubmit={confirm} className={styles.form} aria-busy={pending}>
      <span className={`${styles.icon} ${destructive ? styles.destructive : ""}`} aria-hidden="true"><Icon /></span>
      <h2 id={titleId}>{title}</h2>
      <p id={descriptionId}>{description}</p>
      {requiredText ? <label className={styles.field}>Type <strong>{requiredText}</strong> to confirm
        <input aria-label="Section name" autoComplete="off" autoCapitalize="none" spellCheck={false} value={typedName} disabled={pending} onChange={(event) => setTypedName(event.target.value)} />
      </label> : null}
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button type="button" disabled={pending} onClick={onCancel} className={styles.cancel}>Cancel</button>
        <button type="submit" disabled={!matches || pending} className={`${styles.confirm} ${destructive ? styles.dangerButton : ""}`}>{pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}{pending ? "Please wait…" : confirmLabel}</button>
      </div>
    </form>
  </dialog>;
}
