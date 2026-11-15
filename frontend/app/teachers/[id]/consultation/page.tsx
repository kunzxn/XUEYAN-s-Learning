import {redirect} from "next/navigation";
export const metadata = { title: 'Liên hệ cô Tuyết Nhi | XUEYAN' };
// Website chỉ có một giáo viên; mọi đường dẫn tư vấn cũ chuyển về trang giới thiệu có thông tin liên hệ.
export default function Page(){redirect("/teachers");}
