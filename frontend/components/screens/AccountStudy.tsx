"use client";
import Link from "next/link";
import {useCallback,useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/lib/api-client";
import {useAccount} from "@/lib/session";
import {readStudyDraft,writeStudyDraft,studyDraftKey,type StudyDraft} from "@/lib/account-study-draft";
import {WorkspaceLayout} from "@/components/ui/Layouts";
import {AudioButton,Button,Card,PageTitle,Progress,s} from "@/components/ui/Primitives";
import type {CatalogWord,WordPage} from "./HskScreens";
import type {Preferences} from "./AccountPreferences";
import c from "./connected.module.css";
export function AccountStudy({level,review=false}:{level?:string;review?:boolean}){
 const {account}=useAccount();const router=useRouter();const userId=account?.userId;
 const key=studyDraftKey(userId??"pending",review?"review":`learn-${level??"all"}`);
 const [words,setWords]=useState<CatalogWord[]>([]);const [draft,setDraft]=useState<StudyDraft>();const [preferences,setPreferences]=useState<Preferences>();const [error,setError]=useState("");const [notice,setNotice]=useState("");const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [page,setPage]=useState(1);const [more,setMore]=useState(false);
 const hydrated=useRef(false);const lock=useRef(false);const started=useRef(0);const controls=useRef<HTMLDivElement>(null);
 const load=useCallback(async()=>{
  if(!userId)return;setLoading(true);setError("");hydrated.current=false;
  try{
   const prefs=await api<Preferences>("learning/preferences");setPreferences(prefs);
   const saved=readStudyDraft(key);setNotice(saved.message);
   if(saved.draft){
    const d=saved.draft;const queue=await api<CatalogWord[]>(`learning/queue?ids=${d.ids.join(',')}`);
    if(d.events.length){const results=await api<{eventId:string;wordId:number}[]>(`learning/results?events=${d.events.join(',')}`);if(results.some(row=>d.ids[d.events.indexOf(row.eventId)]!==row.wordId))throw new Error("Bản nháp không khớp lịch sử tài khoản. Hãy bắt đầu phiên mới.");}
    setWords(d.ids.map(id=>queue.find(w=>w.id===id)!));setDraft(d);setPage(d.page);setMore(false);
   }else{
    const learned=await api<{id:number}[]>("learning/progress");const seen=new Set(learned.map(w=>w.id));let queue:CatalogWord[]=[];
    if(review){queue=(await api<CatalogWord[]>("learning/due")).slice(0,20);setMore(false);}
    else if(level){const batch=await api<WordPage>(`catalog/levels/${level}/words?page=${page}`);queue=batch.items.filter(w=>!seen.has(w.id)).slice(0,20);setMore(page*batch.pageSize<batch.total);}
    else{queue=(await api<CatalogWord[]>("learning/words")).filter(w=>!seen.has(w.id)).slice(0,20);}
    setWords(queue);setDraft({version:1,ids:queue.map(w=>w.id),index:0,events:[],flipped:false,pending:null,page});
   }
   hydrated.current=true;
  }catch(e){setError((e as Error).message);}finally{setLoading(false);}
 },[userId,key,level,review,page]);
 useEffect(()=>{void Promise.resolve().then(load);},[load]);
 useEffect(()=>{if(!loading&&hydrated.current&&draft?.ids.length&&!writeStudyDraft(key,draft))setNotice("Không lưu được bản nháp trên thiết bị. Chỉ các lượt đã gửi thành công mới được giữ trên hệ thống.");},[loading,key,draft]);
 const word=draft?words[draft.index]:undefined;
 useEffect(()=>{if(!loading){started.current=Date.now();controls.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();}},[loading,draft?.index,draft?.flipped]);
 useEffect(()=>{if(loading||!word||!preferences?.autoplay||!("speechSynthesis" in window))return;const utterance=new SpeechSynthesisUtterance(word.simplified);utterance.lang="zh-CN";window.speechSynthesis.speak(utterance);return()=>window.speechSynthesis.cancel();},[loading,word,preferences?.autoplay]);
 function persist(next:StudyDraft){setDraft(next);if(!writeStudyDraft(key,next))setNotice("Không lưu được bản nháp trên thiết bị. Tiến độ đã gửi thành công vẫn ở trên hệ thống.");}
 async function rate(rating:number){
  if(!draft||!word||lock.current)return;lock.current=true;setBusy(true);setError("");
  const attempt=draft.pending??{id:crypto.randomUUID(),rating,durationMs:Math.min(3600000,Math.max(0,Date.now()-started.current))};persist({...draft,pending:attempt});
  try{await api("learning/reviews",{method:"POST",body:JSON.stringify({wordId:word.id,rating:attempt.rating,eventId:attempt.id,durationMs:attempt.durationMs})});const next={...draft,index:draft.index+1,flipped:false,pending:null,events:[...draft.events,attempt.id]};persist(next);if(next.index===words.length)router.push(`/review/summary?events=${next.events.join(',')}`);}
  catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}
 }
 function restart(nextPage=page){try{localStorage.removeItem(key);}catch{setNotice("Không thể xóa bản nháp trên thiết bị. Hãy cho phép lưu trữ rồi thử lại.");return;}setDraft(undefined);setWords([]);setPage(nextPage);if(nextPage===page)void load();}
 return <WorkspaceLayout live><PageTitle title={review?"Phiên ôn tập":level?`Học HSK ${level}`:"Học từ mới"} description="Tiến độ lưu vào tài khoản; phiên đang học được khôi phục riêng trên thiết bị."/>{loading?<Card><p role="status" className={s.muted}>Đang tải thẻ từ hệ thống…</p></Card>:<>{error&&<Card><p role="alert">{error}</p><Button disabled={busy} onClick={()=>draft?.pending?void rate(draft.pending.rating):void load()}>Thử lại</Button><Button secondary disabled={busy} onClick={()=>restart()}>Bắt đầu phiên mới</Button></Card>}{!error&&word&&draft&&<><div className={s.between}><span className={s.muted}>Từ <strong>{draft.index+1}/{words.length}</strong> · Đã lưu {draft.events.length} lượt</span><Link href="/dashboard" className={`${s.button} ${s.ghost}`}>Về Dashboard</Link></div><Progress value={draft.index/words.length*100} label="Tiến độ phiên học"/><Card className={`${s.center} ${c.studyCard}`}><div className={`${s.rice} ${c.riceBox}`}><p className={s.word} lang="zh-Hans">{word.simplified}</p></div>{preferences?.showPinyin&&<p className={s.pinyin}>{word.pinyin}</p>}<AudioButton text={word.simplified}/>{draft.flipped&&<div className={c.answer}><h2 lang={word.meaningVi?"vi":"en"}>{word.meaningVi??word.meaningEn??"Chưa có nghĩa"}</h2>{!word.meaningVi&&<small className={s.muted}>Nghĩa gốc tiếng Anh</small>}{preferences?.showHanViet&&word.hanViet&&<p className={s.muted}>Hán–Việt: {word.hanViet}</p>}</div>}<div ref={controls} className={c.controls}>{draft.flipped?<div className={c.ratings}>{["Quên","Khó","Nhớ","Dễ"].map((label,i)=><Button key={label} disabled={busy} onClick={()=>void rate(i+1)}>{busy?"Đang lưu…":label}</Button>)}</div>:<Button onClick={()=>persist({...draft,flipped:true})}>Lật thẻ</Button>}</div></Card>{draft.events.length>0&&<Button secondary disabled={busy} onClick={()=>router.push(`/review/summary?events=${draft.events.join(',')}`)}>Xem kết quả đã lưu</Button>}</>}{!error&&!word&&<Card><h2>{draft?.events.length?"Đã hoàn thành phiên":review?"Không có từ đến hạn":"Không có từ mới trong nhóm này"}</h2>{!!draft?.events.length&&<Link className={s.button} href={`/review/summary?events=${draft.events.join(',')}`}>Xem kết quả đã lưu</Link>}{!review&&level&&more&&<Button onClick={()=>restart(page+1)}>Nhóm từ tiếp theo</Button>}<Button secondary onClick={()=>restart(draft?.page??page)}>Bắt đầu phiên mới</Button><Link className={s.button} href="/vocabulary">Chọn cấp HSK</Link></Card>}<p role="status">{notice}</p></>}</WorkspaceLayout>;
}
