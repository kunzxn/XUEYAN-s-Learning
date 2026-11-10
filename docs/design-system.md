# XUEYAN Design System

**Hướng thiết kế: "Mực xanh & giấy".** Xanh mực (lấy từ logo nét cọ) là màu chủ đạo trên nền giấy ấm (`--background: #F6F3EC`); son đỏ kiểu ấn triện (`--seal`) chỉ dùng cho điểm nhấn rất nhỏ như dấu kicker. Chữ Hán hiển thị bằng Noto Serif SC (`--font-han-serif`) trong ô mễ tự cách (`.rice`), pinyin và nghĩa tiếng Việt dùng Be Vietnam Pro với line-height ≥ 1.65 để không cắt dấu thanh.

Shared visual tokens live in `frontend/styles/tokens.css` under `:root`, imported by `frontend/app/globals.css`. Use these variables instead of adding page-level color literals.

## Color

| Role | Token | Value |
| --- | --- | --- |
| Primary | `--primary` | `#0A4262` |
| Primary hover | `--primary-hover` | `#155A7F` |
| Primary soft | `--primary-soft` | `#E9F5FF` |
| Background | `--background` | `#F6F3EC` |
| Surface | `--surface` | `#FFFEFA` |
| Muted surface | `--surface-muted` | `#EFEBE1` |
| Main text | `--text` | `#0A1E28` |
| Muted text | `--text-soft` | `#40484E` |
| Border | `--border` | `#C0C7CE` |
| Success | `--success` | `#046C4B` |
| Warning | `--warning` | `#745100` |
| Danger | `--danger` | `#B3261E` |
| Seal accent (hạn chế) | `--seal` | `#B23A2E` |
| Info | `--info` | `#185D80` |
| Focus ring | `--focus-ring` | ``#185D80`` |
| Chart accents | `--chart-secondary`, `--chart-tertiary` | `#7CB1C6`, `#78B8D0` |

Use semantic foreground tokens (`--success-on-soft`, `--warning-on-soft`) on tinted status surfaces. The primary foreground is white. Keep text/background contrast readable; do not use opacity to mute body copy.

## Typography

- UI and Vietnamese copy: Be Vietnam Pro via `next/font` and `--font-sans`.
- Chinese characters: Noto Sans SC via `next/font` and `--font-zh`.
- Code/data: `--font-mono` system monospace stack.
- Use 12-14px for labels, 14-16px for body copy, 18-20px for card headings, and 32-44px for page-level display headings. Keep body line-height between 1.5 and 1.7.

## Spacing, Radius, Shadow

Use `--space-1` through `--space-16` (4, 8, 12, 16, 24, 32, 48, 64px). Standard surfaces use `--radius-sm` (6px), `--radius-md` (10px), and `--radius-lg` (14px); reserve `--radius-xl` (18px) for featured areas. Use `--shadow-sm`, `--shadow`, and `--shadow-overlay` for increasing elevation.

## Components

- **Buttons:** use a filled primary action, muted-surface secondary action, and visible `:focus-visible`, hover, active, and disabled states. Icon-only buttons require an accessible name.
- **Inputs:** use the shared font, text, surface, and border tokens; provide a persistent label and the shared focus ring. Errors use `--danger` and must explain recovery.
- **Cards:** use a white surface, subtle border, and restrained shadow. Do not nest framed cards.
- **Navigation:** prefer Next.js `Link`; the mobile menu exposes `aria-expanded`, closes with Escape, and returns focus to its trigger.
- **Dialogs and disclosures:** use semantic buttons, keyboard focus management, and `aria-expanded`/`aria-controls` for expandable content.

The canonical style reference is `frontend/dashboard.html`; the original `frontend/dasboard.html` is retained. The public reference maps to `/`, and learner Dashboard Stitch layouts map to `/dashboard`. Shared components are in `frontend/components/ui/`; page layouts use scoped CSS Modules. Full source inventory and route mapping are in `docs/ui-migration.md`.

## Quy tắc tránh giao diện "mẫu AI"

- Tiêu đề trang và tiêu đề khối dùng font serif `--font-heading` (Source Serif 4, hỗ trợ tiếng Việt); phần giao diện thao tác vẫn dùng Be Vietnam Pro.
- Không đặt nhãn viết hoa (kicker/eyebrow) phía trên tiêu đề. Tiêu đề tự đủ nghĩa.
- Không dùng lưới thẻ cùng cỡ kiểu icon + tiêu đề + mô tả, thẻ "số to + nhãn nhỏ", hay đánh số 01/02/03 khi thứ tự không mang thông tin. Dùng danh sách kẻ dòng hoặc cột chữ.
- Không dùng viền màu bên trái cho callout/ghi chú, không dùng kính mờ hoặc chip nổi làm trang trí.
- Chữ Hán luôn đặt trong ô mễ tự cách (`.rice`) khi là nội dung học chính.
- Logo JPG nền trắng được hòa vào nền bằng `mix-blend-mode: multiply` (xem `globals.css`).
