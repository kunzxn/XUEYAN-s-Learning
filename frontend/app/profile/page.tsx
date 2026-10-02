import AppShell from "@/components/dashboard/AppShell";
import PageHeader from "@/components/dashboard/PageHeader";
import { profileData } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <AppShell pageTitle="Hồ sơ học viên" pageSubtitle="Theo dõi tiến độ cá nhân và nhịp học phù hợp.">
      <PageHeader title="Thông tin học viên" description="Bạn đang theo đuổi mục tiêu giao tiếp tiếng Trung thực tế với lộ trình rõ ràng." />

      <section className="profile-panel card">
        <div className="profile-head">
          <div className="teacher-avatar profile-avatar">H</div>
          <div>
            <h3>{profileData.name}</h3>
            <p>{profileData.level}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div>
            <span>Streak</span>
            <strong>{profileData.streak} ngày</strong>
          </div>
          <div>
            <span>Tiêu điểm</span>
            <strong>{profileData.focus}</strong>
          </div>
          <div>
            <span>Đã hoàn thành</span>
            <strong>{profileData.completed}/{profileData.target} từ</strong>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
