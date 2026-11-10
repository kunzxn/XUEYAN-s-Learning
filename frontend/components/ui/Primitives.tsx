"use client";

import Link from "next/link";
import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Volume2, X } from "lucide-react";
import s from "./ui.module.css";
export { s };

export function Button({ secondary, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return <button type="button" className={`${s.button} ${secondary ? s.secondary : ""} ${className}`} {...props} />;
}
export function Input({ label, hint, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const generatedId = useId(); const id = props.id ?? generatedId;
  const maxLength=props.maxLength??textLimit(props.type);
  return <div className={s.label} data-form-field><label htmlFor={id}>{label}</label><input {...props} maxLength={maxLength} id={id} className={`${s.field} ${props.className ?? ""}`} aria-invalid={error ? true : undefined} aria-describedby={hint || error ? `${id}-help` : undefined}/>{(hint || error) && <small id={`${id}-help`} role={error ? "alert" : undefined}>{error ?? hint}</small>}</div>;
}
function textLimit(type?:string) { return type==="email"?254:type==="password"?128:type==="url"?2048:type==="tel"?30:!type||type==="text"||type==="search"?200:undefined; }
export function FormField({ label, children }: { label: ReactNode; children: ReactNode }) {
  const id = useId();
  return <div className={s.label} data-form-field><label htmlFor={id}>{label}</label>{Children.map(children, child => isValidElement<{ id?: string; maxLength?:number; type?:string }>(child) && ["input", "textarea", "select"].includes(child.type as string) ? cloneElement(child, { id, ...(child.type === "textarea" ? {maxLength:child.props.maxLength??4000} : child.type === "input" ? {maxLength:child.props.maxLength??textLimit(child.props.type)} : {}) }) : child)}</div>;
}
export function ActionLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={`${s.button} ${secondary ? s.secondary : ""}`}>{children}</Link>;
}
export function UnavailableAction({ children, reason, secondary = true, className = "" }: { children: ReactNode; reason: string; secondary?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  return <><Button secondary={secondary} className={className} onClick={() => setOpen(true)}>{children} · chưa khả dụng</Button><Dialog open={open} onClose={() => setOpen(false)} title="Chức năng chưa khả dụng"><p>{reason}</p><Button secondary onClick={() => setOpen(false)}>Quay lại</Button></Dialog></>;
}
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`${s.card} ${className}`}>{children}</section>;
}
export function Badge({ children, tone }: { children: ReactNode; tone?: "success" | "warning" | "danger" }) {
  return <span className={`${s.badge} ${tone ? s[tone] : ""}`}>{children}</span>;
}
export function DemoNotice() { return <p className={s.note}>Bản xem trước · Chưa đồng bộ tài khoản.</p>; }
export function PageTitle({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return <div className={s.heading}><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</div>;
}
export function Progress({ value, label }: { value: number; label: string }) { return <progress className={s.progress} max={100} value={value} aria-label={label}>{value}%</progress>; }
export function EmptyState({ title, description, href, action = "Quay lại" }: { title: string; description: string; href?: string; action?: string }) {
  return <Card className={s.empty}><span className={s.word} lang="zh-Hans">学</span><h2>{title}</h2><p className={s.muted}>{description}</p>{href && <div className={s.actions}><ActionLink href={href}>{action}</ActionLink></div>}</Card>;
}
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null); const id = useId();
  useEffect(() => { const dialog = ref.current; if (!dialog) return; const prior = document.activeElement as HTMLElement | null;
    if (open && !dialog.open) dialog.showModal(); else if (!open && dialog.open) dialog.close();
    return () => { if (dialog.open) dialog.close(); if (open) prior?.focus(); };
  }, [open]);
  return <dialog ref={ref} className={s.dialog} aria-labelledby={id} onCancel={onClose} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]')).filter(element => element.tabIndex >= 0 && !element.hasAttribute("disabled") && element.getClientRects().length > 0);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><h2 id={id}>{title}</h2><Button secondary className={s.close} onClick={onClose} aria-label="Đóng hộp thoại"><X size={18} /></Button>{children}</dialog>;
}
export function AudioButton({ text }: { text: string }) {
  const [status, setStatus] = useState("");
  function speak() { if (!("speechSynthesis" in window)) { setStatus("Trình duyệt chưa hỗ trợ phát âm."); return; }
    window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "zh-CN";
    u.onstart = () => setStatus("Đang phát âm…"); u.onend = () => setStatus(""); u.onerror = () => setStatus("Không thể phát âm. Vui lòng thử lại."); window.speechSynthesis.speak(u);
  }
  return <div><Button secondary onClick={speak} aria-label={`Nghe phát âm ${text}`} title={`Nghe phát âm ${text}`}><Volume2 size={18} aria-hidden="true" /></Button><span className={s.muted} role="status">{status}</span></div>;
}
