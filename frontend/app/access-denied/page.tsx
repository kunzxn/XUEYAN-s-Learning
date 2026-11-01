import {AccessDenied} from "@/components/ui/WorkspaceAccess";
import type {WorkspaceRole} from "@/lib/workspace-roles";
export const metadata={title:"Quyền truy cập | XUEYAN"};
export default async function Page({searchParams}:{searchParams:Promise<{space?:string;unavailable?:string}>}){
 const params=await searchParams;const expected=["learner","teacher","admin"].includes(params.space??"")?params.space as WorkspaceRole:undefined;
 return <AccessDenied expected={expected} unavailable={params.unavailable==="1"}/>;
}
