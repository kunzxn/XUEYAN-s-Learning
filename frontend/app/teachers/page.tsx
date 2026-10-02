import AppShell from "@/components/dashboard/AppShell";
import PageHeader from "@/components/dashboard/PageHeader";
import { teacherList } from "@/lib/mock-data";

export default function TeachersPage() {
  return (
    <AppShell pageTitle="Giáo viên" pageSubtitle="Danh sách giáo viên và chuyên môn hỗ trợ học tập.">
      <PageHeader title="Đội ngũ giáo viên" description="Học cùng mentor phù hợp với mục tiêu, cấp độ và phong cách học của bạn." />

      <section className="card-grid three-up">
        {teacherList.map((teacher) => (
          <article key={teacher.name} className="card teacher-card">
            <div className="teacher-avatar">{teacher.name.charAt(0)}</div>
            <h3>{teacher.name}</h3>
            <p className="teacher-role">{teacher.role}</p>
            <ul>
              <li>{teacher.expertise}</li>
              <li>{teacher.schedule}</li>
            </ul>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
