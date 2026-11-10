import Link from "next/link";
import { s } from "@/components/ui/Primitives";

export default function NotFound() {
  return <main className={`${s.layout} ${s.public} ${s.stack}`}><h1>Không tìm thấy trang</h1><p>Liên kết có thể đã thay đổi hoặc nội dung này chưa tồn tại. Hãy chọn một điểm bắt đầu bên dưới.</p><div className={s.actions}><Link className={s.button} href="/collection">Về sổ từ</Link><Link className={`${s.button} ${s.secondary}`} href="/">Về trang chủ</Link></div></main>;
}
