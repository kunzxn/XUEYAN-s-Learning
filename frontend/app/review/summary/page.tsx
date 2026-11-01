import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Tổng kết buổi học | XUEYAN', description: 'Tổng kết buổi học trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import { SessionSummary } from "@/components/screens/LearningScreens";
import {demoWords} from "@/lib/ui-demo-data";
import {notFound} from "next/navigation";
export default async function Page({searchParams}:{searchParams:Promise<{source?:string;count?:string;word?:string;run?:string}>}){await requireWorkspace("learner");
  const {source,count,word,run}=await searchParams;
  if(source && !["review","lesson-1"].includes(source)) notFound();
  if(count && !["1","3","6"].includes(count)) notFound();
  if(word && !demoWords.some(w=>w.id===word)) notFound();
  if(run && !/^[a-f0-9-]{36}$/i.test(run)) notFound();
  return <SessionSummary source={source} count={count ? Number(count) : undefined} wordId={word} runId={run}/>;
}
