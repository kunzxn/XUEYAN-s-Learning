"use client";

import { useState } from "react";
import { ArrowRight, Volume2 } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";
import { statsData, vocabularySpotlight } from "@/lib/mock-data";

export default function VocabularySpotlight({ onOpenReview }: { onOpenReview: () => void }) {
  const [feedback, setFeedback] = useState("");

  function speakWord() {
    if (!("speechSynthesis" in window)) {
      setFeedback("Trình duyệt này chưa hỗ trợ phát âm tự động.");
      return;
    }

    window.speechSynthesis.cancel();
    const pronunciation = new SpeechSynthesisUtterance(vocabularySpotlight.han);
    pronunciation.lang = "zh-CN";
    pronunciation.onstart = () => setFeedback("Đang phát âm từ vựng.");
    pronunciation.onerror = () => setFeedback("Không thể phát âm. Vui lòng thử lại.");
    pronunciation.onend = () => setFeedback("");
    window.speechSynthesis.speak(pronunciation);
  }

  return (
    <article className={styles.flashcard}>
      <div className={styles.flashcardHeader}>
        <div className={styles.flashcardMeta}>
          <span className={styles.cardTag}>HSK 3 · Từ vựng</span>
          <span className={styles.cardCounter}>Thẻ #0248</span>
        </div>
        <button type="button" className={styles.soundButton} onClick={speakWord} aria-label="Phát âm từ vựng">
          <Volume2 size={19} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.hanziStage}>
        <span className={styles.hanziText} lang="zh-Hans">{vocabularySpotlight.han}</span>
        <div className={styles.pinyinRow}>
          <strong>{vocabularySpotlight.pinyin}</strong>
          <span aria-hidden="true">·</span>
          <span className={styles.sinoVietnamese}>Âm HV: HỌC TẬP</span>
        </div>
      </div>

      <div className={styles.definitionGroup}>
        <span className={styles.definitionTitle}>Ý nghĩa ngữ căn</span>
        <p className={styles.definition}>{vocabularySpotlight.meaning}; lĩnh hội tri thức qua thời gian.</p>
        <div className={styles.exampleBox}>
          <span className={styles.exampleHanzi} lang="zh-Hans">{vocabularySpotlight.example}</span>
          <span className={styles.exampleCaption}>{vocabularySpotlight.examplePinyin} · {vocabularySpotlight.exampleMeaning}</span>
        </div>
      </div>

      <div className={styles.memoryFooter}>
        <span>{statsData[2].value} từ đến hạn ôn hôm nay</span>
        <button type="button" className={styles.reviewLink} onClick={onOpenReview}>
          Ôn tập <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
      <span className={styles.feedbackMessage} role="status" aria-live="polite">{feedback}</span>
    </article>
  );
}
