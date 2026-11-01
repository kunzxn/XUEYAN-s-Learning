import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Không gian giảng viên mẫu | XUEYAN', description: 'Không gian giảng viên mẫu trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {TeacherDashboard} from "@/components/screens/TeacherScreens";
export default async function Page(){await requireWorkspace("teacher");return <TeacherDashboard/>;}
