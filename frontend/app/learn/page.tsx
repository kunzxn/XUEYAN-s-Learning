import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Học từ vựng theo tài khoản | XUEYAN', description: 'Học từ vựng theo tài khoản trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ConnectedLearning} from "@/components/screens/ConnectedLearning";
export default async function Page({searchParams}:{searchParams:Promise<{level?:string}>}){await requireWorkspace("learner");const {level}=await searchParams;return <ConnectedLearning key={level??"all"} study level={level&&["1","2","3","4","5","6","7-9"].includes(level)?level:undefined}/>;}
