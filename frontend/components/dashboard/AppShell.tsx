import {WorkspaceLayout} from "@/components/ui/Layouts";
import {PageTitle} from "@/components/ui/Primitives";
export default function AppShell({pageTitle,pageSubtitle,children}:{pageTitle:string;pageSubtitle?:string;children:React.ReactNode}){return <WorkspaceLayout><PageTitle title={pageTitle} description={pageSubtitle}/>{children}</WorkspaceLayout>;}
