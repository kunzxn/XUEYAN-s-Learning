import { NextRequest } from "next/server";

export const runtime = "nodejs";
const allowed = /^(auth\/(login|logout|register|forgot-password|reset-password|refresh|me|session|google|google\/config)|profile(\/avatar)?|library\/words(\/[0-9]+)?|catalog\/words|catalog\/levels(\/(1|2|3|4|5|6|7-9)\/words)?|admin\/(words|lessons|teachers|users|overview|levels)(\/[a-zA-Z0-9-]+){0,2}|learning\/(words|progress|due|reviews|overview|results|preferences|queue))$/;
async function proxy(request: NextRequest, { params }: { params: Promise<{path:string[]}> }) {
  const path=(await params).path.join("/");
  if(!allowed.test(path))return Response.json({error:"Không có API này."},{status:404});
  if(!["GET","HEAD"].includes(request.method) && request.headers.get("origin")!==request.nextUrl.origin)
    return Response.json({error:"Nguồn yêu cầu không hợp lệ."},{status:403});
  try {
    const base=process.env.XUEYAN_API_URL??"http://127.0.0.1:5108";
    const jar=new Map<string,string>();
    for(const key of ["xueyan_session","xueyan_refresh","xueyan_google_nonce"]){const value=request.cookies.get(key)?.value;if(value)jar.set(key,value);}
    const cookieHeader=()=>Array.from(jar).map(([key,value])=>`${key}=${value}`).join("; ");
    const body=["GET","HEAD"].includes(request.method)?undefined:await request.text();
    const execute=()=>fetch(`${base}/${path}${request.nextUrl.search}`,{
      method:request.method,headers:{"Content-Type":"application/json","X-Xueyan-Client":"web",cookie:cookieHeader(),
        ...(request.headers.get("authorization")?{Authorization:request.headers.get("authorization")!}:jar.has("xueyan_session")?{Authorization:`Bearer ${jar.get("xueyan_session")}`}:{})},
      body,cache:"no-store",signal:AbortSignal.timeout(20000),redirect:"error"
    });
    let upstream=await execute();
    const refreshedCookies:string[]=[];
    // Retry at most once. Never fall back from an explicit invalid bearer token.
    if(upstream.status===401&&jar.has("xueyan_refresh")&&!request.headers.has("authorization")&&!/^auth\/(login|register|logout|refresh|google|google\/config)$/.test(path)){
      const refresh=await fetch(`${base}/auth/refresh`,{method:"POST",headers:{"X-Xueyan-Client":"web",cookie:cookieHeader()},cache:"no-store",signal:AbortSignal.timeout(20000),redirect:"error"});
      if(refresh.ok){
        refreshedCookies.push(...refresh.headers.getSetCookie());
        for(const cookie of refreshedCookies){const entry=cookie.split(";")[0];const index=entry.indexOf("=");if(index>0)jar.set(entry.slice(0,index),entry.slice(index+1));}
        await upstream.body?.cancel();upstream=await execute();
      }
    }
    const headers=new Headers({"Content-Type":upstream.headers.get("Content-Type")??"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    for(const cookie of [...refreshedCookies,...upstream.headers.getSetCookie()])headers.append("Set-Cookie",cookie);
    return new Response(upstream.status===204?null:await upstream.arrayBuffer(),{status:upstream.status,headers});
  }catch{return Response.json({error:"Chưa kết nối được dịch vụ SQL Server. Hãy khởi chạy backend; thao tác chưa được lưu."},{status:503});}
}
export {proxy as GET,proxy as POST,proxy as PUT,proxy as DELETE};
