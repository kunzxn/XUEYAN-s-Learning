"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCw } from "lucide-react";
import { FocusLayout } from "@/components/ui/Layouts";
import { ActionLink, AudioButton, Badge, Button, Card, Dialog, EmptyState, s } from "@/components/ui/Primitives";
import { demoWords } from "@/lib/ui-demo-data";
import { finishSession, readSession, serverSession, subscribeSession, weakWordIds, type StudyAnswer } from "@/lib/study-session";
import { WordList } from "./LearningScreens";

export function StudySession({ learn = false, initialState = "default", wordId, limit = 6 }: { learn?: boolean; initialState?: string; wordId?: string; limit?: number }) {
  const router = useRouter();
  const [index, setIndex] = useState(0), [flipped, setFlipped] = useState(learn), [pinyin, setPinyin] = useState(learn), [marked, setMarked] = useState(false), [exit, setExit] = useState(false), [syncError, setSyncError] = useState(initialState === "error");
  const [answers, setAnswers] = useState<StudyAnswer[]>([]);
  const words = wordId ? demoWords.filter(w => w.id === wordId) : demoWords.slice(0, limit);
  const word = words[index];
  const finish = useCallback((results: StudyAnswer[]) => {
    const id = finishSession(learn ? "learn" : "review", words.map(w => w.id), results);
    router.push(`/review/summary?source=${learn ? "lesson-1" : "review"}&run=${id}`);
  }, [learn, words, router]);
  const advance = useCallback((rating?: number) => {
    if (!word || (!learn && !flipped)) return;
    const next = [...answers, { wordId: word.id, ...(rating ? { rating } : {}) }];
    if (index === words.length - 1) finish(next);
    else { setAnswers(next); setIndex(index + 1); setFlipped(learn); setMarked(false); }
  }, [answers, finish, flipped, index, learn, word, words.length]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (exit || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || document.querySelector("dialog[open]") || target?.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]')) return;
      if (event.code === "Space") { if (target?.closest("button,a")) return; event.preventDefault(); setFlipped(v => !v); }
      if (!learn && flipped && /^[1-4]$/.test(event.key)) { event.preventDefault(); advance(Number(event.key)); }
      if (learn && event.key === "ArrowRight") { event.preventDefault(); advance(); }
    };
    document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key);
  }, [advance, exit, flipped, learn]);
  if (!word) return <FocusLayout title="Phiên học"><EmptyState title="Không có từ trong phiên" description="Hãy chọn lại bộ từ." href="/review"/></FocusLayout>;
  return <FocusLayout title={learn ? "Học từ vựng mới" : "Ôn tập hôm nay"} progress={answers.length / words.length * 100} onExit={() => setExit(true)}>
    <Badge>{index + 1}/{words.length} từ mẫu</Badge>
    {syncError && <Card><p role="alert">Mô phỏng lỗi đồng bộ. Phiên mẫu vẫn học tiếp được; kết quả này không gửi lên server.</p><Button secondary onClick={() => setSyncError(false)}>Đóng mô phỏng lỗi</Button></Card>}
    <Card className={`${s.flashcard} ${s.studyCard}`}>
      <div className={s.between}><Badge>{word.level}</Badge><Button secondary aria-pressed={marked} onClick={() => setMarked(!marked)}>{marked ? "Đã đánh dấu trong phiên" : "Đánh dấu"}</Button></div>
      <div className={`${s.rice} ${s.studyAnswer}`}><p className={s.word} lang="zh-Hans">{word.han}</p>{pinyin && <p className={s.pinyin}>{word.pinyin}</p>}</div>
      <div className={s.between}><Button secondary aria-pressed={pinyin} onClick={() => setPinyin(!pinyin)}>{pinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}</Button><AudioButton text={word.han}/></div>
      {flipped && <div className={`${s.studyAnswer} ${s.center}`}><Badge>Âm Hán–Việt: {word.hv}</Badge><h2>{word.meaning}</h2><p lang="zh-Hans" className={`${s.han} ${s.pinyin}`}>{word.example}</p>{pinyin && <p>{word.examplePinyin}</p>}<p className={s.muted}>{word.translation}</p></div>}
    </Card>
    <div className={s.studyControls} aria-label="Điều khiển học từ">
      {!flipped ? <Button className={s.full} onClick={() => setFlipped(true)}><Eye size={18}/>Hiện đáp án · Space</Button> : learn ? <div className={s.actions}><ActionLink href={`/lessons/1/practice?word=${word.id}`} secondary>Luyện từ này</ActionLink><Button onClick={() => advance()}>Từ tiếp theo →</Button></div> : <div className={s.ratings}>{["Quên", "Khó", "Nhớ", "Dễ"].map((v, i) => <Button key={v} secondary onClick={() => advance(i + 1)}>{v} · {i + 1}</Button>)}</div>}
    </div>
    <p className={s.muted}>{learn ? "Phím →: từ tiếp theo." : "Phím 1–4: đánh giá khi đáp án mở."} Space lật thẻ khi focus ở nội dung; trên nút dùng Enter/Space để kích hoạt nút. Kết quả chỉ trong tab này, chưa lưu lịch SRS lên server.</p>
    <Dialog open={exit} onClose={() => setExit(false)} title="Kết thúc phiên học mẫu?"><p>Đã học {answers.length}/{words.length} từ. Từ đang mở chưa được tính nếu chưa bấm tiếp hoặc đánh giá.</p><div className={s.actions}><Button secondary onClick={() => setExit(false)}>Học tiếp</Button><Button onClick={() => finish(answers)}>Xem tổng kết phiên</Button><ActionLink href={learn ? "/lessons/1" : wordId ? `/collection/${wordId}` : "/review"} secondary>Thoát về trang trước</ActionLink></div></Dialog>
  </FocusLayout>;
}

