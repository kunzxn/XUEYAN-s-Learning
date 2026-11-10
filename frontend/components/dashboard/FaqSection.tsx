"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";

const questions = [
  {
    question: "Người mới bắt đầu chưa biết gì có thể tự học trên XUEYAN không?",
    answer: "Có. Lộ trình bắt đầu từ phát âm Pinyin, thanh điệu cơ bản và những bộ thủ thường gặp, sau đó tăng dần độ khó theo cấp độ HSK.",
  },
  {
    question: "Học theo phương pháp Âm Hán - Việt có giúp ghi nhớ nhanh hơn không?",
    answer: "Âm Hán - Việt tạo thêm một điểm liên hệ giữa tiếng Việt và tiếng Trung, giúp bạn nhận ra mối liên quan trong nhiều từ vựng.",
  },
  {
    question: "Thuật toán lặp lại ngắt quãng (SRS) trên XUEYAN hoạt động như thế nào?",
    answer: "Lịch ôn tập sắp xếp từ cần luyện lại theo từng phiên học, giúp bạn quay lại với từ vựng một cách đều đặn.",
  },
  {
    question: "Tôi có thể tham gia các lớp học trực tiếp với giảng viên không?",
    answer: "Bạn có thể xem thông tin và lịch đồng hành của đội ngũ giáo viên tại trang Giáo viên.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={`${styles.faqSection} ${styles.fullBand}`} id="faq">
      <div className={styles.faqContainer}>
        <div className={`${styles.sectionHeading} ${styles.centerHeading}`}>
          <h2>Câu hỏi thường gặp</h2>
          <p>Những thông tin giúp bạn bắt đầu hành trình học tiếng Trung cùng XUEYAN.</p>
        </div>
        <div className={styles.faqList}>
          {questions.map((item, index) => {
            const isOpen = index === openIndex;
            const answerId = `faq-answer-${index + 1}`;

            return (
              <article className={styles.faqItem} key={item.question}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    {item.question}
                    <ChevronDown className={isOpen ? styles.chevronOpen : ""} size={21} aria-hidden="true" />
                  </button>
                </h3>
                <div id={answerId} className={styles.faqAnswer} hidden={!isOpen}>
                  {item.answer}
                </div>
              </article>
            );
          })}
        </div>
        <p className={styles.faqSupport}>Bạn còn câu hỏi chuyên sâu khác? <Link href="/teachers">Trò chuyện với cố vấn học vụ</Link></p>
      </div>
    </section>
  );
}
