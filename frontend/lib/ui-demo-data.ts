// Stitch preview fixtures. These are not server records or authoritative HSK counts.
export const demoWords = [
  { id:"xuexi", han:"学习", pinyin:"xuéxí", hv:"HỌC TẬP", meaning:"Học tập", example:"我每天学习中文。", examplePinyin:"Wǒ měitiān xuéxí Zhōngwén.", translation:"Tôi học tiếng Trung mỗi ngày.", level:"HSK 1" },
  { id:"pengyou", han:"朋友", pinyin:"péngyou", hv:"BẰNG HỮU", meaning:"Bạn bè", example:"他们是我的好朋友。", examplePinyin:"Tāmen shì wǒ de hǎo péngyou.", translation:"Họ là những người bạn tốt của tôi.", level:"HSK 1" },
  { id:"xiexie", han:"谢谢", pinyin:"xièxie", hv:"TẠ TẠ", meaning:"Cảm ơn", example:"谢谢你的帮助。", examplePinyin:"Xièxie nǐ de bāngzhù.", translation:"Cảm ơn sự giúp đỡ của bạn.", level:"HSK 1" },
  { id:"gongzuo", han:"工作", pinyin:"gōngzuò", hv:"CÔNG TÁC", meaning:"Công việc", example:"我在这里工作。", examplePinyin:"Wǒ zài zhèlǐ gōngzuò.", translation:"Tôi làm việc ở đây.", level:"HSK 2" },
  { id:"shijian", han:"时间", pinyin:"shíjiān", hv:"THỜI GIAN", meaning:"Thời gian", example:"你有时间吗？", examplePinyin:"Nǐ yǒu shíjiān ma?", translation:"Bạn có thời gian không?", level:"HSK 2" },
  { id:"nihao", han:"你好", pinyin:"nǐ hǎo", hv:"NHĨ HẢO", meaning:"Xin chào", example:"你好，很高兴认识你。", examplePinyin:"Nǐ hǎo, hěn gāoxìng rènshi nǐ.", translation:"Xin chào, rất vui được làm quen với bạn.", level:"HSK 1" },
];
export const demoLevels = [
  { level:"1", title:"Nhập môn & Nền tảng phát âm", subtitle:"Sơ cấp I", lessons:24, words:150, points:["Phát âm chuẩn Pinyin", "Chữ Hán căn bản", "Chào hỏi & làm quen"] },
  { level:"2", title:"Hội thoại đời sống thường nhật", subtitle:"Sơ cấp II", lessons:30, words:300, points:["Ngữ pháp có liên động", "Ăn uống & nơi chốn", "Đoạn văn ngắn"] },
  { level:"3", title:"Giao tiếp độc lập & Đa ngữ cảnh", subtitle:"Tiền trung cấp", lessons:36, words:600, points:["Liên từ phức hợp", "So sánh nâng cao", "Phản xạ giao tiếp"] },
  { level:"4", title:"Trung cấp & Thảo luận sâu", subtitle:"Trung cấp", lessons:40, words:1200, points:["Âm Hán–Việt mở rộng", "Thành ngữ cơ bản", "Đọc lướt & nắm ý"] },
  { level:"5", title:"Cao cấp & Ứng dụng chuyên nghiệp", subtitle:"Cao cấp I", lessons:48, words:2500, points:["Văn phong trang trọng", "Phân tích ngữ cảnh", "Kỹ năng viết nghị luận"] },
  { level:"6", title:"Thành thạo & Bậc thầy ngôn ngữ", subtitle:"Cao cấp II", lessons:48, words:5000, points:["Cấu trúc ngữ pháp cao cấp", "Hán tự chuyên sâu", "Biên dịch diễn ngôn"] },
  { level:"7-9", title:"Nghiên cứu, Thương mại & Biên phiên dịch", subtitle:"Chuyên sâu học thuật", lessons:60, words:11092, points:["Dịch thuật văn bản", "Giao tiếp học thuật", "Nghiên cứu Hán học"] },
];
export const demoLessons = ["Chào hỏi & Làm quen", "Phát âm Pinyin & Thanh điệu", "Chữ Hán căn bản & Số đếm", "Bản thân & Gia đình", "Đời sống & Mua sắm", "Không gian & Phương hướng"];
export const demoTeachers = [
  { id:"lan-anh", name:"Cô Vũ Lan Anh", headline:"Giảng viên Hán ngữ", level:"HSK 1–4", goal:"Cơ bản", language:"Tiếng Việt & Tiếng Trung", schedule:"Buổi tối thứ 2, 4, 6 & cuối tuần", image:undefined, detail:"Phân tích cặn kẽ gốc rễ Hán–Việt, hướng dẫn sửa lỗi phát âm và thanh điệu." },
  { id:"minh-duc", name:"Thầy Trần Minh Đức", headline:"Chuyên gia HSK cao cấp", level:"HSK 5–6", goal:"Luyện thi", language:"Tiếng Việt & Tiếng Trung", schedule:"Các buổi tối trong tuần", image:"/teacher-minh-quan.jpg", detail:"Hệ thống hóa cấu trúc ngữ pháp và phương pháp tư duy Hán văn." },
  { id:"cam-tu", name:"Cô Hoàng Cẩm Tú", headline:"Hán ngữ thương mại", level:"HSK 3–5", goal:"Thương mại", language:"Tiếng Việt & Tiếng Trung", schedule:"Sáng thứ 3, 5, 7", image:undefined, detail:"Mô phỏng tình huống doanh nghiệp và văn hóa kinh doanh Trung Hoa." },
  { id:"vuong-tuan", name:"Thầy Vương Tuấn", headline:"Giáo viên bản ngữ", level:"HSK 1–6", goal:"Khẩu ngữ", language:"Tiếng Trung", schedule:"Cuối tuần & chiều thứ 2, 4", image:undefined, detail:"Môi trường giao tiếp tiếng Trung giúp rèn phản xạ nghe và nói." },
  { id:"mai-phuong", name:"Cô Lê Mai Phương", headline:"Phương pháp ghi nhớ", level:"HSK 1–3", goal:"Cơ bản", language:"Tiếng Việt & Tiếng Trung", schedule:"Tối thứ 2, 4, 6", image:"/teacher-chen-wei.jpg", detail:"Chiết tự chữ Hán và học từ trong ngữ cảnh gắn với lịch ôn tập." },
  { id:"quoc-bao", name:"Thầy Đỗ Quốc Bảo", headline:"Hán–Việt đối sánh & Dịch", level:"HSK 4–6", goal:"Dịch thuật", language:"Tiếng Việt & Tiếng Trung", schedule:"Thứ 7 & Chủ nhật", image:undefined, detail:"Nâng cao vốn từ chuyên môn và kỹ năng dịch tài liệu." },
];
