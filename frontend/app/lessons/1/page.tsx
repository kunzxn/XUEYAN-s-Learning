import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Bài 01: Chào hỏi & Làm quen | XUEYAN', description: 'Bài 01: Chào hỏi & Làm quen trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import { LessonOverview } from "@/components/screens/LearningScreens";
export default async function Page(){await requireWorkspace("learner");return <LessonOverview/>;}
