import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../lib/draft-storage.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const sandbox = { exports: {} }; vm.runInNewContext(compiled, sandbox);
const { draftKey, readDraft, writeDraft } = sandbox.exports;
function storage() {
  const data = new Map(); const writes = [];
  return { data, writes, getItem: key => data.get(key) ?? null, setItem: (key, value) => { writes.push(key); data.set(key, value); } };
}

test("all six draft shapes round-trip with Vietnamese, Han, Pinyin and time", () => {
  const store = storage();
  for (const [kind, data] of Object.entries({
    note: { note: "学习 · xuéxí · Học tập" }, assignment: { text: "我学习汉语。".repeat(12) },
    grading: { grade: "85", comment: "Nhận xét thử · chú ý thanh điệu." },
    profile: { name: "Học viên thử", bio: "Giới thiệu", headline: "学言", purpose: "Luyện thi HSK", level: "HSK 3", pinyin: false, video: "https://example.com", schedule: "19:30" },
    settings: { goal: 35, pinyin: false, autoplay: false, hanViet: true, time: "07:45", timezone: "Asia/Shanghai (GMT+8)", privacy: "Riêng tư" },
    onboarding: { goal: "30", purpose: "Du học & Học thuật", time: "Buổi sáng · 07:00–08:30" },
  })) {
    const key = draftKey(kind, "test-a"); assert.equal(writeDraft(store, key, data), true);
    assert.equal(JSON.stringify(readDraft(store, key, data).data), JSON.stringify(data));
  }
});
test("IDs and data types have separate keys; reads never write", () => {
  const store = storage(); const a = draftKey("note", "test:a"), b = draftKey("note", "test:b");
  writeDraft(store, a, { note: "A" }); writeDraft(store, b, { note: "B" });
  assert.equal(readDraft(store, a, { note: "" }).data.note, "A");
  assert.equal(readDraft(store, b, { note: "" }).data.note, "B");
  assert.notEqual(a, draftKey("assignment", "test:a")); assert.equal(store.writes.length, 2);
});
test("broken JSON, unsupported version, missing/type-invalid fields preserve original", () => {
  for (const raw of ["{bad", '{"version":9,"data":{"note":"old"}}', '{"version":1,"data":{}}', '{"version":1,"data":{"note":99}}']) {
    const store = storage(); store.data.set("test", raw);
    const result = readDraft(store, "test", { note: "" });
    assert.equal(result.data.note, ""); assert.match(result.message, /Không thể đọc/);
    assert.equal(store.data.get("test"), raw); assert.equal(store.writes.length, 0);
  }
});
test("legacy plain text, numeric goal and partial profile migrate without modifying old key", () => {
  const store = storage(); store.data.set("legacy-note", "Ghi chú cũ"); store.data.set("legacy-goal", "30"); store.data.set("legacy-profile", '{"name":"Tên cũ","bio":"Mô tả"}');
  assert.equal(readDraft(store, "new-note", { note: "" }, { key: "legacy-note", textField: "note" }).data.note, "Ghi chú cũ");
  assert.equal(readDraft(store, "new-goal", { goal: 20, time: "20:30" }, { key: "legacy-goal", textField: "goal" }).data.goal, 30);
  const profile = readDraft(store, "new-profile", { name: "", bio: "", pinyin: true }, { key: "legacy-profile" });
  assert.equal(profile.data.name, "Tên cũ"); assert.equal(profile.data.pinyin, true);
  assert.equal(store.writes.length, 0); assert.equal(store.data.size, 3);
});
test("denied/quota storage reports failure without throwing or claiming success", () => {
  const denied = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("quota"); } };
  assert.match(readDraft(denied, "test", { note: "" }).message, /Không thể đọc/);
  assert.equal(writeDraft(denied, "test", { note: "keep in state" }), false);
});
test("non-finite numbers cannot produce a falsely successful draft", () => {
  const store = storage(); assert.equal(writeDraft(store, "test", { grade: NaN }), false); assert.equal(store.writes.length, 0);
});

test("old numeric grades migrate; unfinished blank grade drafts round-trip", () => {
  const store = storage(); store.data.set("legacy-grade", '{"grade":84,"comment":"Nhận xét cũ"}');
  assert.equal(readDraft(store, "new-grade", { grade: "92", comment: "" }, { key: "legacy-grade" }).data.grade, "84");
  assert.equal(writeDraft(store, "new-grade", { grade: "", comment: "Chưa chấm xong" }), true);
  assert.equal(readDraft(store, "new-grade", { grade: "92", comment: "" }).data.grade, "");
});
