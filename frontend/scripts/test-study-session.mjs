import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";

const source = fs.readFileSync(new URL("../lib/study-session.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function setup(denied = false, data = new Map()) {
  const storage = { getItem: key => { if (denied) throw Error("denied"); return data.get(key) ?? null; }, setItem: (key, value) => { if (denied) throw Error("quota"); data.set(key, value); } };
  const context = { exports: {}, window: {}, sessionStorage: storage, crypto, require: () => ({ demoWords: ["xuexi", "gongzuo", "pengyou"].map(id => ({ id })) }) };
  vm.runInNewContext(compiled, context);
  return { ...context.exports, data };
}
test("wrong word, partial progress and ratings survive a new module/reload", () => {
  const api = setup();
  const id = api.finishSession("review", ["xuexi", "gongzuo", "pengyou"], [{ wordId: "gongzuo", rating: 1 }]);
  const loaded = setup(false, api.data).readSession(id);
  assert.equal(loaded.answers.length, 1); assert.equal(loaded.words.length, 3);
  assert.equal(JSON.stringify(api.weakWordIds(loaded)), '["gongzuo"]');
});
test("practice correct and incorrect words are distinguished", () => {
  const api = setup(); const id = api.finishSession("practice", ["xuexi", "gongzuo"], [{ wordId: "xuexi", correct: true }, { wordId: "gongzuo", correct: false }]);
  assert.equal(JSON.stringify(api.weakWordIds(api.readSession(id))), '["gongzuo"]');
});
test("different session IDs retain independent outcomes", () => {
  const api = setup(); const a = api.finishSession("review", ["xuexi"], [{ wordId: "xuexi", rating: 1 }]); const b = api.finishSession("review", ["gongzuo"], [{ wordId: "gongzuo", rating: 4 }]);
  assert.notEqual(a, b); assert.equal(api.readSession(a).answers[0].rating, 1); assert.equal(api.readSession(b).answers[0].rating, 4);
  assert.equal(api.readSession().id, b);
});
test("blocked storage retains result in memory without throwing", () => {
  const api = setup(true); const id = api.finishSession("learn", ["xuexi"], []);
  assert.equal(api.readSession(id).answers.length, 0); assert.equal(api.weakWordIds(api.readSession(id)).length, 0);
});
test("corrupt storage, wrong schema and mismatching IDs do not crash", () => {
  for (const raw of ["{bad", JSON.stringify({ version: 0 }), JSON.stringify({ version: 1, words: [] })]) {
    const api = setup(false, new Map([["xueyan-preview-session-v1:broken", raw]])); assert.equal(api.readSession("broken"), null);
  }
  const api = setup(); const id = api.finishSession("learn", ["xuexi"], []);
  api.data.set("xueyan-preview-session-v1:other", JSON.stringify(api.readSession(id)));
  assert.equal(setup(false, api.data).readSession("other"), null);
});
test("duplicates, invalid rating, unknown word and missing correctness are rejected", () => {
  const api = setup(); const id = api.finishSession("review", ["xuexi"], [{ wordId: "xuexi", rating: 3 }]); const base = api.readSession(id);
  for (const patch of [{ words: ["unknown"] }, { answers: [{ wordId: "xuexi", rating: 9 }] }, { answers: [base.answers[0], base.answers[0]] }, { mode: "practice", answers: [{ wordId: "xuexi" }] }]) assert.equal(api.validateResult({ ...base, ...patch }), null);
});
