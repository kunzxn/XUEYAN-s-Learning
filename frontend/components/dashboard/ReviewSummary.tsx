import { ArrowRight, Clock3 } from "lucide-react";

export default function ReviewSummary({
  onOpenPreview,
}: {
  onOpenPreview: () => void;
}) {
  return (
    <article className="card review-card">
      <div className="card-header-row">
        <div>
          <p className="section-kicker">Ôn tập hôm nay</p>
          <h3>Đến hạn ôn tập</h3>
        </div>
        <span className="count-badge">24 từ</span>
      </div>

      <div className="review-main">
        <div className="review-meta">
          <Clock3 size={18} aria-hidden="true" />
          <span>8–10 phút</span>
        </div>
        <p className="review-copy">
          Ôn tập đúng lịch giúp bạn ghi nhớ từ vựng lâu hơn và giữ nhịp học đều mỗi ngày.
        </p>
      </div>

      <button type="button" className="primary-button review-button" onClick={onOpenPreview}>
        Ôn tập ngay
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </article>
  );
}
