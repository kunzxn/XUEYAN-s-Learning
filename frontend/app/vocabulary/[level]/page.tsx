export const metadata = { title: 'Chi tiết lộ trình HSK | XUEYAN', description: 'Chi tiết lộ trình HSK trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {notFound} from "next/navigation";
import {HskDetail} from "@/components/screens/LearningScreens";
import {demoLevels} from "@/lib/ui-demo-data";
export default async function Page({params}:{params:Promise<{level:string}>}){const {level}=await params;const value=level.replace("hsk-", "");if(!demoLevels.some(l=>l.level===value))notFound();return <HskDetail key={value} level={value}/>;}