export function PracticeScreen({ wordId }: { wordId?: string }) {
  const router = useRouter();
  const words = wordId ? demoWords.filter(w => w.id === wordId) : demoWords;
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState<string | null>(null), [answers, setAnswers] = useState<StudyAnswer[]>([]);
  const w = words[index];
  if (!w) return <FocusLayout title="Luyện tập"><EmptyState title="Không tìm thấy từ" description="Chọn lại từ cần luyện." href="/lessons/1"/></FocusLayout>;
  const current = answer === null ? answers : [...answers, { wordId: w.id, correct: answer === w.meaning }];
  const points = current.filter(a => a.correct).length * 10;
  return <FocusLayout title="Luyện tập từ vựng" exitHref="/lessons/1" progress={current.length / words.length * 100}>
    <Card className={`${s.flashcard} ${s.studyCard} ${s.center}`}><Badge>Câu {index + 1}/{words.length}</Badge><p className={s.word} lang="zh-Hans">{w.han}</p><p className={s.pinyin}>{w.pinyin}</p><AudioButton text={w.han}/><h2>Chọn nghĩa tiếng Việt chính xác</h2><div className={s.two}>{[w.meaning, ...demoWords.filter(a => a.id !== w.id).slice(0, 3).map(a => a.meaning)].sort().map(v => <Button secondary key={v} disabled={answer !== null} onClick={() => setAnswer(v)}>{v}</Button>)}</div>{answer !== null && <div className={s.studyAnswer} role="status"><Badge tone={answer === w.meaning ? "success" : "danger"}>{answer === w.meaning ? "Chính xác! +10 điểm" : "Chưa đúng. Hãy xem lại từ này."}</Badge><p>Đáp án: {w.meaning} · {w.pinyin}</p></div>}<p className={s.muted}>Điểm trong phiên: {points}</p></Card>
    {answer !== null && <div className={s.studyControls}><Button className={s.full} onClick={() => { if (index < words.length - 1) { setAnswers(current); setIndex(index + 1); setAnswer(null); } else { const id = finishSession("practice", words.map(w => w.id), current); router.push(`/review/summary?source=lesson-1&run=${id}`); } }}>Tiếp tục →</Button></div>}
  </FocusLayout>;
}

export function SessionSummary({ source = "review", runId }: { source?: string; count?: number; wordId?: string; runId?: string }) {
  const result = useSyncExternalStore(subscribeSession, () => runId ? readSession(runId) : null, serverSession);
  const lesson = result ? result.mode !== "review" : source === "lesson-1";
  if (!result) return <FocusLayout title="Tổng kết buổi học" exitHref={lesson ? "/lessons/1" : "/review"}><EmptyState title="Chưa có kết quả phiên học" description="Hãy hoàn thành hoặc kết thúc một phiên để xem kết quả. Dữ liệu mẫu không được thay bằng điểm giả; kết quả chỉ giữ trong tab này khi trình duyệt cho phép." href={lesson ? "/lessons/1/learn" : "/review"} action="Chọn phiên học"/></FocusLayout>;
  const done = result.answers.length, total = result.words.length, weak = weakWordIds(result);
  const retry = result.words.length === 1 ? `?word=${result.words[0]}` : `?limit=${total}`;
  return <FocusLayout title="Tổng kết buổi học" progress={done / total * 100} exitHref={lesson ? "/lessons/1" : "/review"}><div className={`${s.center} ${s.stack}`}><h2>{done === total ? "Đã hoàn thành phiên mẫu" : "Phiên đã kết thúc sớm"}</h2><p className={s.note}>Kết quả thao tác trong tab này; chưa đồng bộ với tài khoản hoặc lịch SRS trên server.</p><div className={s.grid}><Card><p className={s.metric}>{done}/{total}</p><p>{result.mode === "practice" ? "Câu đã trả lời" : "Từ đã học"}</p></Card><Card><p className={s.metric}>{Math.round(done / total * 100)}%</p><p>Tiến độ của phiên</p></Card><Card><p className={s.metric}>{result.mode === "learn" ? "—" : result.mode === "practice" ? result.answers.filter(a => a.correct).length * 10 : weak.length}</p><p>{result.mode === "learn" ? "Chưa đánh giá ghi nhớ" : result.mode === "practice" ? "Điểm trả lời đúng" : "Từ cần củng cố"}</p></Card></div><Card><h2>Từ vựng cần củng cố thêm</h2>{weak.length ? <WordList words={demoWords.filter(w => weak.includes(w.id))}/> : <p>{result.mode === "learn" ? "Phiên học từ mới chưa đánh giá khả năng nhớ. Hãy luyện tập để kiểm tra." : done ? "Không có từ trả lời sai hoặc đánh giá Quên/Khó trong phần đã làm." : "Bạn chưa đánh giá từ nào trong phiên này."}</p>}</Card><div className={s.actions}><ActionLink href="/dashboard">Về Dashboard</ActionLink><ActionLink href={result.mode === "practice" ? `/lessons/1/practice${total === 1 ? retry : ""}` : result.mode === "learn" ? "/lessons/1/learn" : `/review/study${retry}`} secondary><RotateCw size={18}/>Ôn lại bộ mẫu</ActionLink></div></div></FocusLayout>;
}
