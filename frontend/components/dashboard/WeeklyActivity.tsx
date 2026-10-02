import { weeklyActivity } from "@/lib/mock-data";

export default function WeeklyActivity() {
  const maxValue = Math.max(...weeklyActivity.map((item) => item.count));

  return (
    <div className="chart-panel">
      <div className="card-header-row">
        <div>
          <p className="section-kicker">Tiến độ học tập</p>
          <h3>Hoạt động 7 ngày gần nhất</h3>
        </div>
        <span className="summary-pill">+18% tuần này</span>
      </div>

      <div className="chart-wrapper" aria-label="Biểu đồ số từ học theo 7 ngày gần nhất">
        {weeklyActivity.map((item) => (
          <div key={item.day} className="chart-column">
            <div className="chart-value-label">{item.count}</div>
            <div className="chart-bar-wrap" aria-hidden="true">
              <span
                className="chart-bar"
                style={{ height: `${(item.count / maxValue) * 100}%` }}
              />
            </div>
            <span className="chart-label">{item.day}</span>
          </div>
        ))}
      </div>

      <div className="chart-summary">
        <span>Trung bình</span>
        <strong>11.7 từ/ngày</strong>
      </div>
    </div>
  );
}
