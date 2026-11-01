import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Sổ từ vựng | XUEYAN', description: 'Sổ từ vựng trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import { CollectionScreen } from "@/components/screens/LearningScreens";
import {SavedLibrary} from "@/components/screens/ConnectedDictionary";
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string}>}){await requireWorkspace("learner");const {demo}=await searchParams;return demo?<CollectionScreen/>:<SavedLibrary/>;}
