import Image from "next/image";
import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";

const footerGroups = [
  {
    title: "Lộ trình HSK",
    links: ["HSK 1 - Nhập môn", "HSK 2 - Giao tiếp cơ bản", "HSK 3 - Củng cố từ vựng", "HSK 4 - Diễn đạt chuyên sâu", "HSK 5 & 6 - Nâng cao"],
  },
  {
    title: "Cộng đồng & Giáo viên",
    links: ["Đội ngũ giảng viên", "Câu lạc bộ đàm thoại", "Chia sẻ kinh nghiệm", "Đồng hành học tập"],
  },
  {
    title: "Hỗ trợ & Pháp lý",
    links: ["Trung tâm trợ giúp", "Điều khoản dịch vụ", "Chính sách bảo mật", "Liên hệ cố vấn"],
  },
];

export default function DashboardFooter() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerGrid}>
        <div className={styles.footerAbout}>
          <Link className={styles.footerBrand} href="/dashboard">
            <Image src="/xueyan-logo.jpg" alt="" width={42} height={42} />
            <strong>XUEYAN</strong>
          </Link>
          <p>XUEYAN - Nền tảng học tiếng Trung dành cho người Việt, kết hợp tri thức Hán - Việt với phương pháp lặp lại ngắt quãng.</p>
          <div className={styles.footerTags}><span>HSK 1 - HSK 6+</span><span>Âm Hán Việt</span></div>
        </div>
        {footerGroups.map((group) => (
          <div className={styles.footerGroup} key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((label) => <Link href={group.title === "Lộ trình HSK" ? "/vocabulary" : group.title === "Cộng đồng & Giáo viên" ? "/teachers" : "/profile"} key={label}>{label}</Link>)}
          </div>
        ))}
      </div>
      <div className={styles.footerBottom}>
        <span>© 2025 XUEYAN Hán Học. Bảo lưu mọi quyền.</span>
        <span>Nền tảng Hán ngữ dành cho người Việt</span>
      </div>
    </footer>
  );
}
