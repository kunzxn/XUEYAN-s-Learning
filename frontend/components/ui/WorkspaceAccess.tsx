"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {type ReactNode} from "react";
import {LockKeyhole} from "lucide-react";
import {useAccount} from "@/lib/session";
import {roleHome,roleLabels,type WorkspaceRole} from "@/lib/workspace-roles";
import {AccountHeader} from "./AccountHeader";
import {Button,Card,PageTitle,s} from "./Primitives";
export function WorkspaceGate({role,children}:{role:WorkspaceRole;children:ReactNode}){
 const {account,loading,error,refresh}=useAccount();const path=usePathname();
 if(loading)return <main className={s.content}><p role="status">Đang kiểm tra quyền truy cập…</p></main>;
 if(!account||account.role!==role)return <AccessDenied expected={role} returnTo={path} unavailable={!!error} retry={refresh}/>;
 return children;
}
export function AccessDenied({expected,unavailable=false,returnTo="/profile",retry}:{expected?:WorkspaceRole;unavailable?:boolean;returnTo?:string;retry?:()=>Promise<void>}){
 const {account,loading}=useAccount();
 return <div className={s.layout}><AccountHeader/><main className={s.public}><Card><LockKeyhole size={30} aria-hidden="true"/><PageTitle title={unavailable?"Chưa kiểm tra được quyền truy cập":"Trang này không thuộc vai trò của bạn"} description={unavailable?"Dịch vụ tạm thời chưa phản hồi. Hãy thử lại sau.":expected?`Không gian này dành cho ${roleLabels[expected].toLowerCase()}.`:"Vui lòng mở đúng không gian của tài khoản."}/>{account&&<p>Bạn đang đăng nhập với vai trò <strong>{roleLabels[account.role]}</strong>.</p>}<div className={s.actions}>{loading?<p role="status">Đang kiểm tra phiên…</p>:account?<Link href={roleHome(account.role)} className={s.button}>Về không gian của tôi</Link>:!unavailable&&<Link href={`/login?next=${encodeURIComponent(returnTo)}`} className={s.button}>Đăng nhập</Link>}{unavailable&&<Button secondary onClick={()=>retry?void retry():window.location.reload()}>Thử lại</Button>}<Link href="/" className={`${s.button} ${s.secondary}`}>Trang chủ</Link></div></Card></main></div>;
}
