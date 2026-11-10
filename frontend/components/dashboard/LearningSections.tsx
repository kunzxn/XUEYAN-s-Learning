import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, Pencil, RotateCw } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";

const levels = [
  { label: "HSK 1", href: "/vocabulary/hsk-1" },
  { label: "HSK 2", href: "/vocabulary/hsk-2" },
  { label: "HSK 3", href: "/vocabulary/hsk-3" },
  { label: "HSK 4", href: "/vocabulary/hsk-4" },
  { label: "HSK 5", href: "/vocabulary/hsk-5" },
  { label: "HSK 6", href: "/vocabulary/hsk-6" },
  { label: "HSK 7-9", href: "/vocabulary/hsk-7-9" },
] as const;

const steps = [
  { label: "Khám phá gốc Hán - Việt", href: "/dictionary", Icon: BookOpenText },
  { label: "Học 15 phút mỗi ngày", href: "/lessons/1", Icon: Pencil },
  { label: "Ôn tập đúng chu kỳ", href: "/review", Icon: RotateCw },
] as const;

export function HskPathways() {
  return (
    <section className={`${styles.pathwaySection} ${styles.fullBand}`} id="lo-trinh">
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeadingRow}>
          <div className={styles.sectionHeading}>
            <h2>Chọn cấp HSK để bắt đầu</h2>
          </div>
          <Link className={styles.textLink} href="/vocabulary">Xem tất cả <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <ul className={styles.levelGrid}>
          {levels.map((level) => (
            <li key={level.label}>
              <Link className={styles.levelBtn} href={level.href}>
                <span>{level.label}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LearningMethod() {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeading}>
        <h2>Học theo ba bước</h2>
      </div>
      <ol className={styles.stepRow}>
        {steps.map(({ label, href, Icon }) => (
          <li key={label}>
            <Link className={styles.stepBtn} href={href}>
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ClosingCallToAction({ onStart }: { onStart: () => void }) {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.closingCta}>
        <span className={styles.ctaKanji} aria-hidden="true">言</span>
        <div className={styles.ctaCopy}>
          <h2>Mỗi ngày một ít, chữ Hán sẽ quen tay.</h2>
          <p>Tiếp tục bài học hiện tại và giữ nhịp học vừa sức với bạn.</p>
        </div>
        <button type="button" className={styles.ctaLightButton} onClick={onStart}>Học thử Bài 01</button>
      </div>
    </section>
  );
}

export function TeacherImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return <div className={styles.teacherImageFallback} role="img" aria-label={alt}><span aria-hidden="true">师</span></div>;
  }

  return <Image className={styles.teacherImage} src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized />;
}
