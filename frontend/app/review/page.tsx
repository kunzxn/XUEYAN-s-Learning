import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Ôn tập | XUEYAN', description: 'Ôn tập trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ReviewOverview} from "@/components/screens/LearningScreens";
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string}>}){await requireWorkspace("learner");const {demo}=await searchParams;return <ReviewOverview empty={demo==="empty"}/>;}
