export class ApiFailure extends Error {constructor(public status:number,message:string,public fields:Record<string,string[]>={}){super(message);}}
export async function api<T>(path:string,options?:RequestInit):Promise<T>{
  const response=await fetch(`/api/backend/${path}`,{...options,cache:"no-store",headers:{"Content-Type":"application/json",...options?.headers}});
  const data=response.status===204?null:await response.json();
  if(!response.ok)throw new ApiFailure(response.status,data?.error??"Không thể hoàn tất thao tác.",Object.fromEntries(Object.entries(data?.fields??{}).map(([key,value])=>[key.replace(/^\$\./,"").replace(/^./,c=>c.toLowerCase()),Array.isArray(value)?value.map(String):[String(value)]])));
  return data as T;
}
export type Account={userId:string;role:"admin"|"learner"|"teacher";name:string;avatarVersion?:string|null;showPinyin?:boolean;targetLevelCode?:string|null};
