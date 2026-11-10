import {PasswordRecovery} from '@/components/screens/PasswordRecovery';
export const metadata={title:'Đặt lại mật khẩu | XUEYAN',referrer:'no-referrer' as const};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){const {token}=await searchParams;return <PasswordRecovery reset token={token}/>;}
