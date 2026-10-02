export type NavItem = {
  label: string;
  href: string;
  badge?: string;
};

export const navItems: NavItem[] = [
  { label: "Tổng quan", href: "/dashboard" },
  { label: "Học theo HSK", href: "/vocabulary" },
  { label: "Ôn tập", href: "/review" },
  { label: "Giáo viên", href: "/teachers" },
  { label: "Hồ sơ", href: "/profile" },
];

export const statsData = [
  { label: "Chuỗi ngày học", value: "7 ngày", note: "Ổn định" },
  { label: "Từ đã học", value: "248", note: "+12 tuần này" },
  { label: "Từ đến hạn ôn hôm nay", value: "24", note: "8–10 phút" },
  { label: "Mục tiêu hôm nay", value: "12/20", note: "Tiến độ 60%" },
];

export const weeklyActivity = [
  { day: "T2", count: 8 },
  { day: "T3", count: 12 },
  { day: "T4", count: 6 },
  { day: "T5", count: 18 },
  { day: "T6", count: 15 },
  { day: "T7", count: 11 },
  { day: "CN", count: 14 },
];

export const lessonCards = [
  {
    id: "current",
    title: "Bài 08",
    theme: "Cuộc sống hằng ngày",
    words: 18,
    progress: 72,
    status: "Đang học",
    tone: "active",
  },
  {
    id: "suggest-1",
    title: "Bài 09",
    theme: "Mua sắm và di chuyển",
    words: 16,
    progress: 0,
    status: "Gợi ý",
    tone: "suggested",
  },
  {
    id: "suggest-2",
    title: "Bài 10",
    theme: "Cơm nước và gia đình",
    words: 17,
    progress: 0,
    status: "Gợi ý",
    tone: "suggested",
  },
];

export const vocabularySpotlight = {
  han: "学习",
  pinyin: "xuéxí",
  meaning: "Học; học tập",
  example: "我每天学习中文。",
  examplePinyin: "Wǒ měitiān xuéxí Zhōngwén.",
  exampleMeaning: "Tôi học tiếng Trung mỗi ngày.",
};

export const teacherList = [
  {
    name: "Linh Nguyễn",
    role: "Giáo viên HSK 3",
    expertise: "Từ vựng giao tiếp",
    schedule: "Thứ 2, 4, 6",
  },
  {
    name: "Minh Hoàng",
    role: "Giáo viên phát âm",
    expertise: "Pinyin & ngữ điệu",
    schedule: "Thứ 3, 5, 7",
  },
  {
    name: "Tuệ Lương",
    role: "Coach học tập",
    expertise: "Tăng tốc ôn tập",
    schedule: "Thứ 2, 5",
  },
];

export const profileData = {
  name: "Hùng",
  level: "HSK 3",
  streak: 7,
  focus: "Giao tiếp hằng ngày",
  completed: 248,
  target: 320,
};
