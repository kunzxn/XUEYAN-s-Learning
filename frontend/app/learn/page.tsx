import {requireWorkspace} from '@/lib/require-workspace';
import {AccountStudy} from '@/components/screens/AccountLearning';
import {notFound} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<{level?:string}>}){await requireWorkspace('learner');const {level}=await searchParams;if(level&&!['1','2','3','4','5','6','7-9'].includes(level))notFound();return <AccountStudy key={level??'all'} level={level}/>;}
