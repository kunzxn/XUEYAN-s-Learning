"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";

import {api} from "@/lib/api-client";
import {useAccount} from "@/lib/session";
import {WorkspaceLayout} from "@/components/ui/Layouts";
import {Button,Card,Input,PageTitle,Progress,s} from "@/components/ui/Primitives";
import type {CatalogWord} from "./HskScreens";

type Learned=CatalogWord&{repetitions:number;lastReviewedAt:string;nextReviewAt:string};
type Overview={learned:number;due:number;reviewedToday:number;firstReviewsToday:number;goal:number;streak:number};
type Result=CatalogWord&{wordId:number;eventId:string;rating:number;durationMs:number;reviewedAt:string};
function useData<T>(path:string){
 const [data,setData]=useState<T>();const [error,setError]=useState("");const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);setError("");try{setData(await api<T>(path));}catch(e){setError((e as Error).message);}finally{setLoading(false);}},[path]);
 useEffect(()=>{void Promise.resolve().then(load);},[load]);return {data,error,loading,load};
}
function Feedback({loading,error,retry}:{loading:boolean;error:string;retry:()=>void}){return <>{loading&&<p role="status">Đang tải dữ liệu tài khoản…</p>}{error&&<Card><p role="alert">{error}</p><Button onClick={retry}>Thử lại</Button></Card>}</>;}
export function AccountOverview({review=false}:{review?:boolean}){
 const {data,error,loading,load}=useData<Overview>("learning/overview");const {account}=useAccount();
 return <WorkspaceLayout live><PageTitle title={review?"Ôn tập SRS":`Chào ${account?.name??"bạn"}!`} description="Tiến độ được lưu theo tài khoản của bạn."/><Feedback loading={loading} error={error} retry={()=>void load()}/>{!loading&&!error&&data&&<><div className={s.today}><section className={s.todayMain} aria-labelledby="today-title"><h2 id="today-title">{data.due>0?`${data.due} từ đến hạn ôn tập`:data.learned>0?"Hôm nay chưa có từ cần ôn":"Bắt đầu với cấp HSK đầu tiên"}</h2><p>{data.due>0?"Ôn ngay khi từ còn trong trí nhớ để nhớ lâu hơn.":data.learned>0?"Bạn có thể học thêm từ mới để giữ nhịp học.":"Bạn chưa học từ nào. Chọn một cấp HSK để bắt đầu."}</p><div className={s.actions}>{data.due>0?<Link className={s.button} href="/review/study">Bắt đầu ôn tập</Link>:<Link className={s.button} href="/vocabulary">Học từ mới theo HSK</Link>}{data.due>0&&<Link className={`${s.button} ${s.ghost}`} href="/vocabulary">Học từ mới</Link>}</div></section><dl className={s.facts}><div><dt>Từ mới hôm nay</dt><dd><span>{data.firstReviewsToday}/{data.goal}</span><Progress value={Math.min(100,data.firstReviewsToday/data.goal*100)} label="Mục tiêu học từ mới hôm nay"/></dd></div><div><dt>Đã ôn hôm nay</dt><dd><span>{data.reviewedToday} từ</span></dd></div><div><dt>Chuỗi học liên tục</dt><dd><span>{data.streak} ngày</span></dd></div><div><dt>Từ đã có lượt học</dt><dd><span>{data.learned}</span><Link href="/progress">Xem tiến độ</Link></dd></div></dl></div><p className={s.note}>Thống kê ngày theo giờ Việt Nam (UTC+7). “Đã có lượt học” gồm cả từ còn quên hoặc khó, chưa đồng nghĩa đã thành thạo.</p></>}</WorkspaceLayout>;
}
export function AccountProgress(){
 const {data,error,loading,load}=useData<Learned[]>("learning/progress");const [query,setQuery]=useState("");
 return <WorkspaceLayout live><PageTitle title="Tiến độ học tập" description="Lịch sử từ đã học và lần ôn tiếp theo của tài khoản."/><Feedback loading={loading} error={error} retry={()=>void load()}/>{!loading&&!error&&data&&<><Card><p className={s.metric}>{data.length} từ đã có lượt học</p><Link className={s.button} href="/vocabulary">Tiếp tục học HSK</Link></Card><Input label="Tìm từ đã học" value={query} onChange={e=>setQuery(e.target.value)}/><Card>{data.length===0?<p>Bạn chưa học từ nào. Chọn cấp HSK để bắt đầu.</p>:<ul className={s.list}>{data.filter(w=>`${w.simplified} ${w.pinyin} ${w.meaningVi??w.meaningEn??""}`.toLowerCase().includes(query.trim().toLowerCase())).map(w=><li key={w.id}><strong lang="zh-Hans">{w.simplified}</strong> · {w.pinyin}<p>{w.meaningVi??w.meaningEn}</p><small>{w.repetitions} lượt học · Ôn tiếp: {new Date(w.nextReviewAt+(/Z$/.test(w.nextReviewAt)?"":"Z")).toLocaleString("vi-VN")}</small></li>)}</ul>}</Card></>}</WorkspaceLayout>;
}
export {AccountStudy} from "./AccountStudy";
export function AccountResults({events}:{events?:string}){
 const {data,error,loading,load}=useData<Result[]>(`learning/results?events=${encodeURIComponent(events??"")}`);
 return <WorkspaceLayout live><PageTitle title="Kết quả đã lưu" description="Kết quả được đọc lại từ tài khoản trên hệ thống."/>{!events?<Card><p>Chưa có phiên học được chọn.</p><Link href="/progress">Xem tiến độ đã lưu</Link></Card>:<><Feedback loading={loading} error={error} retry={()=>void load()}/>{!loading&&!error&&data&&<><div className={s.two}><Card><h2>{data.length} lượt đã lưu</h2><p>Thời gian: {Math.round(data.reduce((sum,w)=>sum+w.durationMs,0)/1000)} giây</p></Card><Card><h2>{data.filter(w=>w.rating>=3).length} lượt tự đánh giá nhớ/dễ</h2><p>Đây là mức tự đánh giá ghi nhớ, không phải điểm kiểm tra.</p></Card></div><Card><ul className={s.list}>{data.map(w=><li key={w.eventId}><strong lang="zh-Hans">{w.simplified}</strong> · {w.pinyin} · {["","Quên","Khó","Nhớ","Dễ"][w.rating]}</li>)}</ul></Card></>}</>}<div className={s.actions}><Link className={s.button} href="/dashboard">Về Dashboard</Link><Link className={`${s.button} ${s.secondary}`} href="/progress">Xem tiến độ</Link></div></WorkspaceLayout>;
}
