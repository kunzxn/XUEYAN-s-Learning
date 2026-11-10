"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";

import {api} from "@/lib/api-client";
import {useAccount} from "@/lib/session";
import {WorkspaceLayout} from "@/components/ui/Layouts";
import {BookOpen,BookMarked,GraduationCap,Search} from "lucide-react";
import {Button,Card,Input,PageTitle,s} from "@/components/ui/Primitives";
import type {CatalogWord} from "./HskScreens";
import l from "./learning.module.css";

type Learned=CatalogWord&{repetitions:number;lastReviewedAt:string;nextReviewAt:string};
type Overview={learned:number;due:number;reviewedToday:number;firstReviewsToday:number;goal:number;streak:number};
type Result=CatalogWord&{wordId:number;eventId:string;rating:number;durationMs:number;reviewedAt:string};
function useData<T>(path:string){
 const [data,setData]=useState<T>();const [error,setError]=useState("");const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);setError("");try{setData(await api<T>(path));}catch(e){setError((e as Error).message);}finally{setLoading(false);}},[path]);
 useEffect(()=>{void Promise.resolve().then(load);},[load]);return {data,error,loading,load};
}
function Feedback({loading,error,retry}:{loading:boolean;error:string;retry:()=>void}){return <>{loading&&<p role="status">Đang tải dữ liệu tài khoản…</p>}{error&&<Card><p role="alert">{error}</p><Button onClick={retry}>Thử lại</Button></Card>}</>;}
const WEEKDAYS=["CN","T2","T3","T4","T5","T6","T7"];
function WeekStamps({streak,studiedToday}:{streak:number;studiedToday:boolean}){
 const today=new Date();
 const days=Array.from({length:7},(_,i)=>{const back=6-i;const d=new Date(today);d.setDate(today.getDate()-back);const stamped=studiedToday?back<streak:back>=1&&back<=streak;return {label:back===0?"Nay":WEEKDAYS[d.getDay()],stamped,today:back===0};});
 return <ol className={l.week} aria-label={`Chuỗi học ${streak} ngày liên tục`}>{days.map((d,i)=><li key={i} className={l.day} data-today={d.today||undefined}><span className={l.stamp} data-on={d.stamped||undefined} style={{"--i":i} as React.CSSProperties} lang="zh-Hans" aria-hidden="true">{d.stamped?"记":""}</span><small>{d.label}</small></li>)}</ol>;
}
export function AccountOverview({review=false}:{review?:boolean}){
 const {data,error,loading,load}=useData<Overview>("learning/overview");const {account}=useAccount();
 const hour=new Date().getHours();const greet=hour<11?"Chào buổi sáng":hour<18?"Chào buổi chiều":"Chào buổi tối";
 return <WorkspaceLayout live><PageTitle title={review?"Ôn tập SRS":`${greet}, ${account?.name??"bạn"}`} description="Tiến độ được lưu theo tài khoản của bạn."/><Feedback loading={loading} error={error} retry={()=>void load()}/>{!loading&&!error&&data&&<>
  <div className={l.today}>
   <section className={l.focus} aria-labelledby="today-title"><span className={l.watermark} lang="zh-Hans" aria-hidden="true">学</span>
    <h2 id="today-title">{data.due>0?`${data.due} từ đến hạn ôn tập`:data.learned>0?"Hôm nay chưa có từ cần ôn":"Bắt đầu với cấp HSK đầu tiên"}</h2>
    <p>{data.due>0?"Ôn ngay khi từ còn trong trí nhớ để nhớ lâu hơn.":data.learned>0?"Bạn có thể học thêm từ mới để giữ nhịp học.":"Bạn chưa học từ nào. Chọn một cấp HSK để bắt đầu."}</p>
    <div className={l.focusActions}>{data.due>0?<Link className={l.primaryCta} href="/review/study">Bắt đầu ôn tập</Link>:<Link className={l.primaryCta} href="/vocabulary">Học từ mới theo HSK</Link>}{data.due>0&&<Link className={l.ghostCta} href="/vocabulary">Học từ mới</Link>}</div>
    <div className={l.goal}><div className={l.goalHead}><span>Từ mới hôm nay</span><strong>{data.firstReviewsToday}/{data.goal}</strong></div><div className={l.goalTrack} role="progressbar" aria-label="Mục tiêu học từ mới hôm nay" aria-valuemin={0} aria-valuemax={data.goal} aria-valuenow={Math.min(data.goal,data.firstReviewsToday)}><span style={{width:`${Math.min(100,data.firstReviewsToday/data.goal*100)}%`}}/></div></div>
   </section>
   <section className={l.streak} aria-labelledby="streak-title"><h2 id="streak-title">Chuỗi học <strong>{data.streak}</strong> ngày</h2><WeekStamps streak={data.streak} studiedToday={data.reviewedToday>0||data.firstReviewsToday>0}/><dl className={l.mini}><div><dt>Đã ôn hôm nay</dt><dd>{data.reviewedToday} từ</dd></div><div><dt>Đã có lượt học</dt><dd>{data.learned} từ</dd></div></dl></section>
  </div>
  <nav className={l.shortcuts} aria-label="Lối tắt học tập">
   <Link href="/review/study"><GraduationCap size={22} aria-hidden="true"/><span><strong>Ôn tập SRS</strong><small>Lặp lại ngắt quãng các từ đến hạn</small></span></Link>
   <Link href="/vocabulary"><BookOpen size={22} aria-hidden="true"/><span><strong>Lộ trình HSK</strong><small>Học từ mới theo từng cấp độ</small></span></Link>
   <Link href="/dictionary"><Search size={22} aria-hidden="true"/><span><strong>Từ điển</strong><small>Tra chữ Hán, Pinyin, Hán–Việt</small></span></Link>
   <Link href="/collection"><BookMarked size={22} aria-hidden="true"/><span><strong>Sổ từ</strong><small>Từ bạn đã lưu để xem lại</small></span></Link>
  </nav>
  <p className={s.note}>Thống kê ngày theo giờ Việt Nam (UTC+7). “Đã có lượt học” gồm cả từ còn quên hoặc khó, chưa đồng nghĩa đã thành thạo.</p></>}</WorkspaceLayout>;
}
export function AccountProgress(){
 const {data,error,loading,load}=useData<Learned[]>("learning/progress");const [query,setQuery]=useState("");
 const [now]=useState(()=>Date.now());
 const rows=(data??[]).filter(w=>`${w.simplified} ${w.pinyin} ${w.meaningVi??w.meaningEn??""}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <WorkspaceLayout live><PageTitle title="Tiến độ học tập" description="Lịch sử từ đã học và lần ôn tiếp theo của tài khoản."/><Feedback loading={loading} error={error} retry={()=>void load()}/>{!loading&&!error&&data&&<>
  <div className={l.progressHead}><p><strong>{data.length}</strong> từ đã có lượt học</p><Link className={l.primaryCtaInk} href="/vocabulary">Tiếp tục học HSK</Link></div>
  <Input label="Tìm từ đã học" value={query} onChange={e=>setQuery(e.target.value)}/>
  {data.length===0?<Card><p>Bạn chưa học từ nào. Chọn cấp HSK để bắt đầu.</p></Card>:<ul className={l.wordGrid}>{rows.map((w,i)=>{const next=new Date(w.nextReviewAt+(/Z$/.test(w.nextReviewAt)?"":"Z"));const due=next.getTime()<=now;return <li key={w.id} className={l.wordTile} style={{"--i":Math.min(i,12)} as React.CSSProperties}><span className={l.tileHan} lang="zh-Hans">{w.simplified}</span><div className={l.tileBody}><span className={l.tilePinyin}>{w.pinyin}</span><p>{w.meaningVi??w.meaningEn}</p><small>{w.repetitions} lượt học</small></div><span className={l.tileDue} data-due={due||undefined}>{due?"Đến hạn ôn":`Ôn ${next.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit"})}`}</span></li>;})}{rows.length===0&&<li className={l.noMatch}>Không có từ phù hợp.</li>}</ul>}
 </>}</WorkspaceLayout>;
}

export {AccountStudy} from "./AccountStudy";
const RATING_LABELS=["","Quên","Khó","Nhớ","Dễ"];
export function AccountResults({events}:{events?:string}){
 const {data,error,loading,load}=useData<Result[]>(`learning/results?events=${encodeURIComponent(events??"")}`);
 const counts=[1,2,3,4].map(r=>data?.filter(w=>w.rating===r).length??0);
 const total=data?.length??0;const remembered=counts[2]+counts[3];
 return <WorkspaceLayout live><PageTitle title="Kết quả đã lưu" description="Kết quả được đọc lại từ tài khoản trên hệ thống."/>{!events?<Card><p>Chưa có phiên học được chọn.</p><Link href="/progress">Xem tiến độ đã lưu</Link></Card>:<><Feedback loading={loading} error={error} retry={()=>void load()}/>{!loading&&!error&&data&&<>
  <section className={l.result} aria-labelledby="result-title"><span className={l.resultSeal} lang="zh-Hans" aria-hidden="true">完</span>
   <h2 id="result-title">Hoàn thành {total} lượt học</h2>
   <p>{remembered} lượt bạn tự đánh giá là nhớ hoặc dễ · {Math.round(data.reduce((sum,w)=>sum+w.durationMs,0)/1000)} giây học. Đây là mức tự đánh giá ghi nhớ, không phải điểm kiểm tra.</p>
   {total>0&&<><div className={l.split} role="img" aria-label={counts.map((n,i)=>`${RATING_LABELS[i+1]} ${n}`).join(", ")}>{counts.map((n,i)=>n>0&&<span key={i} data-r={i+1} style={{flexGrow:n}}/>)}</div><ul className={l.legend}>{counts.map((n,i)=><li key={i} data-r={i+1}><i/>{RATING_LABELS[i+1]} <strong>{n}</strong></li>)}</ul></>}
  </section>
  <Card><ul className={l.resultList}>{data.map((w,i)=><li key={w.eventId} style={{"--i":Math.min(i,14)} as React.CSSProperties}><strong lang="zh-Hans">{w.simplified}</strong><span>{w.pinyin}</span><em data-r={w.rating}>{RATING_LABELS[w.rating]}</em></li>)}</ul></Card></>}</>}<div className={s.actions}><Link className={s.button} href="/dashboard">Về Dashboard</Link><Link className={`${s.button} ${s.secondary}`} href="/progress">Xem tiến độ</Link></div></WorkspaceLayout>;
}
