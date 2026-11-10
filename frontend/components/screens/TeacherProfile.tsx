import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { PublicLayout } from "@/components/ui/Layouts";
import t from "./teacher-profile.module.css";

export const ZALO_URL = "https://zalo.me/0352597551";

const credentials = [
  { big: "HSK 6", small: "Chứng chỉ năng lực Hán ngữ" },
  { big: "Cử nhân", small: "Ngôn ngữ Trung" },
  { big: "ĐH Ngoại ngữ Đà Nẵng", small: "Nơi đào tạo" },
  { big: "Giải nhì", small: "Chung kết Cuộc thi Diễn cảm tiếng Trung 2026" },
] as const;

export function ZaloButton({ className = "", children = "Thông tin liên hệ" }: { className?: string; children?: React.ReactNode }) {
  return (
    <a className={`${t.zalo} ${className}`} href={ZALO_URL} target="_blank" rel="noopener noreferrer">
      <MessageCircle size={20} aria-hidden="true" />
      <span>{children}</span>
      <span className={t.srOnly}> (mở Zalo ở tab mới)</span>
    </a>
  );
}

export default function TeacherProfile() {
  return (
    <PublicLayout>
      <div className={t.page}>
        <section className={t.hero} aria-labelledby="teacher-name">
          <div className={t.intro}>
            <p className={t.role}>Giáo viên tiếng Trung · XUEYAN</p>
            <h1 id="teacher-name">
              Trần Thị
              <br />
              <span className={t.nameLine}>
                Tuyết Nhi
                <svg className={t.stroke} viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 12 C 60 3, 120 17, 200 8 S 280 6, 297 10" pathLength="1" />
                </svg>
              </span>
            </h1>
            <ul className={t.chips} aria-label="Thành tích nổi bật">
              <li>HSK 6</li>
              <li>Cử nhân Ngôn ngữ Trung</li>
              <li>Giải nhì Diễn cảm tiếng Trung 2026</li>
            </ul>
            <div className={t.actions}>
              <ZaloButton>Thông tin liên hệ</ZaloButton>
              <Link className={t.ghost} href="/vocabulary">
                Xem lộ trình HSK <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={t.stage}>
            <figure className={`${t.photo} ${t.photoMain}`}>
              <Image src="/teacher/tuyet-nhi-aodai.jpg" alt="Giáo viên Trần Thị Tuyết Nhi trong áo dài, cầm hoa" width={1330} height={2000} priority sizes="(max-width: 900px) 70vw, 380px" />
            </figure>
            <figure className={`${t.photo} ${t.photoStudio}`}>
              <Image src="/teacher/tuyet-nhi-studio.jpg" alt="Giáo viên Trần Thị Tuyết Nhi mỉm cười trong ảnh studio" width={1600} height={2000} sizes="(max-width: 900px) 40vw, 220px" />
            </figure>
            <figure className={`${t.photo} ${t.photoGrad}`}>
              <Image src="/teacher/tuyet-nhi-tot-nghiep.jpg" alt="Giáo viên Trần Thị Tuyết Nhi trong lễ tốt nghiệp, giơ tay chữ V" width={2000} height={1333} sizes="(max-width: 900px) 50vw, 280px" />
            </figure>
          </div>
        </section>

        <section className={t.creds} aria-labelledby="creds-title">
          <h2 id="creds-title">Hồ sơ</h2>
          <ul className={t.tiles}>
            {credentials.map((item, index) => (
              <li key={item.big} className={t.tile} style={{ "--i": index } as React.CSSProperties}>
                <strong>{item.big}</strong>
                <span>{item.small}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={t.contact} aria-labelledby="contact-title">
          <h2 id="contact-title">Trao đổi trực tiếp</h2>
          <ZaloButton className={t.zaloLarge}>Thông tin liên hệ</ZaloButton>
        </section>
      </div>
    </PublicLayout>
  );
}
