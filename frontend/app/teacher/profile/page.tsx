import {requireWorkspace} from "@/lib/require-workspace";
export const metadata = { title: 'Hồ sơ sư phạm mẫu | XUEYAN', description: 'Hồ sơ sư phạm mẫu trên XUEYAN — học tiếng Trung qua chữ Hán, Pinyin và thực hành.' };
import {ProfileEditor} from "@/components/screens/ProfileScreens";
export default async function Page(){await requireWorkspace("teacher");return <ProfileEditor teacher/>;}
