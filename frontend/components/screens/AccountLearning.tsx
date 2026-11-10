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
 return <WorkspaceLayout live><PageTitle title={review?"Ôn tập SRS":`Chào ${account?.name??"bạn"}!`} description="Tiến độ được lưu theo tài khoản của bạn."/><Feedback loading={loading} error={error} retry={()=>void load()}/>{!loading&&!error&&data&&<><div className={s.dashboardTop}><Card><h2>Ôn hôm nay</h2><p className={s.metric}>{data.due}</p><p>Từ đã học đến hạn ôn tập</p>{data.due>0?<Link className={s.button} href="/review/study">Bắt đầu ôn tập</Link>:<><p>{data.learned>0?"Hiện không có từ đến hạn. Bạn có thể học thêm từ mới.":"Bạn chưa học từ nào. Chọn một cấp HSK để bắt đầu."}</p><Link className={s.button} href="/vocabulary">Học từ mới theo HSK</Link></>}</Card><Card><h2>Mục tiêu từ mới</h2><p className={s.metric}>{data.firstReviewsToday}/{data.goal}</p><Progress value={Math.min(100,data.firstReviewsToday/data.goal*100)} label="Mục tiêu học từ mới hôm nay"/><Link className={s.button} href="/vocabulary">Chọn cấp HSK</Link></Card><Card><h2>Chuỗi học liên tục</h2><p className={s.metric}>{data.streak} ngày</p><p>Đã ôn {data.reviewedToday} từ hôm nay.</p></Card></div><Card><h2>Từ đã có lượt học: {data.learned}</h2><p>Gồm cả những từ còn quên hoặc khó, chưa đồng nghĩa đã thành thạo.</p><Link className={s.button} href="/progress">Xem tiến độ</Link></Card><p className={s.note}>Thống kê ngày theo giờ Việt Nam (UTC+7).</p></>}</WorkspaceLayout>;
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
