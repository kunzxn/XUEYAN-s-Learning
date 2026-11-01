import "server-only";
import {cache} from "react";
import {cookies,headers} from "next/headers";
import {redirect} from "next/navigation";
import {safeReturnTo} from "./account-routes";
import {roleHome,type WorkspaceRole} from "./workspace-roles";

export const requireWorkspace=cache(async(role:WorkspaceRole)=>{
 const jar=await cookies();const requestHeaders=await headers();
 const target=safeReturnTo(requestHeaders.get("x-xueyan-return-to")??undefined)??roleHome(role);
 const login=`/login?next=${encodeURIComponent(target)}`;
 const renewal=()=>redirect(jar.has("xueyan_refresh")?`/api/session/continue?next=${encodeURIComponent(target)}`:login);
 const token=jar.get("xueyan_session")?.value;if(!token)renewal();
 let response:Response;
 try{response=await fetch(`${process.env.XUEYAN_API_URL??"http://127.0.0.1:5108"}/access/${role}`,{headers:{Authorization:`Bearer ${token}`},cache:"no-store",signal:AbortSignal.timeout(10000),redirect:"error"});}
 catch{redirect("/access-denied?unavailable=1");}
 if(response.status===401)renewal();
 if(response.status===403)redirect(`/access-denied?space=${role}`);
 if(!response.ok)redirect("/access-denied?unavailable=1");
});
