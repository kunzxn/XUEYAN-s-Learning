import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Luyện tập Bài 01 | XUEYAN', description: 'Luyện tập Bài 01 trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import { PracticeScreen } from "@/components/screens/LearningScreens";
import {demoWords} from "@/lib/ui-demo-data";
import {notFound} from "next/navigation";
export default async function Page({searchParams}:{searchParams:Promise<{word?:string}>}){await requireWorkspace("learner");
  const {word}=await searchParams;
  if(word && !demoWords.some(w=>w.id===word)) notFound();
  return <PracticeScreen key={word ?? "all"} wordId={word}/>;
}
