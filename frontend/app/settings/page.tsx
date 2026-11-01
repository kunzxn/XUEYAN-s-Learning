import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Cài đặt cá nhân | XUEYAN', description: 'Cài đặt cá nhân trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {SettingsScreen} from "@/components/screens/ProfileScreens";
export default async function Page(){await requireWorkspace("learner");return <SettingsScreen/>;}
