import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Thiết lập lộ trình | XUEYAN', description: 'Thiết lập lộ trình trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {OnboardingScreen} from "@/components/screens/AuthScreens";
export default async function Page(){await requireWorkspace("learner");return <OnboardingScreen/>;}
