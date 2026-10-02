import { ArrowUpRight, BookCheck, Clock3, Target } from "lucide-react";

const icons = {
  streak: Sparkles,
  words: BookCheck,
  review: Clock3,
  goal: Target,
};

function Sparkles({ size = 18, ...props }: { size?: number; [key: string]: unknown }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 2.5v3.5M12 18v3.5M4.5 12h3.5M16 12h3.5M6.5 6.5l2.3 2.3M15.2 15.2l2.3 2.3M15.2 8.8l2.3-2.3M6.5 17.5l2.3-2.3" strokeLinecap="round" />
    </svg>
  );
}

export default function StatCard({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "success" | "warning";
}) {
  const Icon = icons[(label.includes("Ngày") ? "streak" : label.includes("Từ") ? "words" : label.includes("Mục tiêu") ? "goal" : "review") as keyof typeof icons];

  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-card-head">
        <span className="stat-icon">
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className="trend-pill">
          <ArrowUpRight size={14} aria-hidden="true" />
          {tone === "success" ? "Tốt" : tone === "warning" ? "Cần nhắc" : "Ổn định"}
        </span>
      </div>
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
      <span className="stat-note">{note}</span>
    </article>
  );
}
