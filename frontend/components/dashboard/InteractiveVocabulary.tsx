"use client";

import { useState, useSyncExternalStore } from "react";
import { Bookmark, CheckCircle2, FlipHorizontal2, Volume2 } from "lucide-react";
import { FlipCard } from "@/components/ui/FlipCard";
import styles from "@/app/dashboard/dashboard.module.css";

const savedCardKey = "xueyan-saved-friend-card";
const savedCardEvent = "xueyan-saved-card-change";

function subscribeToSavedCard(callback: () => void) {
  const notify = () => callback();
  window.addEventListener("storage", notify);
  window.addEventListener(savedCardEvent, notify);

  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(savedCardEvent, notify);
  };
}

function getSavedCardSnapshot() {
  try { return window.localStorage.getItem(savedCardKey) === "true"; } catch { return false; }
}

export default function InteractiveVocabulary() {
  const [flipped, setFlipped] = useState(false);
  const saved = useSyncExternalStore(subscribeToSavedCard, getSavedCardSnapshot, () => false);
  const [feedback, setFeedback] = useState("");

  function speakWord() {
    if (!("speechSynthesis" in window)) {
      setFeedback("Trình duyệt này chưa hỗ trợ phát âm tự động.");
      return;
    }

    window.speechSynthesis.cancel();
    const pronunciation = new SpeechSynthesisUtterance("朋友");
    pronunciation.lang = "zh-CN";
    pronunciation.onstart = () => setFeedback("Đang phát âm: péngyou");
    pronunciation.onerror = () => setFeedback("Không thể phát âm. Vui lòng thử lại.");
    pronunciation.onend = () => setFeedback("");
    window.speechSynthesis.speak(pronunciation);
  }

  function toggleSaved() {
    const nextSaved = !saved;
    try {
      window.localStorage.setItem(savedCardKey, String(nextSaved));
    } catch {
      setFeedback("Không thể lưu từ. Vui lòng cho phép trình duyệt lưu dữ liệu và thử lại.");
      return;
    }
    window.dispatchEvent(new Event(savedCardEvent));
    setFeedback(nextSaved ? "Đã đánh dấu 朋友 trên thiết bị này; chưa đồng bộ sổ từ trên server." : "Đã bỏ đánh dấu 朋友 trên thiết bị này.");
  }

  return (
    <section className={`${styles.vocabularySection} ${styles.fullBand}`} id="tu-vung">
      <div className={styles.demoContainer}>
        <div className={`${styles.sectionHeading} ${styles.centerHeading}`}>
          <h2>Thử lật một thẻ từ</h2>
        </div>

        <article className={styles.demoCard}>
          <div className={styles.demoWordHeader}>
            <div className={styles.demoWordIdentity}>
              <span className={styles.demoCharacter} lang="zh-Hans">友</span>
              <div>
                <div className={styles.demoWordLine}>
                  <strong lang="zh-Hans">朋友</strong>
                  <span>péngyou</span>
                </div>
                <span className={styles.sinoVietnamese}>Âm Hán Việt: BẰNG HỮU</span>
              </div>
            </div>
            <button type="button" className={styles.audioButton} onClick={speakWord}>
              <Volume2 size={19} aria-hidden="true" />
              Nghe phát âm chuẩn
            </button>
          </div>

          <FlipCard flipped={flipped} onFlip={setFlipped} label="Thẻ 朋友" seal="友"
            front={<><p className={styles.demoFaceHan} lang="zh-Hans">朋友</p><p className={styles.demoFacePinyin}>péngyou</p></>}
            back={<><p className={styles.demoBackMeaning}>Bạn bè</p><p className={styles.demoBackNote}>Âm Hán Việt: BẰNG HỮU</p><p className={styles.demoBackExample} lang="zh-Hans">他们是我的好朋友。</p><p className={styles.demoBackNote}>Họ là những người bạn tốt của tôi.</p></>} />

          <div className={styles.demoActions}>
            <div className={styles.demoButtonGroup}>
              <button type="button" className={styles.flipButton} aria-pressed={flipped} onClick={() => setFlipped((value) => !value)}>
                <FlipHorizontal2 size={18} aria-hidden="true" />
                {flipped ? "Lật lại mặt trước" : "Thử lật thẻ ghi nhớ"}
              </button>
              <button type="button" className={styles.saveButton} aria-pressed={saved} onClick={toggleSaved}>
                {saved ? <CheckCircle2 size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
                {saved ? "Đã lưu vào sổ từ" : "Lưu vào sổ từ cá nhân"}
              </button>
            </div>
          </div>
          <p className={styles.feedbackMessage} role="status" aria-live="polite">{feedback}</p>
        </article>
      </div>
    </section>
  );
}
