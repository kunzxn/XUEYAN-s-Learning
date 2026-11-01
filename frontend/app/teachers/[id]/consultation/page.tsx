export const metadata = { title: 'Tư vấn cùng giáo viên | XUEYAN', description: 'Tư vấn cùng giáo viên trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {notFound} from "next/navigation";
import {ConsultationScreen} from "@/components/screens/TeacherScreens";
import {demoTeachers} from "@/lib/ui-demo-data";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!demoTeachers.some(t=>t.id===id))notFound();return <ConsultationScreen id={id}/>;}
