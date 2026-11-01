import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Thông báo | XUEYAN', description: 'Thông báo trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {NotificationsScreen} from "@/components/screens/DiscoveryScreens";
export default async function Page(){await requireWorkspace("learner");return <NotificationsScreen/>;}
