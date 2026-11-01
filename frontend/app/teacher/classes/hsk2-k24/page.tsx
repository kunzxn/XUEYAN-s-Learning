import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Quản lý lớp HSK 2 K24 | XUEYAN', description: 'Quản lý lớp HSK 2 K24 trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {TeacherClassDetail} from "@/components/screens/TeacherScreens";
export default async function Page(){await requireWorkspace("teacher");return <TeacherClassDetail/>;}
