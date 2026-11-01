"use client";
import { useEffect, useMemo, useState } from "react";
import { readDraft, writeDraft, type DraftData } from "./draft-storage";

export function useDeviceDraft<T extends DraftData>(key: string, defaults: T, legacy?: { key: string; textField?: keyof T }) {
  const serialized = JSON.stringify({ defaults, legacy });
  const config = useMemo(() => JSON.parse(serialized) as { defaults: T; legacy?: { key: string; textField?: keyof T } }, [serialized]);
  const [state, setState] = useState({ key: "", data: defaults, message: "" });
  useEffect(() => {
    let active = true;
    // Browser storage is read after hydration. No automatic write can precede it.
    Promise.resolve().then(() => {
      let restored;
      try { restored = readDraft(window.localStorage, key, config.defaults, config.legacy); }
      catch { restored = { data: config.defaults, message: "Trình duyệt không cho phép đọc bản nháp. Dữ liệu đang nhập chỉ ở phiên này." }; }
      if (active) setState({ key, ...restored });
    });
    return () => { active = false; };
  }, [key, config]);
  const ready = state.key === key;
  function update(patch: Partial<T>) { setState(previous => ({ ...previous, data: { ...previous.data, ...patch }, message: "" })); }
  function save() {
    if (!ready) return false;
    let saved = false;
    try { saved = writeDraft(window.localStorage, key, state.data); } catch { /* storage access itself can throw */ }
    setState(previous => ({ ...previous, message: saved ? "Đã lưu bản nháp trên thiết bị này; chưa đồng bộ server." : "Không thể lưu bản nháp trên thiết bị. Nội dung đang nhập được giữ trong phiên này; hãy sao chép trước khi rời trang." }));
    return saved;
  }
  return { data: ready ? state.data : defaults, update, save, ready, message: ready ? state.message : "Đang đọc bản nháp trên thiết bị…" };
}
