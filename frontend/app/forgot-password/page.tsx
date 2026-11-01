export const metadata = { title: 'Quên mật khẩu | XUEYAN', description: 'Quên mật khẩu trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {AuthScreen} from "@/components/screens/AuthScreens";
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string}>}){const {demo}=await searchParams;return <AuthScreen kind="forgot" demo={demo}/>;}
