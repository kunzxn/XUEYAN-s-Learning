import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Phiên ôn Flashcard | XUEYAN', description: 'Phiên ôn Flashcard trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {StudySession} from "@/components/screens/LearningScreens";
import {demoWords} from "@/lib/ui-demo-data";
import {notFound} from "next/navigation";
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string;word?:string;limit?:string}>}){await requireWorkspace("learner");
  const {demo,word,limit}=await searchParams;
  if(word && !demoWords.some(w=>w.id===word)) notFound();
  if(limit && !["3","6"].includes(limit)) notFound();
  return <StudySession key={`${word ?? "all"}-${limit ?? "6"}`} initialState={demo} wordId={word} limit={Number(limit ?? 6)}/>;
}
