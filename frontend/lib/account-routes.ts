import {roleHome,workspaceFor} from "./workspace-roles";
export function safeReturnTo(value?:string){
 if(!value||!value.startsWith("/")||value.startsWith("//")||/[\\\u0000-\u0020\u007f]/.test(value)||/^\/(login|register|account(?:\/|$)|api(?:\/|$))/.test(value))return undefined;
 return value;
}
export function accountDestination(role:string,returnTo?:string){const target=safeReturnTo(returnTo);const workspace=target?workspaceFor(target):null;return target&&(!workspace||workspace===role)?target:roleHome(role);}
