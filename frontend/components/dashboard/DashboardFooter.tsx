import Image from "next/image";
import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";

const footerGroups: {title:string;links:{label:string;href?:string}[]}[] = [
  {title:"Lộ trình HSK",links:[{label:"HSK 1 - Nhập môn",href:"/vocabulary/hsk-1"},{label:"HSK 2 - Giao tiếp cơ bản",href:"/vocabulary/hsk-2"},{label:"HSK 3 - Củng cố từ vựng",href:"/vocabulary/hsk-3"},{label:"HSK 4 - Diễn đạt chuyên sâu",href:"/vocabulary/hsk-4"},{label:"HSK 5 & 6 - Nâng cao",href:"/vocabulary"}]},
  {title:"Cộng đồng & Giáo viên",links:[{label:"Đội ngũ giảng viên",href:"/teachers"},{label:"Lớp học trực tuyến",href:"/classes"},{label:"Chia sẻ kinh nghiệm",href:"/resources"},{label:"Đồng hành học tập",href:"/teachers/lan-anh/consultation"}]},
  {title:"Hỗ trợ & Pháp lý",links:[{label:"Trung tâm trợ giúp",href:"/help"},{label:"Điều khoản dịch vụ (chưa có nội dung)"},{label:"Chính sách bảo mật (chưa có nội dung)"},{label:"Liên hệ cố vấn",href:"/contact"}]},
];

export default function DashboardFooter() {
  return <footer className={styles.siteFooter}>
    <div className={styles.footerGrid}>
      <div className={styles.footerAbout}>
        <Link className={styles.footerBrand} href="/"><Image src="/xueyan-logo.jpg" alt="" width={42} height={42}/><strong>XUEYAN</strong></Link>
        <p>XUEYAN - Nền tảng học tiếng Trung dành cho người Việt, kết hợp tri thức Hán - Việt với phương pháp lặp lại ngắt quãng.</p>
        <div className={styles.footerTags}><span>HSK 1 - HSK 6+</span><span>Âm Hán Việt</span></div>
      </div>
      {footerGroups.map(group => <div className={styles.footerGroup} key={group.title}><h2>{group.title}</h2>{group.links.map(link => link.href ? <Link key={link.label} href={link.href}>{link.label}</Link> : <span key={link.label}>{link.label}</span>)}</div>)}
    </div>
    <div className={styles.footerBottom}><span>© 2026 XUEYAN Hán Học. Bảo lưu mọi quyền.</span><span>Nền tảng Hán ngữ dành cho người Việt</span></div>
  </footer>;
}
