# XUEYAN Design System

Shared visual tokens live in `frontend/app/globals.css` under `:root`. Use these variables instead of adding page-level color literals.

## Color

| Role | Token | Value |
| --- | --- | --- |
| Primary | `--primary` | `#004563` |
| Primary hover | `--primary-hover` | `#185D80` |
| Primary soft | `--primary-soft` | `#E9F5FF` |
| Background | `--background` | `#F5FAFF` |
| Surface | `--surface` | `#FFFFFF` |
| Muted surface | `--surface-muted` | `#E9F5FF` |
| Main text | `--text` | `#0A1E28` |
| Muted text | `--text-soft` | `#40484E` |
| Border | `--border` | `#C0C7CE` |
| Success | `--success` | `#046C4B` |
| Warning | `--warning` | `#745100` |
| Danger | `--danger` | `#BA1A1A` |
| Info | `--info` | `#185D80` |
| Focus ring | `--focus-ring` | `rgba(35, 100, 135, 0.28)` |
| Chart accents | `--chart-secondary`, `--chart-tertiary` | `#7CB1C6`, `#78B8D0` |

Use semantic foreground tokens (`--success-on-soft`, `--warning-on-soft`) on tinted status surfaces. The primary foreground is white. Keep text/background contrast readable; do not use opacity to mute body copy.

## Typography

- UI and Vietnamese copy: Be Vietnam Pro via `next/font` and `--font-sans`.
- Chinese characters: Noto Sans SC via `next/font` and `--font-zh`.
- Code/data: `--font-mono` system monospace stack.
- Use 12-14px for labels, 14-16px for body copy, 18-20px for card headings, and 32-44px for page-level display headings. Keep body line-height between 1.5 and 1.7.

## Spacing, Radius, Shadow

Use `--space-1` through `--space-16` (4, 8, 12, 16, 24, 32, 48, 64px). Standard surfaces use `--radius-sm` (8px), `--radius-md` (12px), and `--radius-lg` (16px); reserve `--radius-xl` (20px) for featured areas. Use `--shadow-sm`, `--shadow`, and `--shadow-overlay` for increasing elevation.

## Components

- **Buttons:** use a filled primary action, muted-surface secondary action, and visible `:focus-visible`, hover, active, and disabled states. Icon-only buttons require an accessible name.
- **Inputs:** use the shared font, text, surface, and border tokens; provide a persistent label and the shared focus ring. Errors use `--danger` and must explain recovery.
- **Cards:** use a white surface, subtle border, and restrained shadow. Do not nest framed cards.
- **Navigation:** prefer Next.js `Link`; the mobile menu exposes `aria-expanded`, closes with Escape, and returns focus to its trigger.
- **Dialogs and disclosures:** use semantic buttons, keyboard focus management, and `aria-expanded`/`aria-controls` for expandable content.

The Stitch reference is `frontend/dasboard.html` (the filename is intentionally retained as provided). Its dashboard implementation is `/dashboard`; other routes share the root tokens without changing their structure.
