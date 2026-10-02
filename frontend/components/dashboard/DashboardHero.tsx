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
            Phương pháp lặp lại ngắt quãng (SRS) tối ưu cho người Việt
          </div>
          <h1>
            Học tiếng Trung mỗi ngày, <em>nhớ lâu từng từ.</em>
          </h1>
          <p className={styles.heroDescription}>
            Kết hợp hệ thống phân tích gốc Hán - Việt, thuật toán Spaced Repetition thông minh và sự đồng hành của giảng viên chuyên môn giúp bạn nắm vững HSK một cách bền bỉ và thư thái.
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryButton} onClick={onStartLearning}>
              Bắt đầu học <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a className={styles.secondaryButton} href="#lo-trinh">Khám phá lộ trình</a>
          </div>
          <div className={styles.proofList}>
            <span><BadgeCheck size={19} aria-hidden="true" />Chuẩn khung HSK 3.0</span>
            <span><Brain size={19} aria-hidden="true" />Ngữ nguyên Hán - Việt</span>
            <span><AlarmClockCheck size={19} aria-hidden="true" />15 phút mỗi ngày</span>
          </div>
        </div>
        <VocabularySpotlight onOpenReview={onOpenReview} />
      </div>
    </section>
  );
}
