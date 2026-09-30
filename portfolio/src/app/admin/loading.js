import { Loader2 } from "lucide-react";
import styles from "./AdminWorkspace.module.css";

export default function AdminLoading() {
  return (
    <main className={`${styles.root} grid place-items-center`} aria-busy="true">
      <div className={styles.loading} role="status">
        <Loader2 size={20} className="shrink-0 motion-safe:animate-spin" aria-hidden="true" />
        <span>Opening your workspace…</span>
      </div>
    </main>
  );
}
