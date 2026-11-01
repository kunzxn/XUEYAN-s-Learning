export const metadata = { title: 'Đăng ký | XUEYAN', description: 'Đăng ký trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {AuthScreen} from "@/components/screens/AuthScreens";
import {ConnectedAccount} from "@/components/screens/ConnectedLearning";
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string;next?:string}>}){const {demo,next}=await searchParams;return demo?<AuthScreen kind="register" demo={demo}/>:<ConnectedAccount register returnTo={next}/>;}
