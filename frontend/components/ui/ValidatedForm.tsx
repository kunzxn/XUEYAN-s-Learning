"use client";
import { useCallback, useEffect, useId, useRef, useState, type FormHTMLAttributes, type SubmitEvent } from "react";
import { createPortal } from "react-dom";

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Issue = { control: Control; message: string; host: HTMLElement; id: string };
export type CustomValidation = (form: HTMLFormElement) => Record<string, string | undefined>;

export function showServerErrors(form:HTMLFormElement, fields:Record<string,string[]>) { form.dispatchEvent(new CustomEvent("xueyan:validation", {detail:fields})); }

/** Field errors stay beside existing Input/label markup, including forms in Dialog. */
export function ValidatedForm({ validate, onSubmit, onReset, ...props }: FormHTMLAttributes<HTMLFormElement> & { validate?: CustomValidation }) {
  const prefix = useId(); const ref = useRef<HTMLFormElement>(null);
  const descriptions = useRef(new Map<Control, string | null>());
  const [issues, setIssues] = useState<Issue[]>([]); const submitted = useRef(false);
  const focusError = useRef(false);
  const serverErrors = useRef<Record<string,string>>({});
  useEffect(() => {
    // The description must exist in the DOM before assistive technology receives focus.
    if (focusError.current) { focusError.current = false; issues[0]?.control.focus(); }
  }, [issues]);
  const check = useCallback((form: HTMLFormElement, focus: boolean) => {
    const custom = {...serverErrors.current,...validate?.(form)};
    const next: Issue[] = [];
    Array.from(form.elements).forEach((element, index) => {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) || ((element.disabled || !element.willValidate) && !custom[element.name])) return;
      const value = element.value;
      let message = custom[element.name] ?? "";
      if (!message && element.required && !value.trim()) message = "Vui lòng nhập hoặc chọn thông tin này.";
      if (!message && element.validity.typeMismatch) message = element.type === "email" ? "Nhập địa chỉ email hợp lệ, ví dụ ban@example.com." : "Nhập liên kết hợp lệ bắt đầu bằng https:// hoặc http://.";
      if (!message && element instanceof HTMLInputElement && value && element.type === "tel" && (!/^\+?[\d\s().-]+$/u.test(value) || value.replace(/\D/g,"").length < 7 || value.replace(/\D/g,"").length > 15)) message = "Số điện thoại cần 7–15 chữ số; có thể dùng +, khoảng trắng hoặc dấu phân cách.";
      if (!message && element instanceof HTMLInputElement && value && element.type === "url" && !/^https?:\/\//i.test(value)) message = "Liên kết cần bắt đầu bằng https:// hoặc http://.";
      if (!message && "minLength" in element && element.minLength > 0 && value.length < element.minLength) message = `Cần ít nhất ${element.minLength} ký tự.`;
      if (!message && "maxLength" in element && element.maxLength > 0 && value.length > element.maxLength) message = `Không vượt quá ${element.maxLength} ký tự.`;
      if (!message && element instanceof HTMLInputElement && element.validity.rangeOverflow) message = `Giá trị không được lớn hơn ${element.max}.`;
      if (!message && element instanceof HTMLInputElement && element.validity.rangeUnderflow) message = `Giá trị không được nhỏ hơn ${element.min}.`;
      if (!message && element instanceof HTMLInputElement && element.validity.stepMismatch) message = `Nhập giá trị đúng bước ${element.step || "1"}.`;
      if (!message && element.validity.badInput) message = "Vui lòng nhập giá trị đúng định dạng.";
      if (!message && !element.validity.valid) message = "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.";
      if (!descriptions.current.has(element)) descriptions.current.set(element, element.getAttribute("aria-describedby"));
      const original = descriptions.current.get(element);
      const id = `${prefix}-error-${index}`;
      if (message) {
        element.setAttribute("aria-invalid", "true");
        element.setAttribute("aria-describedby", [original, id].filter(Boolean).join(" "));
        next.push({ control: element, message, id, host: element.closest<HTMLElement>("[data-form-field]") ?? element.closest("label") ?? element.parentElement! });
      } else {
        element.removeAttribute("aria-invalid");
        if (original) element.setAttribute("aria-describedby", original); else element.removeAttribute("aria-describedby");
      }
    });
    focusError.current = focus;
    setIssues(next);
    return next.length === 0;
  }, [validate,prefix]);
  useEffect(() => {
    const form = ref.current; if(!form) return;
    const receive = (event:Event) => { serverErrors.current=Object.fromEntries(Object.entries((event as CustomEvent<Record<string,string[]>>).detail).map(([key,value])=>[key,value[0]])); submitted.current=true; check(form,true); };
    form.addEventListener("xueyan:validation",receive); return()=>form.removeEventListener("xueyan:validation",receive);
  },[check]);
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); submitted.current = true; serverErrors.current={};
    if (check(event.currentTarget, true)) onSubmit?.(event);
  }
  return <form {...props} ref={ref} noValidate onSubmit={submit} onChangeCapture={event => { const target=event.target; if(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) delete serverErrors.current[target.name]; if (submitted.current && ref.current) check(ref.current, false); }} onReset={event => {
    submitted.current = false; serverErrors.current={}; setIssues([]);
    descriptions.current.forEach((original, element) => { element.removeAttribute("aria-invalid"); if (original) element.setAttribute("aria-describedby", original); else element.removeAttribute("aria-describedby"); });
    onReset?.(event);
  }}>{props.children}{issues.map(issue => createPortal(<small id={issue.id} role="alert" style={{ display: "block" }}>{issue.message}</small>, issue.host, issue.id))}</form>;
}
