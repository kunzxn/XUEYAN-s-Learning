import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Chi tiết từ vựng | XUEYAN', description: 'Chi tiết từ vựng trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {notFound} from "next/navigation";
import {WordDetail} from "@/components/screens/LearningScreens";
import {demoWords} from "@/lib/ui-demo-data";
export default async function Page({params}:{params:Promise<{id:string}>}){await requireWorkspace("learner");const {id}=await params;const value=id;if(!demoWords.some(w=>w.id===value))notFound();return <WordDetail id={value}/>;}
