import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Lớp học | XUEYAN', description: 'Lớp học trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ClassList} from "@/components/screens/ClassScreens";
export default async function Page(){await requireWorkspace("learner");return <ClassList/>;}
