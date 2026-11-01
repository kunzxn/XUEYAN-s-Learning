import Link from "next/link";
import { demoTeachers } from "@/lib/ui-demo-data";
import { ArrowRight } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";
import { TeacherImage } from "@/components/dashboard/LearningSections";

const teachers = demoTeachers.slice(0, 3);

export default function FeaturedTeachers() {
  return (
    <section className={styles.sectionContainer} id="giao-vien">
      <div className={styles.sectionHeadingRow}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Chuyên môn học thuật</span>
          <h2>Đội ngũ giáo viên đồng hành</h2>
          <p>Danh bạ minh họa; tên, ảnh và thông tin chuyên môn chưa được xác minh để công bố.</p>
        </div>
        <Link className={styles.textLink} href="/teachers">Tất cả giáo viên <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <div className={styles.teacherGrid}>
        {teachers.map((teacher) => (
          <article className={styles.teacherCard} key={teacher.name}>
            <div className={styles.teacherImageFrame}>
              <TeacherImage src={teacher.image} alt={`Ảnh minh họa ${teacher.name}`} />
              <span className={styles.teacherCredential}>{"Hồ sơ minh họa"}</span>
            </div>
            <div className={styles.teacherBody}>
              <div className={styles.teacherNameRow}>
                <h3>{teacher.name}</h3>
                <span>{teacher.level}</span>
              </div>
              <p className={styles.teacherSchool}>{teacher.headline}</p>
              <p className={styles.teacherDescription}>{teacher.detail}</p>
              <Link href={`/teachers/${teacher.id}`} className={styles.teacherLink}>Xem hồ sơ giáo viên</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
