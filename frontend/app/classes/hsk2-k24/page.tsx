import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Lớp HSK 2 K24 | XUEYAN', description: 'Lớp HSK 2 K24 trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ClassDetail} from "@/components/screens/ClassScreens";
export default async function Page(){await requireWorkspace("learner");return <ClassDetail/>;}
