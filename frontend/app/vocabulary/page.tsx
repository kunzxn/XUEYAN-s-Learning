import AppShell from "@/components/dashboard/AppShell";
import PageHeader from "@/components/dashboard/PageHeader";

const vocabularyLevels = [
  { level: "HSK 1", count: 150, tone: "success" },
  { level: "HSK 2", count: 200, tone: "default" },
  { level: "HSK 3", count: 300, tone: "default" },
  { level: "HSK 4", count: 600, tone: "warning" },
];

export default function VocabularyPage() {
  return (
    <AppShell pageTitle="Học theo HSK" pageSubtitle="Lộ trình từ vựng theo cấp độ và mục tiêu học tập.">
      <PageHeader title="Bộ từ vựng theo cấp độ" description="Mỗi cấp độ được thiết kế theo nhịp học dần dần và phù hợp với kiến thức giao tiếp thực tế." />

      <section className="card-grid two-up">
        {vocabularyLevels.map((level) => (
          <article key={level.level} className={`card level-card ${level.tone}`}>
            <div>
              <p className="section-kicker">{level.level}</p>
              <h3>{level.count} từ</h3>
            </div>
            <span className="mini-pill">Đã hoàn thành</span>
          </article>
        ))}
      </section>

      <section className="card list-card">
        <PageHeader title="Bài học mới đề xuất" description="Từ vựng theo chủ đề giao tiếp hằng ngày." />
        <ul className="list-stack">
          <li><strong>Chủ đề 08</strong><span>Cuộc sống hằng ngày</span></li>
          <li><strong>Chủ đề 09</strong><span>Mua sắm và đi lại</span></li>
          <li><strong>Chủ đề 10</strong><span>Cơm nước và gia đình</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
