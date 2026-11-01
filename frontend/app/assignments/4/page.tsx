import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Bài tập 4 | XUEYAN', description: 'Bài tập 4 trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {AssignmentScreen} from "@/components/screens/ClassScreens";
export default async function Page(){await requireWorkspace("learner");return <AssignmentScreen/>;}
