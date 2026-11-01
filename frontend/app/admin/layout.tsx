import {requireWorkspace} from "@/lib/require-workspace";
import {WorkspaceGate} from "@/components/ui/WorkspaceAccess";
import {AdminShell} from "@/components/admin/AdminWorkspace";
export default async function Layout({children}:{children:React.ReactNode}){await requireWorkspace("admin");return <WorkspaceGate role="admin"><AdminShell>{children}</AdminShell></WorkspaceGate>;}
