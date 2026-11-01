import { AlarmClockCheck, ArrowRight, BadgeCheck, Brain } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";
import VocabularySpotlight from "@/components/dashboard/VocabularySpotlight";

export default function DashboardHero({
  onStartLearning,
  onOpenReview,
}: {
  onStartLearning: () => void;
  onOpenReview: () => void;
}) {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.methodBadge}>
            <span className={styles.liveDot} aria-hidden="true" />
            Học từ mới · Ôn đúng lúc
          </div>
          <h1>
            Học tiếng Trung mỗi ngày, <em>nhớ lâu từng từ.</em>
          </h1>
          <p className={styles.heroDescription}>
            Khám phá từ vựng HSK, luyện phát âm và ôn tập theo nhịp của bạn.
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryButton} onClick={onStartLearning}>
              Học thử Bài 01 <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a className={styles.secondaryButton} href="#lo-trinh">Khám phá lộ trình</a>
          </div>
          <div className={styles.proofList}>
            <span><BadgeCheck size={19} aria-hidden="true" />Chuẩn khung HSK 3.0</span>
            <span><Brain size={19} aria-hidden="true" />Ngữ nguyên Hán - Việt</span>
            <span><AlarmClockCheck size={19} aria-hidden="true" />15 phút mỗi ngày</span>
          </div>
        </div>
        <div><p className={styles.heroDescription}>Phiên học minh họa · Chưa phải tiến độ của bạn.</p><VocabularySpotlight onOpenReview={onOpenReview} /></div>
      </div>
    </section>
  );
}
