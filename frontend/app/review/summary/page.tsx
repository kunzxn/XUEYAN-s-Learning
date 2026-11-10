import {requireWorkspace} from '@/lib/require-workspace';
import {AccountResults} from '@/components/screens/AccountLearning';
export default async function Page({searchParams}:{searchParams:Promise<{events?:string}>}){await requireWorkspace('learner');const {events}=await searchParams;return <AccountResults events={events}/>;}
