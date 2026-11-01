"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, BookOpen, Bookmark, ChartNoAxesCombined, Flame, GraduationCap, LayoutDashboard, Menu, Search, Settings, User, Users, X } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { DemoNotice, UnavailableAction, s } from "./Primitives";

import {AccountAvatar} from "./AccountHeader";
import {useAccount} from "@/lib/session";

const learnerNav = [["/dashboard", "Hôm nay", LayoutDashboard], ["/vocabulary", "Lộ trình HSK", BookOpen], ["/review", "Ôn tập SRS", GraduationCap], ["/collection", "Sổ từ", Bookmark], ["/classes", "Lớp học", Users], ["/progress", "Tiến độ", ChartNoAxesCombined], ["/profile", "Hồ sơ học viên", User]] as const;
function navActive(pathname: string, href: string) {
  if (href === "/vocabulary" && pathname.startsWith("/lessons/")) return true;
  if (href === "/classes" && pathname.startsWith("/assignments/")) return true;
  return pathname === href || (href !== "/teacher" && href !== "/dashboard" && pathname.startsWith(href + "/"));
}
const teacherNav = [["/teacher", "Tổng quan", LayoutDashboard], ["/teacher/classes/hsk2-k24", "Lớp học", Users], ["/teacher/assignments/4", "Bài cần chấm", BookOpen], ["/teachers/lan-anh/consultation", "Yêu cầu tư vấn", Bell], ["/teacher/profile", "Hồ sơ sư phạm", User]] as const;
export function WorkspaceLayout({ children, teacher = false }: { children: ReactNode; teacher?: boolean }) {
  const {account}=useAccount();const pathname = usePathname(); const [open, setOpen] = useState(false); const trigger = useRef<HTMLButtonElement>(null); const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const controls = () => Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href],button') ?? []).filter(e => getComputedStyle(e).display !== "none");
    const background = Array.from(document.querySelectorAll<HTMLElement>("[data-drawer-background]"));
    background.forEach(element => { element.inert = true; });
    controls()[0]?.focus();
    const handle = (e: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "Escape") { setOpen(false); }
      if (e.key === "Tab") {
        const items = controls(); const first = items[0]; const last = items[items.length - 1];
        if (!sidebar.current?.contains(document.activeElement)) { e.preventDefault(); (e.shiftKey ? last : first)?.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    const resize = () => { if (window.innerWidth > 760) setOpen(false); };
    const restoreFocus = trigger.current;
    const overflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handle); window.addEventListener("resize", resize);
    return () => { background.forEach(element => { element.inert = false; }); document.removeEventListener("keydown", handle); window.removeEventListener("resize", resize); document.body.style.overflow = overflow; restoreFocus?.focus(); };
  }, [open]);
  return <div className={s.layout}><a className={s.skip} href="#workspace-main">Đến nội dung chính</a>{open && <div className={s.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />}
    <aside ref={sidebar} id="workspace-navigation" className={`${s.sidebar} ${open ? s.sidebarOpen : ""}`} role={open ? "dialog" : undefined} aria-modal={open ? true : undefined} aria-label="Menu điều hướng"><button type="button" className={`${s.button} ${s.secondary} ${s.menu}`} onClick={() => setOpen(false)} aria-label="Đóng menu điều hướng"><X size={18}/> Đóng menu</button><Link href="/" className={s.brand} onClick={()=>setOpen(false)}><Image src="/xueyan-logo.jpg" alt="" width={38} height={38} /><span>XUEYAN<small>{teacher ? "Không gian giảng viên" : "Học viện Hán ngữ"}</small></span></Link>
      <div className={s.badge}>{teacher ? "Giảng viên · dữ liệu mẫu" : account?.targetLevelCode?`Mục tiêu HSK ${account.targetLevelCode}`:"Không gian học viên"}</div><nav className={s.nav} aria-label={teacher ? "Điều hướng giảng viên" : "Điều hướng học viên"}>{(teacher ? teacherNav : learnerNav).map(([href, label, Icon]) => teacher && href.includes("consultation") ? <UnavailableAction key={href} reason="Chưa có màn hình quản lý yêu cầu tư vấn của giảng viên; biểu mẫu học viên không phải nơi duyệt lịch."><Icon size={19}/>{label}</UnavailableAction> : <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={navActive(pathname, href) ? "page" : undefined}><Icon size={19} aria-hidden="true" />{label}</Link>)}</nav>
      <div className={s.sidebarBottom}><Link href="/help" onClick={()=>setOpen(false)}>Trợ giúp học tập</Link><Link href={teacher?"/profile/edit":"/settings"} onClick={()=>setOpen(false)} aria-current={pathname === "/settings" ? "page" : undefined}><Settings size={16} /> {teacher?"Thông tin tài khoản":"Cài đặt cá nhân"}</Link></div>
    </aside><div className={s.workspace} data-drawer-background><header className={s.utility}><button type="button" ref={trigger} className={`${s.button} ${s.secondary} ${s.menu}`} aria-controls="workspace-navigation" aria-expanded={open} aria-label={open ? "Đóng menu" : "Mở menu"} onClick={() => setOpen(!open)}>{open ? <X size={18} /> : <Menu size={18} />}</button><Link href="/dictionary" className={s.search}><Search size={18} aria-hidden="true" />Tra chữ Hán, Pinyin, Hán–Việt…</Link><div className={s.utilityActions}>{!teacher&&<><span className={`${s.badge} ${s.warning}`}><Flame size={16} />7 ngày</span><Link href="/notifications" className={`${s.button} ${s.secondary}`} aria-label="Thông báo"><Bell size={18} /></Link></>}<AccountAvatar/></div></header><main id="workspace-main" tabIndex={-1} className={`${s.content} ${s.stack}`}>{children}<DemoNotice /></main></div><nav data-drawer-background className={s.mobileNav} aria-label="Điều hướng nhanh trên di động">{(teacher ? teacherNav : [learnerNav[0],learnerNav[1],learnerNav[2],learnerNav[3],learnerNav[6]]).map(([href,label,Icon]) => teacher && href.includes("consultation") ? <UnavailableAction key={href} className={s.mobileUnavailable} reason="Chưa có màn hình quản lý yêu cầu tư vấn dành cho giảng viên."><Icon size={21}/><small>{label}</small></UnavailableAction> : <Link key={href} href={href} aria-current={navActive(pathname, href) ? "page" : undefined}><Icon size={21} aria-hidden="true"/><small>{label}</small></Link>)}</nav></div>;
}
export function PublicLayout({ children }: { children: ReactNode }) {
  const router=useRouter();
  return <div className={s.layout}><DashboardHeader onStart={() => { router.push("/onboarding"); }} /><main id="dashboard-main" tabIndex={-1} className={`${s.public} ${s.stack}`}>{children}</main><DashboardFooter /></div>;
}
export function FocusLayout({ title, children, progress = 0, exitHref = "/review", onExit }: { title: string; children: ReactNode; progress?: number; exitHref?: string; onExit?: () => void }) {
  return <div className={s.layout}><header className={s.focusHeader}>{onExit ? <button type="button" className={`${s.button} ${s.ghost}`} onClick={onExit}><X size={18}/>Thoát phiên học</button> : <Link href={exitHref} className={`${s.button} ${s.ghost}`}><X size={18} />Thoát phiên học</Link>}<div><h1 style={{fontSize:24}}>{title}</h1><progress className={s.progress} value={progress} max={100} aria-label="Tiến độ phiên học" /></div><Link href="/settings" aria-label="Cài đặt phiên học"><Settings size={20} /></Link></header><main className={s.focus}>{children}<DemoNotice /></main></div>;
}
