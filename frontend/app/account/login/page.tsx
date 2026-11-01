export const metadata = { title: 'Đăng nhập | XUEYAN', description: 'Đăng nhập trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ConnectedAccount} from "@/components/screens/ConnectedLearning";
export default async function Page({searchParams}:{searchParams:Promise<{next?:string}>}){const {next}=await searchParams;return <ConnectedAccount returnTo={next}/>;}
