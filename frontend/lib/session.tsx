"use client";
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {usePathname} from "next/navigation";
import {api,ApiFailure,type Account} from "./api-client";
type Session={account:Account|null;loading:boolean;error:string;refresh:()=>Promise<void>;clear:()=>void};
const Context=createContext<Session>({account:null,loading:true,error:"",refresh:async()=>{},clear:()=>{}});
export function SessionProvider({children}:{children:ReactNode}){
 const [account,setAccount]=useState<Account|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const generation=useRef(0);const pathname=usePathname();
 const refresh=useCallback(async()=>{const request=++generation.current;try{const result=await api<Account|null>("auth/session");if(request===generation.current){setAccount(result);setError("");}}catch(e){if(request===generation.current){setError((e as Error).message);if(e instanceof ApiFailure&&e.status===401)setAccount(null);}}finally{if(request===generation.current)setLoading(false);}},[]);
 const clear=useCallback(()=>{generation.current++;setAccount(null);setLoading(false);setError("");},[]);
 useEffect(()=>{void Promise.resolve().then(refresh);},[refresh,pathname]);
 return <Context.Provider value={{account,loading,error,refresh,clear}}>{children}</Context.Provider>;
}
export function useAccount(){return useContext(Context);}
