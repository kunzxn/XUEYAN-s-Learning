"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";

const navigation = [
  { label: "Lộ trình HSK", href: "#lo-trinh" },
  { label: "Từ điển", href: "/vocabulary" },
  { label: "Giáo viên", href: "/teachers" },
  { label: "Tài nguyên", href: "#tu-vung" },
];

export default function DashboardHeader({ onStart }: { onStart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className={styles.siteHeader}>
      <a href="#dashboard-main" className={styles.skipLink}>Đến nội dung chính</a>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/dashboard" aria-label="XUEYAN, trang tổng quan">
          <Image src="/xueyan-logo.jpg" alt="" width={52} height={52} priority className={styles.brandLogo} />
          <span className={styles.brandCopy}>
            <strong>XUEYAN</strong>
            <small>Học viện tiếng Trung</small>
          </span>
        </Link>

        <nav id="dashboard-navigation" className={`${styles.mainNav} ${menuOpen ? styles.mainNavOpen : ""}`} aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <Link className={styles.loginLink} href="/profile">Đăng nhập</Link>
          <button type="button" className={styles.headerCta} onClick={onStart}>Bắt đầu học</button>
          <Link href="/profile" className={styles.profileLink} aria-label="Mở hồ sơ học viên">
            <UserRound size={19} aria-hidden="true" />
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuToggle}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            aria-controls="dashboard-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
