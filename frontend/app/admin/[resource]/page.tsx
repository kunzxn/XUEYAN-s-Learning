import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Quản lý dữ liệu | XUEYAN', description: 'Quản lý dữ liệu trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {notFound} from "next/navigation";
import {AdminCrud} from "@/components/admin/AdminWorkspace";
export default async function Page({params}:{params:Promise<{resource:string}>}){await requireWorkspace("admin");const {resource}=await params;if(!["words","users","lessons","teachers"].includes(resource))notFound();return <AdminCrud key={resource} resource={resource}/>;}
