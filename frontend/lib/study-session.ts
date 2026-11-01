import { demoWords } from "./ui-demo-data";

export type StudyAnswer = { wordId: string; rating?: number; correct?: boolean };
export type StudyResult = { version: 1; id: string; mode: "learn" | "review" | "practice"; words: string[]; answers: StudyAnswer[]; finishedAt: string };
const prefix = "xueyan-preview-session-v1:";
const memory = new Map<string, StudyResult>();
const listeners = new Set<() => void>();
let last: StudyResult | null = null;
export function validateResult(value: unknown): StudyResult | null {
  if (!value || typeof value !== "object") return null;
  const r = value as StudyResult;
  if (r.version !== 1 || typeof r.id !== "string" || !["learn", "review", "practice"].includes(r.mode) || !Array.isArray(r.words) || !r.words.length || r.words.length > demoWords.length || !r.words.every(id => demoWords.some(w => w.id === id)) || new Set(r.words).size !== r.words.length || !Array.isArray(r.answers) || r.answers.length > r.words.length || new Set(r.answers.map(a => a?.wordId)).size !== r.answers.length || typeof r.finishedAt !== "string") return null;
  if (!r.answers.every(a => a && r.words.includes(a.wordId) && (r.mode === "learn" || (r.mode === "practice" ? typeof a.correct === "boolean" : Number.isInteger(a.rating) && a.rating! >= 1 && a.rating! <= 4)))) return null;
  return r;
}
export function finishSession(mode: StudyResult["mode"], words: string[], answers: StudyAnswer[]) {
  const result: StudyResult = { version: 1, id: crypto.randomUUID(), mode, words, answers, finishedAt: new Date().toISOString() };
  memory.set(result.id, result); last = result;
  try { sessionStorage.setItem(prefix + result.id, JSON.stringify(result)); sessionStorage.setItem(prefix + "latest", JSON.stringify(result)); } catch { /* In-memory results remain available until the tab reloads. */ }
  listeners.forEach(listener => listener());
  return result.id;
}
export function readSession(id?: string): StudyResult | null {
  if (typeof window === "undefined") return null;
  if (id ? memory.has(id) : last) return id ? memory.get(id)! : last;
  try {
    const raw = sessionStorage.getItem(prefix + (id ?? "latest"));
    const result = raw ? validateResult(JSON.parse(raw)) : null;
    if (result && (!id || result.id === id)) { memory.set(result.id, result); if (!id) last = result; return result; }
  } catch { /* Missing, old or corrupt preview results do not crash a page. */ }
  return null;
}
export function subscribeSession(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export const serverSession = () => null;
export function weakWordIds(result: StudyResult | null) { return result?.answers.filter(a => result.mode === "practice" ? !a.correct : result.mode === "review" && a.rating! <= 2).map(a => a.wordId) ?? []; }
