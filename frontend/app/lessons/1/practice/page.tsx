import {requireWorkspace} from '@/lib/require-workspace';
import {redirect} from 'next/navigation';
export default async function Page(){await requireWorkspace('learner');redirect('/learn?level=1');}
