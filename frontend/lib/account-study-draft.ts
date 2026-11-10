export type StudyDraft={version:1;ids:number[];index:number;events:string[];flipped:boolean;pending:{id:string;rating:number;durationMs:number}|null;page:number};
const uuid=/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
export function validateStudyDraft(value:unknown):StudyDraft|null{
 if(!value||typeof value!=="object")return null;const d=value as StudyDraft;
 if(d.version!==1||!Array.isArray(d.ids)||d.ids.length<1||d.ids.length>20||!d.ids.every(id=>Number.isSafeInteger(id)&&id>0)||new Set(d.ids).size!==d.ids.length||!Number.isInteger(d.index)||d.index<0||d.index>d.ids.length||!Array.isArray(d.events)||d.events.length!==d.index||!d.events.every(id=>typeof id==="string"&&uuid.test(id))||new Set(d.events).size!==d.events.length||typeof d.flipped!=="boolean"||!Number.isInteger(d.page)||d.page<1)return null;
 if(d.pending!==null&&(typeof d.pending!=="object"||!d.pending||typeof d.pending.id!=="string"||!uuid.test(d.pending.id)||!Number.isInteger(d.pending.rating)||d.pending.rating<1||d.pending.rating>4||!Number.isInteger(d.pending.durationMs)||d.pending.durationMs<0||d.pending.durationMs>3600000))return null;
 return d;
}
export function studyDraftKey(userId:string,mode:string){return `xueyan-account-study-v1:${userId}:${mode}`;}
export function readStudyDraft(key:string):{draft:StudyDraft|null;message:string}{try{const raw=localStorage.getItem(key);if(!raw)return {draft:null,message:""};const draft=validateStudyDraft(JSON.parse(raw));return {draft,message:draft?"Đã khôi phục phiên trên thiết bị; kết quả học được xác minh lại từ hệ thống.":"Bản nháp cũ không hợp lệ. Phiên mới dùng dữ liệu hệ thống."};}catch{return {draft:null,message:"Không đọc được bản nháp trên thiết bị. Tiến độ đã lưu trên hệ thống không bị mất."};}}
export function writeStudyDraft(key:string,draft:StudyDraft){try{localStorage.setItem(key,JSON.stringify(draft));return true;}catch{return false;}}
