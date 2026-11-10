"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import styles from "./theme-toggle.module.css";

const EVENT = "xueyan-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}
const snapshot = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/** Nút chuyển sáng/tối. Giá trị lưu ở localStorage; script trong <head> đặt theme trước khi vẽ để không nháy. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light");
  const dark = theme === "dark";
  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("xueyan-theme", next); } catch { /* vẫn đổi được trong phiên này */ }
    window.dispatchEvent(new Event(EVENT));
  }
  return (
    <button type="button" className={`${styles.toggle} ${className}`} onClick={toggle} aria-pressed={dark} aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"} title={dark ? "Giao diện sáng" : "Giao diện tối"}>
      <span className={styles.icon} data-dark={dark} aria-hidden="true">
        <Sun size={18} className={styles.sun} />
        <Moon size={18} className={styles.moon} />
      </span>
    </button>
  );
}
