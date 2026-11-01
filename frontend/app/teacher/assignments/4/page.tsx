import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Nhận xét bài tập 4 | XUEYAN', description: 'Nhận xét bài tập 4 trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {AssignmentReview} from "@/components/screens/TeacherScreens";
export default async function Page(){await requireWorkspace("teacher");return <AssignmentReview/>;}
