import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Thiết lập lộ trình | XUEYAN', description: 'Thiết lập lộ trình trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {AccountPreferences} from "@/components/screens/AccountPreferences";
export default async function Page(){await requireWorkspace("learner");return <AccountPreferences onboarding/>;}
