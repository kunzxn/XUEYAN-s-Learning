import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Học từ vựng Bài 01 | XUEYAN', description: 'Học từ vựng Bài 01 trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import { StudySession } from "@/components/screens/LearningScreens";
export default async function Page(){await requireWorkspace("learner");return <StudySession learn/>;}
