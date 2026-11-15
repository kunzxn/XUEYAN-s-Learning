import Image from "next/image";
import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";

const footerGroups: {title:string;links:{label:string;href:string}[]}[] = [
  {title:"Lộ trình HSK",links:[{label:"HSK 1 - Nhập môn",href:"/vocabulary/hsk-1"},{label:"HSK 2 - Giao tiếp cơ bản",href:"/vocabulary/hsk-2"},{label:"HSK 3 - Củng cố từ vựng",href:"/vocabulary/hsk-3"},{label:"HSK 4 - Diễn đạt chuyên sâu",href:"/vocabulary/hsk-4"},{label:"HSK 5 - Nâng cao",href:"/vocabulary/hsk-5"},{label:"HSK 6 - Nâng cao",href:"/vocabulary/hsk-6"},{label:"HSK 7-9",href:"/vocabulary/hsk-7-9"}]},
  {title:"Ôn luyện",links:[{label:"Từ điển Hán - Việt",href:"/dictionary"},{label:"Ôn tập theo chu kỳ",href:"/review"},{label:"Cách học từ vựng",href:"/resources"}]},
  {title:"Hỗ trợ",links:[{label:"Cô Tuyết Nhi",href:"/teachers"},{label:"Trung tâm trợ giúp",href:"/help"},{label:"Liên hệ",href:"/contact"}]},
];

export default function DashboardFooter() {
  return <footer className={styles.siteFooter}>
    <div className={styles.footerGrid}>
      <div className={styles.footerAbout}>
        <Link className={styles.footerBrand} href="/"><Image src="/xueyan-logo.jpg" alt="" width={42} height={42}/><strong>XUEYAN</strong></Link>
        <p>XUEYAN - Nền tảng học tiếng Trung dành cho người Việt, kết hợp tri thức Hán - Việt với phương pháp lặp lại ngắt quãng.</p>
        <div className={styles.footerTags}><span>HSK 1 - HSK 6+</span><span>Âm Hán Việt</span></div>
      </div>
      {footerGroups.map(group => <div className={styles.footerGroup} key={group.title}><h2>{group.title}</h2>{group.links.map(link => <Link key={link.label} href={link.href}>{link.label}</Link>)}</div>)}
    </div>
    <div className={styles.footerBottom}><span>© 2026 XUEYAN Hán Học. Bảo lưu mọi quyền.</span><span>Nền tảng Hán ngữ dành cho người Việt</span></div>
  </footer>;
}
