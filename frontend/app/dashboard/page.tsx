import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Hôm nay | XUEYAN', description: 'Hôm nay trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import LearnerDashboard from "@/components/screens/LearnerDashboard";
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string}>}){await requireWorkspace("learner"); const {demo}=await searchParams; return <LearnerDashboard initialState={demo} />; }
