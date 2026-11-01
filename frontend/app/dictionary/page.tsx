export const metadata = { title: 'Từ điển tiếng Trung | XUEYAN', description: 'Từ điển tiếng Trung trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {DictionaryScreen} from "@/components/screens/DiscoveryScreens";
import {ConnectedDictionary} from "@/components/screens/ConnectedDictionary";
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string}>}){const {demo}=await searchParams;return demo?<DictionaryScreen demo={demo}/>:<ConnectedDictionary/>;}
