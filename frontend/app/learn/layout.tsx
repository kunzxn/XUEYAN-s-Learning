import {requireWorkspace} from "@/lib/require-workspace";
import {WorkspaceGate} from "@/components/ui/WorkspaceAccess";
export default async function Layout({children}:{children:React.ReactNode}){await requireWorkspace("learner");return <WorkspaceGate role="learner">{children}</WorkspaceGate>;}
