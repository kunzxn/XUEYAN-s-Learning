"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, Menu, Sparkles, X } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";

export default function AppShell({
  pageTitle,
  pageSubtitle,
  children,
}: {
  pageTitle: string;
  pageSubtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <button
        type="button"
        className="mobile-toggle"
        onClick={() => setMobileOpen((value) => !value)}
        aria-label="Mở menu điều hướng"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      <div
        className={`sidebar-backdrop ${mobileOpen ? "is-open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <Sidebar pathname={pathname} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="main-panel">
        <header className="topbar">
          <div>
            <div className="topbar-kicker">
              <Sparkles size={14} aria-hidden="true" />
              Nền tảng học tập
            </div>
            <h1>{pageTitle}</h1>
          </div>

          <div className="topbar-meta">
            <div className="date-pill">
              <CalendarDays size={15} aria-hidden="true" />
              <span>
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="user-pill">
              <div className="avatar" aria-label="Ảnh đại diện học viên">
                H
              </div>
              <div>
                <p>Hùng</p>
                <small>HSK 3</small>
              </div>
            </div>
          </div>
        </header>

        {pageSubtitle ? <p className="page-subtitle">{pageSubtitle}</p> : null}

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
