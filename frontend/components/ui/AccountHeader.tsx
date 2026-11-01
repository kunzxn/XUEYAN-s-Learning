"use client";
/* eslint-disable @next/next/no-img-element -- Private avatar image requires the browser's session cookie. */
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {BookOpen,Bookmark,LogOut,UserRound} from "lucide-react";
import {useState} from "react";
import {useAccount} from "@/lib/session";
import {api} from "@/lib/api-client";
import {Button,s} from "./Primitives";
import styles from "./account.module.css";
export function avatarUrl(version:string){return `/api/backend/profile/avatar?v=${encodeURIComponent(version)}`;}
export function Avatar({name,version,size=40,src}:{name:string;version?:string|null;size?:number;src?:string|null}){
 const image=src??(version?avatarUrl(version):null);
 return <span className={styles.avatar} style={{width:size,height:size,fontSize:size/2.6}}>{image?<img src={image} alt="" width={size} height={size}/>:Array.from(name.trim())[0]?.toUpperCase()||<UserRound aria-hidden="true"/>}</span>;
}
export function AccountAvatar({className}:{className?:string}){const {account}=useAccount();return <Link href="/profile" className={className??styles.avatarLink} aria-label="Trang cá nhân" title={account?`Hồ sơ của ${account.name}`:"Trang cá nhân"}><Avatar name={account?.name??""} version={account?.avatarVersion} size={36}/></Link>;}
export function AccountHeader(){
 const {account,clear}=useAccount();const router=useRouter();const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 return <><header className={styles.header}><Link href="/" className={styles.brand}><Image src="/xueyan-logo.jpg" alt="Logo XUEYAN" width={44} height={44}/><span>XUEYAN<small>Học cùng nhịp của bạn</small></span></Link><nav aria-label="Điều hướng tài khoản" className={styles.actions}>{account?.role==="admin"&&<Link href="/admin">Quản trị</Link>}{account?.role==="teacher"&&<Link href="/teacher">Giảng viên</Link>}<Link href="/dictionary" aria-label="Từ điển" title="Từ điển"><BookOpen size={21} aria-hidden="true"/></Link>{(!account||account.role==="learner")&&<Link href="/collection" aria-label="Sổ từ đã lưu" title="Sổ từ đã lưu"><Bookmark size={21} aria-hidden="true"/></Link>}<AccountAvatar/>{account&&<Button secondary disabled={busy} aria-label="Đăng xuất" title="Đăng xuất" onClick={async()=>{setBusy(true);try{await api("auth/logout",{method:"POST"});clear();router.replace("/login");}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><LogOut size={19} aria-hidden="true"/></Button>}</nav></header>{error&&<p role="alert" className={s.note}>{error}</p>}</>;
}
