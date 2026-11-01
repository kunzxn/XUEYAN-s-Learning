import {NextResponse,type NextRequest} from "next/server";
// Supply a trusted return path; authorization happens against the API before rendering.
export function proxy(request:NextRequest){
 const url=request.nextUrl.clone();url.searchParams.delete("_rsc");const headers=new Headers(request.headers);headers.set("x-xueyan-return-to",url.pathname+url.search);
 return NextResponse.next({request:{headers}});
}
export const config={matcher:["/teacher/:path*","/admin/:path*","/dashboard/:path*","/learn/:path*","/my-learning/:path*","/lessons/:path*","/review/:path*","/collection/:path*","/classes/:path*","/assignments/:path*","/progress/:path*","/onboarding/:path*","/notifications/:path*","/settings/:path*"]};
