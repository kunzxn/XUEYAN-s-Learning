import AppShell from "@/components/dashboard/AppShell";
import PageHeader from "@/components/dashboard/PageHeader";

const flashcards = [
  { word: "学习", pinyin: "xuéxí", meaning: "Học tập" },
  { word: "朋友", pinyin: "péngyou", meaning: "Bạn bè" },
  { word: "工作", pinyin: "gōngzuò", meaning: "Công việc" },
  { word: "时间", pinyin: "shíjiān", meaning: "Thời gian" },
];

export default function ReviewPage() {
  return (
    <AppShell pageTitle="Ôn tập Flashcard" pageSubtitle="Lặp lại theo lịch để ghi nhớ dài hạn.">
      <PageHeader title="Phiên ôn tập hôm nay" description="24 từ cần ôn trong 8–10 phút. Thực hiện đều đặn sẽ tăng tỷ lệ nhớ từ lâu hơn." />

      <section className="card-grid two-up">
        {flashcards.map((card) => (
          <article key={card.word} className="card flashcard">
            <p className="word-han">{card.word}</p>
            <p className="word-pinyin">{card.pinyin}</p>
            <p className="word-meaning">{card.meaning}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
