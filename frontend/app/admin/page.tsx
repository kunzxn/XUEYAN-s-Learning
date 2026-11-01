import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Tổng quan quản trị | XUEYAN', description: 'Tổng quan quản trị trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {AdminOverview} from "@/components/admin/AdminWorkspace";
export default async function Page(){await requireWorkspace("admin");return <AdminOverview/>;}
