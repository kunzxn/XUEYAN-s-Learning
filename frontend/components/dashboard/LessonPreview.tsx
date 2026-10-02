import { CirclePlay } from "lucide-react";
import { lessonCards } from "@/lib/mock-data";

export default function LessonPreview({
  onOpenPreview,
}: {
  onOpenPreview: () => void;
}) {
  const currentLesson = lessonCards[0];
  const suggestions = lessonCards.slice(1);

  return (
    <article className="card lesson-card">
      <div className="card-header-row">
        <div>
          <p className="section-kicker">Tiếp tục bài học</p>
          <h3>Bài đang học</h3>
        </div>
        <span className="status-tag active">{currentLesson.status}</span>
      </div>

      <div className="lesson-main">
        <div className="lesson-heading">
          <div>
            <h4>{currentLesson.title}</h4>
            <p>{currentLesson.theme}</p>
          </div>
          <button type="button" className="secondary-button" onClick={onOpenPreview}>
            <CirclePlay size={16} aria-hidden="true" />
            Tiếp tục
          </button>
        </div>

        <div className="lesson-details">
          <span>{currentLesson.words} từ</span>
          <span>{currentLesson.progress}% hoàn thành</span>
        </div>

        <div className="progress-shell" aria-label="Tiến độ bài học hiện tại">
          <span style={{ width: `${currentLesson.progress}%` }} />
        </div>
      </div>

      <div className="lesson-suggestions">
        {suggestions.map((lesson) => (
          <div key={lesson.id} className="suggestion-item">
            <div>
              <span className="suggestion-title">{lesson.title}</span>
              <small>{lesson.theme}</small>
            </div>
            <div className="suggestion-meta">
              <span>{lesson.words} từ</span>
              <span className="status-tag subtle">{lesson.status}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
