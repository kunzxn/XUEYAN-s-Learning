import {requireWorkspace} from '@/lib/require-workspace';
import {AccountStudy} from '@/components/screens/AccountLearning';
export default async function Page(){await requireWorkspace('learner');return <AccountStudy review/>;}
