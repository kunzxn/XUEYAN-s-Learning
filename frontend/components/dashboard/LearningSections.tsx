import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, CheckCircle2, Pencil, RotateCw, TrendingUp } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";

const pathways = [
  {
    level: "HSK 1 - 2",
    length: "8 - 12 tuần",
    title: "Khởi đầu vững chắc & Phát âm Pinyin",
    description: "Nắm vững 300 - 500 từ vựng cốt lõi, hoàn thiện chuẩn hóa bảng chữ cái ngữ âm và mẫu câu giao tiếp căn bản.",
    points: ["Chuẩn 21 thanh mẫu, 36 vận mẫu", "100 bộ thủ chữ Hán thông dụng"],
    tone: "levelBlue",
  },
  {
    level: "HSK 3",
    length: "12 - 16 tuần",
    title: "Giao tiếp độc lập & Đa ngữ cảnh",
    description: "600 từ vựng mở rộng, tự tin trò chuyện công việc, du lịch, mua sắm và sinh hoạt đời sống hàng ngày.",
    points: ["Cấu trúc ngữ pháp liên kết câu", "Viết đoạn văn ngắn 100 chữ"],
    tone: "levelGreen",
  },
  {
    level: "HSK 4 - 5",
    length: "24 - 32 tuần",
    title: "Thấu suốt văn bản & Thảo luận sâu",
    description: "1200+ từ vựng, đọc hiểu tin tức, bài luận, phản xạ nghe nói chuyên nghiệp và diễn đạt ý niệm trừu tượng.",
    points: ["Kỹ năng đọc lướt & bắt ý chính", "Viết bài luận nghị luận xã hội"],
    tone: "levelSlate",
  },
  {
    level: "HSK 6 & 7-9",
    length: "Chuyên sâu",
    title: "Học thuật, Thương mại & Biên phiên dịch",
    description: "Chinh phục chữ Hán cao cấp, dịch thuật, văn bản học thuật và tìm hiểu chiều sâu văn hóa truyền thống Á Đông.",
    points: ["Hán ngữ thương mại & đàm phán", "Nền tảng thi tuyển học bổng"],
    tone: "levelGold",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Khám phá qua gốc Hán - Việt",
    description: "Tận dụng nét tương đồng ngữ nghĩa giữa tiếng Việt và tiếng Hán để hiểu cội nguồn từng chữ, thay vì ghi nhớ máy móc.",
    detail: "Phân tích hình thanh & hội ý",
    Icon: BookOpenText,
  },
  {
    number: "02",
    title: "Học bài ngắn 15 phút mỗi ngày",
    description: "Bài học cô đọng gồm phát âm chuẩn, thứ tự nét viết tương tác và ứng dụng ngay vào ngữ cảnh giao tiếp đời sống.",
    detail: "Luyện nét Mễ tự cách",
    Icon: Pencil,
  },
  {
    number: "03",
    title: "Ôn tập đúng chu kỳ Spaced Repetition",
    description: "Lịch ôn tập nhắc lại từ vựng theo từng phiên để củng cố trí nhớ và duy trì nhịp học đều đặn.",
    detail: "Theo dõi tiến độ ghi nhớ",
    Icon: RotateCw,
  },
];

export function HskPathways() {
  return (
    <section className={`${styles.pathwaySection} ${styles.fullBand}`} id="lo-trinh">
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeadingRow}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Lộ trình học chuẩn hóa</span>
            <h2>Lộ trình học theo chuẩn HSK 3.0</h2>
            <p>Thiết kế mạch lạc từ sơ cấp đến cao cấp, tập trung phản xạ tự nhiên và hiểu sâu ngữ nghĩa thông qua ngữ nguyên Hán - Việt.</p>
          </div>
          <Link className={styles.textLink} href="/vocabulary">Toàn bộ 6 cấp độ chuyên sâu <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className={styles.pathwayGrid}>
          {pathways.map((pathway) => (
            <article className={styles.pathwayCard} key={pathway.level}>
              <div>
                <div className={styles.pathwayMeta}>
                  <span className={`${styles.levelTag} ${styles[pathway.tone]}`}>{pathway.level}</span>
                  <span className={styles.duration}>{pathway.length}</span>
                </div>
                <h3>{pathway.title}</h3>
                <p>{pathway.description}</p>
                <ul className={styles.checkList}>
                  {pathway.points.map((point) => <li key={point}><CheckCircle2 size={16} aria-hidden="true" />{point}</li>)}
                </ul>
              </div>
              <Link className={styles.cardLink} href="/vocabulary">Xem chi tiết</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LearningMethod() {
  return (
    <section className={styles.sectionContainer}>
      <div className={`${styles.sectionHeading} ${styles.centerHeading}`}>
        <span className={styles.eyebrow}>Phương pháp luận</span>
        <h2>3 bước đơn giản giúp bạn làm chủ chữ Hán</h2>
        <p>Không nhồi nhét, không học vẹt. Phương pháp kết hợp ghi nhớ chủ động với lịch ôn tập đều đặn.</p>
      </div>
      <div className={styles.stepGrid}>
        {steps.map(({ number, title, description, detail, Icon }) => (
          <article className={styles.stepCard} key={number}>
            <div className={styles.stepTopline}>
              <span>{number}</span>
              <Icon size={21} aria-hidden="true" />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className={styles.stepDetail}><TrendingUp size={16} aria-hidden="true" />{detail}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ClosingCallToAction({ onStart }: { onStart: () => void }) {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.closingCta}>
        <span className={styles.ctaKanji} aria-hidden="true">言</span>
        <div className={styles.ctaCopy}>
          <span className={styles.ctaEyebrow}>Bắt đầu hôm nay</span>
          <h2>Hành trình vạn dặm khởi đầu từ một nét bút thuần thục.</h2>
          <p>Tiếp tục bài học hiện tại và cảm nhận nhịp học tiếng Trung khoa học, vừa sức.</p>
        </div>
        <button type="button" className={styles.ctaLightButton} onClick={onStart}>Tiếp tục bài học</button>
      </div>
    </section>
  );
}

export function TeacherImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return <div className={styles.teacherImageFallback} role="img" aria-label={alt}>LA</div>;
  }

  return <Image className={styles.teacherImage} src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized />;
}
