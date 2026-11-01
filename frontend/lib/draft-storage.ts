export type DraftData = Record<string, string | number | boolean>;
export type StoragePort = Pick<Storage, "getItem" | "setItem">;
export const draftKey = (kind: string, id: string) => `xueyan:draft:v1:${kind}:${encodeURIComponent(id)}`;

// Legacy keys are read only. They are never removed or overwritten by migration.
export function readDraft<T extends DraftData>(storage: StoragePort, key: string, defaults: T, legacy?: { key: string; textField?: keyof T }) {
  try {
    const current = storage.getItem(key);
    const raw = current ?? (legacy ? storage.getItem(legacy.key) : null);
    if (raw === null) return { data: defaults, message: "" };
    const parsed = current !== null ? JSON.parse(raw) : legacy?.textField ? { [legacy.textField]: typeof defaults[legacy.textField] === "number" ? Number(raw) : raw } : JSON.parse(raw);
    if (current !== null && (parsed?.version !== 1 || !parsed.data)) throw new Error("schema");
    const data = current !== null ? parsed.data : parsed;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("schema");
    const result = { ...defaults };
    for (const field of Object.keys(defaults) as (keyof T)[]) {
      if (!(field in data)) { if (current !== null) throw new Error("schema"); continue; }
      let value = data[field];
      // Older grading drafts stored a number; editable grades also allow an unfinished blank.
      if (field === "grade" && typeof defaults[field] === "string" && typeof value === "number" && Number.isFinite(value)) value = String(value);
      if (typeof value !== typeof defaults[field] || (typeof value === "number" && !Number.isFinite(value)) || (typeof value === "string" && value.length > 20000)) throw new Error("schema");
      result[field] = value;
    }
    return { data: result, message: current === null ? "Đã khôi phục bản nháp cũ trên thiết bị; trường chưa có dùng giá trị mặc định. Chưa đồng bộ server." : "Đã khôi phục bản nháp trên thiết bị này; chưa đồng bộ server." };
  } catch {
    return { data: defaults, message: "Không thể đọc bản nháp (dữ liệu lỗi, phiên bản không hỗ trợ hoặc quyền lưu trữ). Bản cũ được giữ nguyên; hãy kiểm tra trước khi lưu lại." };
  }
}

export function writeDraft(storage: StoragePort, key: string, data: DraftData) {
  try { if (Object.values(data).some(value => typeof value === "number" && !Number.isFinite(value))) return false; storage.setItem(key, JSON.stringify({ version: 1, data })); return true; } catch { return false; }
}
