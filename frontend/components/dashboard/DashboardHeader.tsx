"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";

import {AccountAvatar} from "@/components/ui/AccountHeader";
import {useAccount} from "@/lib/session";
import {roleHome} from "@/lib/workspace-roles";

const navigation = [
  { label: "Đăng nhập", href: "/login" },
  { label: "Lộ trình HSK", href: "/vocabulary" },
  { label: "Từ điển", href: "/dictionary" },
  { label: "Giáo viên", href: "/teachers" },
  { label: "Tài nguyên", href: "/resources" },
  { label: "Việc học của tôi", href: "/my-learning" },
];

export default function DashboardHeader({ onStart }: { onStart: () => void }) {
  const pathname = usePathname();
  const {account}=useAccount();
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
        <Link className={styles.brand} href="/" aria-label="XUEYAN, trang chủ">
          <Image src="/xueyan-logo.jpg" alt="" width={52} height={52} priority className={styles.brandLogo} />
          <span className={styles.brandCopy}>
            <strong>XUEYAN</strong>
            <small>Học viện tiếng Trung</small>
          </span>
        </Link>

        <nav id="dashboard-navigation" className={`${styles.mainNav} ${menuOpen ? styles.mainNavOpen : ""}`} aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <Link key={item.label} className={item.href === "/login" ? styles.mobileLogin : undefined} href={item.href==="/login"&&account?"/profile":item.href==="/my-learning"&&account&&account.role!=="learner"?roleHome(account.role):item.href} aria-current={pathname === item.href || pathname.startsWith(item.href + "/") ? "page" : undefined} onClick={() => setMenuOpen(false)}>
              {item.href==="/login"&&account?"Trang cá nhân":item.href==="/my-learning"&&account&&account.role!=="learner"?"Không gian của tôi":item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <Link className={styles.loginLink} href={account?"/profile":"/login"}>{account?account.name:"Đăng nhập"}</Link>
          {account&&account.role!=="learner"?<Link href={roleHome(account.role)} className={styles.headerCta}>Không gian của tôi</Link>:<button type="button" className={styles.headerCta} onClick={onStart}>Thiết lập lộ trình</button>}
          <AccountAvatar className={styles.profileLink}/>
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
