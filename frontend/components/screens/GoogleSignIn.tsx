"use client";
import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {accountDestination} from "@/lib/account-routes";
import {useAccount} from "@/lib/session";
import {api} from "@/lib/api-client";
import {Button,s} from "@/components/ui/Primitives";
type Identity={initialize:(options:{client_id:string;nonce:string;callback:(response:{credential:string})=>void})=>void;renderButton:(element:HTMLElement,options:{theme:string;size:string;text:string;width:number})=>void};
declare global {interface Window {google?:{accounts:{id:Identity}}}}
let library:Promise<void>|undefined;
type GoogleConfig={enabled:boolean;clientId?:string;nonce?:string};
let configQueue:Promise<void>=Promise.resolve();
function loadConfig(){
 // Serialize even cancelled effects: their Set-Cookie response still affects the browser.
 const request=configQueue.then(()=>api<GoogleConfig>("auth/google/config"));
 configQueue=request.then(()=>undefined,()=>undefined);
 return request;
}
function loadGoogle(){return library??=new Promise<void>((resolve,reject)=>{if(window.google){resolve();return;}const script=document.createElement("script");script.src="https://accounts.google.com/gsi/client";script.async=true;script.onload=()=>resolve();script.onerror=()=>{script.remove();library=undefined;reject(new Error("Không tải được Google. Bạn có thể đăng nhập bằng email."));};document.head.append(script);});}
export function GoogleSignIn({returnTo}:{returnTo?:string}){
 const {refresh}=useAccount();const target=useRef<HTMLDivElement>(null);const router=useRouter();const [available,setAvailable]=useState<boolean|null>(null);const [message,setMessage]=useState("Đang kiểm tra Google…");const [retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;async function setup(){try{const config=await loadConfig();if(!active)return;setAvailable(config.enabled);if(!config.enabled){setMessage("Google chưa được cấu hình.");return;}await loadGoogle();if(!active||!target.current||!window.google)return;window.google.accounts.id.initialize({client_id:config.clientId!,nonce:config.nonce!,callback:async({credential})=>{if(!active)return;setMessage("Đang đăng nhập…");try{const result=await api<{role:string}>("auth/google",{method:"POST",body:JSON.stringify({credential})});await refresh();router.push(accountDestination(result.role,returnTo));}catch(e){if(active)setMessage((e as Error).message);}}});target.current.replaceChildren();window.google.accounts.id.renderButton(target.current,{theme:"outline",size:"large",text:"continue_with",width:260});setMessage("");}catch(e){if(active)setMessage((e as Error).message);}}void setup();return()=>{active=false;};},[router,retry,returnTo,refresh]);
 return <div><div ref={target}/>{available===false&&<Button secondary disabled>Tiếp tục với Google</Button>}{message&&<p className={s.note} role="status">{message}</p>}{message&&!message.startsWith("Đang")&&available!==false&&<Button secondary onClick={()=>setRetry(retry+1)}>Thử lại Google</Button>}</div>;
}
