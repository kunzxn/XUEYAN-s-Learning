"use client";

import { Suspense, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardHero from "@/components/dashboard/DashboardHero";
import FeaturedTeachers from "@/components/dashboard/FeaturedTeachers";
import FaqSection from "@/components/dashboard/FaqSection";
import InteractiveVocabulary from "@/components/dashboard/InteractiveVocabulary";
import { ClosingCallToAction, HskPathways, LearningMethod } from "@/components/dashboard/LearningSections";
import PreviewDialog from "@/components/dashboard/PreviewDialog";
import styles from "./dashboard.module.css";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [dialogMode, setDialogMode] = useState<"lesson" | "review" | null>(null);

  const demoState = searchParams.get("demo");

  const dialog =
    dialogMode === "review"
      ? {
          title: "Phiên ôn tập xem trước",
          subtitle: "Bạn sẽ được ôn 24 từ trong 8–10 phút với nhịp lặp lại theo lịch học đã đặt.",
        }
      : {
          title: "Bài học xem trước",
          subtitle: "Màn hình này mô phỏng một buổi học tiếp tục với bài 08: Cuộc sống hằng ngày.",
        };

  return (
    <>
      <DashboardHeader onStart={() => setDialogMode("lesson")} />
      <main id="dashboard-main" tabIndex={-1} className={styles.page}>
        {process.env.NODE_ENV === "development" && demoState === "loading" ? (
          <section className={styles.statePanel} role="status" aria-busy="true" aria-label="Đang tải dashboard">
            <span>Đang tải dữ liệu học tập…</span><div className="skeleton-box skeleton-xl" />
            <div className="skeleton-grid">
              <div className="skeleton-box skeleton-md" />
              <div className="skeleton-box skeleton-md" />
              <div className="skeleton-box skeleton-md" />
              <div className="skeleton-box skeleton-md" />
            </div>
          </section>
        ) : process.env.NODE_ENV === "development" && demoState === "empty" ? (
          <section className={styles.statePanel}>
            <CheckCircle2 size={36} aria-hidden="true" />
            <h1>Chưa có dữ liệu ôn tập cho ngày hôm nay</h1>
            <p>Hãy quay lại sau khi bạn hoàn tất bài học hoặc đặt lịch ôn tập mới.</p>
            <button className={styles.primaryButton} onClick={() => setDialogMode("lesson")}>Bắt đầu bài học</button>
          </section>
        ) : process.env.NODE_ENV === "development" && demoState === "error" ? (
          <section className={styles.statePanel}>
            <Sparkles size={36} aria-hidden="true" />
            <h1>Không thể tải dữ liệu học tập</h1>
            <p role="alert">Vui lòng kiểm tra kết nối hoặc thử làm mới lại dữ liệu trong vài phút.</p>
            <button className={styles.primaryButton} onClick={() => { const url = new URL(window.location.href); url.searchParams.delete("demo"); window.location.assign(url.href); }}>Thử lại</button>
          </section>
        ) : (
          <>
            <DashboardHero onStartLearning={() => setDialogMode("lesson")} onOpenReview={() => setDialogMode("review")} />
            <HskPathways />
            <LearningMethod />
            <InteractiveVocabulary />
            <FeaturedTeachers />
            <FaqSection />
            <ClosingCallToAction onStart={() => setDialogMode("lesson")} />
          </>
        )}
      </main>
      <DashboardFooter />
      <PreviewDialog
        mode={dialogMode ?? "lesson"}
        open={dialogMode !== null}
        title={dialog.title}
        subtitle={dialog.subtitle}
        onClose={() => setDialogMode(null)}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className={styles.page}><div className={styles.statePanel}><div className="skeleton-box skeleton-xl" /></div></main>}>
      <DashboardContent />
    </Suspense>
  );
}
