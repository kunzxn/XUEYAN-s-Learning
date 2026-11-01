import {NextRequest,NextResponse} from "next/server";
import {safeReturnTo} from "@/lib/account-routes";
export async function GET(request:NextRequest){
 const target=safeReturnTo(request.nextUrl.searchParams.get("next")??undefined)??"/profile";
 const login=new URL(`/login?next=${encodeURIComponent(target)}`,request.url);
 const refresh=request.cookies.get("xueyan_refresh")?.value;
 if(!refresh)return NextResponse.redirect(login,303);
 try{
  const result=await fetch(`${process.env.XUEYAN_API_URL??"http://127.0.0.1:5108"}/auth/refresh`,{method:"POST",headers:{"X-Xueyan-Client":"web",cookie:`xueyan_refresh=${refresh}`},cache:"no-store",signal:AbortSignal.timeout(10000),redirect:"error"});
  if(!result.ok){if(result.status!==401)return NextResponse.redirect(new URL("/access-denied?unavailable=1",request.url),303);return NextResponse.redirect(login,303);}
  const response=NextResponse.redirect(new URL(target,request.url),303);response.headers.set("Cache-Control","no-store");
  for(const cookie of result.headers.getSetCookie())response.headers.append("Set-Cookie",cookie);
  return response;
 }catch{return NextResponse.redirect(new URL("/access-denied?unavailable=1",request.url),303);}
}
