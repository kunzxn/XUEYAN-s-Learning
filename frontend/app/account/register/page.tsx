export const metadata = { title: 'Đăng ký | XUEYAN', description: 'Đăng ký trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ConnectedAccount} from "@/components/screens/ConnectedLearning";
export default async function Page({searchParams}:{searchParams:Promise<{next?:string}>}){const {next}=await searchParams;return <ConnectedAccount returnTo={next} register/>;}
