import {requireWorkspace} from '@/lib/require-workspace';
import {AccountOverview} from '@/components/screens/AccountLearning';
export default async function Page(){await requireWorkspace('learner');return <AccountOverview/>;}
