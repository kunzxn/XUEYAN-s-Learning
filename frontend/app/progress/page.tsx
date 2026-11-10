import {requireWorkspace} from '@/lib/require-workspace';
import {AccountProgress} from '@/components/screens/AccountLearning';
export default async function Page(){await requireWorkspace('learner');return <AccountProgress/>;}
