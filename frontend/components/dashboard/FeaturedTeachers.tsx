import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";
import { TeacherImage } from "@/components/dashboard/LearningSections";

const teachers = [
  {
    name: "Cô Lan Anh",
    credential: "Thạc sĩ TCSOL",
    school: "Đại học Sư phạm Bắc Kinh",
    level: "HSK 6",
    description: "Đồng hành cùng người học khám phá Hán ngữ qua ngữ âm tiếng Việt và xây dựng phản xạ giao tiếp tự nhiên.",
    image: undefined,
    imageAlt: "Ảnh giảng viên Cô Lan Anh không khả dụng trong nguồn Stitch",
  },
  {
    name: "Thầy Minh Quân",
    credential: "Cử nhân Sư phạm",
    school: "Khoa Trung văn, Đại học Sư phạm Hà Nội",
    level: "Chuyên sâu Bộ thủ",
    description: "Hướng dẫn cấu trúc chữ Hán và quy luật chuyển dịch ngữ âm Hán - Việt để hỗ trợ ghi nhớ từ vựng.",
    image: "/teacher-minh-quan.jpg",
    imageAlt: "Thầy Minh Quân trong không gian học tập",
  },
  {
    name: "Cô Chen Wei",
    credential: "Giảng viên bản ngữ",
    school: "Đại học Ngôn ngữ Bắc Kinh",
    level: "Phát âm chuẩn",
    description: "Hỗ trợ luyện phát âm, ngữ điệu thanh điệu và thực hành hội thoại tiếng Trung theo ngữ cảnh.",
    image: "/teacher-chen-wei.jpg",
    imageAlt: "Cô Chen Wei, giảng viên tiếng Trung",
  },
];

export default function FeaturedTeachers() {
  return (
    <section className={styles.sectionContainer} id="giao-vien">
      <div className={styles.sectionHeadingRow}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Chuyên môn học thuật</span>
          <h2>Đội ngũ giáo viên đồng hành</h2>
          <p>Tập trung vào sư phạm tiếng Trung, phát âm và sự đồng hành trong từng bài học.</p>
        </div>
        <Link className={styles.textLink} href="/teachers">Tất cả giáo viên <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <div className={styles.teacherGrid}>
        {teachers.map((teacher) => (
          <article className={styles.teacherCard} key={teacher.name}>
            <div className={styles.teacherImageFrame}>
              <TeacherImage src={teacher.image} alt={teacher.imageAlt} />
              <span className={styles.teacherCredential}>{teacher.credential}</span>
            </div>
            <div className={styles.teacherBody}>
              <div className={styles.teacherNameRow}>
                <h3>{teacher.name}</h3>
                <span>{teacher.level}</span>
              </div>
              <p className={styles.teacherSchool}>{teacher.school}</p>
              <p className={styles.teacherDescription}>{teacher.description}</p>
              <Link href="/teachers" className={styles.teacherLink}>Xem hồ sơ giáo viên</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
