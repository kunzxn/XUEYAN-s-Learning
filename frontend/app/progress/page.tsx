import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Tiến độ học tập | XUEYAN', description: 'Tiến độ học tập trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ProgressScreen} from "@/components/screens/ProfileScreens";
export default async function Page(){await requireWorkspace("learner");return <ProgressScreen/>;}
