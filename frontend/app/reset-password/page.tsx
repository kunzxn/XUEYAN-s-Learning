export const metadata = { title: 'Đặt lại mật khẩu | XUEYAN', description: 'Đặt lại mật khẩu trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {AuthScreen} from "@/components/screens/AuthScreens";
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string}>}){const {demo}=await searchParams;return <AuthScreen kind="reset" demo={demo}/>;}
