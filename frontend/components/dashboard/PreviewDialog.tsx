"use client";

import { useEffect, useRef } from "react";
import { BookOpenText, Sparkles, X } from "lucide-react";

export default function PreviewDialog({
  open,
  mode = "lesson",
  title,
  subtitle,
  onClose,
}: {
  open: boolean;
  mode?: "lesson" | "review";
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className="dialog-panel"
        style={{ maxHeight: "calc(100dvh - 40px)", overflowY: "auto", outlineColor: "var(--primary)" }}
        role="dialog"
        aria-modal="true"
        aria-describedby="preview-dialog-description"
        aria-labelledby="preview-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label="Đóng cửa sổ xem trước"
        >
          <X size={17} aria-hidden="true" />
        </button>

        <div className="dialog-icon" aria-hidden="true">
          <Sparkles size={26} />
        </div>

        <p className="dialog-tag">Bản xem trước</p>
        <h3 id="preview-dialog-title">{title}</h3>
        <p id="preview-dialog-description" className="dialog-copy">{subtitle}</p>

        <div className="dialog-lesson">
          <div>
            <p className="label">Bài học</p>
            <strong>{mode === "review" ? "Từ vựng đến hạn ôn tập" : "Bài 08 · Cuộc sống hằng ngày"}</strong>
          </div>
          <BookOpenText size={18} aria-hidden="true" />
        </div>

        <div className="dialog-meta">
          <span>{mode === "review" ? "24 từ" : "18 từ"}</span>
          <span>{mode === "review" ? "8–10 phút" : "7 phút"}</span>
          <span>HSK 3</span>
        </div>

        <button type="button" className="primary-button" onClick={onClose}>
          Quay lại màn hình
        </button>
      </div>
    </div>
  );
}
