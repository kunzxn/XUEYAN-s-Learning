export const metadata = { title: 'Hồ sơ giáo viên | XUEYAN', description: 'Hồ sơ giáo viên trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {notFound} from "next/navigation";
import {TeacherProfile} from "@/components/screens/TeacherScreens";
import {demoTeachers} from "@/lib/ui-demo-data";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!demoTeachers.some(t=>t.id===id))notFound();return <TeacherProfile id={id}/>;}
