import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Từ đã học của tôi | XUEYAN', description: 'Từ đã học của tôi trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ConnectedLearning} from "@/components/screens/ConnectedLearning";
export default async function Page(){await requireWorkspace("learner");return <ConnectedLearning/>;}
