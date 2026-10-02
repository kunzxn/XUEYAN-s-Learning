"use client";

import Link from "next/link";
import { BookOpenText, GraduationCap, LayoutGrid, UserRound, Users } from "lucide-react";
import { navItems } from "@/lib/mock-data";

const icons = {
  "/dashboard": LayoutGrid,
  "/vocabulary": BookOpenText,
  "/review": GraduationCap,
  "/teachers": Users,
  "/profile": UserRound,
};

export default function Sidebar({
  pathname,
  mobileOpen,
  onClose,
}: {
  pathname: string;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Menu điều hướng chính">
      <div className="brand-wrap">
        <div className="brand-mark" aria-hidden="true">X</div>
        <div>
          <p className="brand-name">XUEYAN</p>
          <p className="brand-subtitle">Learning Studio</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar">
        {navItems.map((item) => {
          const Icon = icons[item.href as keyof typeof icons] ?? LayoutGrid;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="nav-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>HSK 3</p>
        <strong>12 từ/năm</strong>
      </div>
    </aside>
  );
}
