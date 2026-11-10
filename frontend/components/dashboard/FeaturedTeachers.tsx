import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";
import { ZaloButton } from "@/components/screens/TeacherProfile";

export default function FeaturedTeachers() {
  return (
    <section className={styles.sectionContainer} id="giao-vien">
      <div className={styles.teacherTeaser}>
        <div className={styles.teaserPhoto}>
          <Image src="/teacher/tuyet-nhi-aodai.jpg" alt="Giáo viên Trần Thị Tuyết Nhi" width={1330} height={2000} sizes="(max-width: 760px) 60vw, 260px" />
        </div>
        <div className={styles.teaserBody}>
          <h2>Trần Thị Tuyết Nhi</h2>
          <ul className={styles.teaserChips} aria-label="Thành tích nổi bật">
            <li>HSK 6</li>
            <li>Cử nhân Ngôn ngữ Trung</li>
            <li>Giải nhì Diễn cảm tiếng Trung 2026</li>
          </ul>
          <div className={styles.teaserActions}>
            <Link className={styles.teaserPrimary} href="/teachers">
              Xem hồ sơ giáo viên <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <ZaloButton className={styles.teaserZalo}>Thông tin liên hệ</ZaloButton>
          </div>
        </div>
      </div>
    </section>
  );
}
