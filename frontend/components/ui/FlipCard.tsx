"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import styles from "./flip-card.module.css";

type FlipCardProps = {
  /** Mặt trước (chữ Hán, pinyin…). */
  front: ReactNode;
  /** Mặt sau (nghĩa, Hán–Việt, ví dụ…). */
  back: ReactNode;
  flipped: boolean;
  onFlip: (next: boolean) => void;
  /** Đổi giá trị khi chuyển sang thẻ khác để thẻ mới "rơi" vào chỗ. */
  cardKey?: string | number;
  /** Chữ ấn đỏ in lên mặt sau khi lật. */
  seal?: string;
  label?: string;
};

/**
 * Thẻ lật 3D. Hai mặt xếp chồng trong cùng một ô lưới nên chiều cao theo mặt dài hơn,
 * không có chiều cao cố định. Mặt đang ẩn bị `inert` để bàn phím và trình đọc màn hình bỏ qua.
 * Khi người dùng bật giảm chuyển động, thẻ chuyển bằng cross-fade thay vì xoay.
 */
export function FlipCard({ front, back, flipped, onFlip, cardKey, seal = "记", label = "Thẻ từ vựng" }: FlipCardProps) {
  function click(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button,a,input,summary")) return;
    onFlip(!flipped);
  }
  function key(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onFlip(!flipped);
    }
  }
  return (
    <div className={styles.scene} key={cardKey}>
      <div
        className={styles.card}
        data-flipped={flipped}
        role="group"
        aria-roledescription="thẻ lật"
        aria-label={`${label} — đang xem ${flipped ? "mặt sau" : "mặt trước"}`}
        tabIndex={0}
        onClick={click}
        onKeyDown={key}
      >
        <div className={`${styles.face} ${styles.front}`} inert={flipped}>
          {front}
          <span className={styles.hint} aria-hidden="true">Chạm để lật thẻ</span>
        </div>
        <div className={`${styles.face} ${styles.back}`} inert={!flipped}>
          <span className={styles.seal} aria-hidden="true" lang="zh-Hans">{seal}</span>
          {back}
        </div>
      </div>
    </div>
  );
}
