---
name: Serene Scholar
colors:
  surface: '#f5faff'
  surface-dim: '#c9ddeb'
  surface-bright: '#f5faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f5ff'
  surface-container: '#ddf1ff'
  surface-container-high: '#d7ebf9'
  surface-container-highest: '#d2e5f4'
  on-surface: '#0a1e28'
  on-surface-variant: '#40484e'
  inverse-surface: '#21333e'
  inverse-on-surface: '#e3f3ff'
  outline: '#71787e'
  outline-variant: '#c0c7ce'
  surface-tint: '#236487'
  primary: '#004563'
  on-primary: '#ffffff'
  primary-container: '#185d80'
  on-primary-container: '#9ad5fd'
  inverse-primary: '#93cdf6'
  secondary: '#046c4b'
  on-secondary: '#ffffff'
  secondary-container: '#9bf1c7'
  on-secondary-container: '#0f704f'
  tertiary: '#563b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#745100'
  on-tertiary-container: '#fcc55f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7e7ff'
  primary-fixed-dim: '#93cdf6'
  on-primary-fixed: '#001e2e'
  on-primary-fixed-variant: '#004c6c'
  secondary-fixed: '#9ef4ca'
  secondary-fixed-dim: '#82d7af'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005138'
  tertiary-fixed: '#ffdea9'
  tertiary-fixed-dim: '#f4be59'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5e4200'
  background: '#f5faff'
  on-background: '#0a1e28'
  surface-variant: '#d2e5f4'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  hanzi-hero:
    fontFamily: Noto Sans SC
    fontSize: 72px
    fontWeight: '500'
    lineHeight: 84px
  hanzi-card:
    fontFamily: Noto Sans SC
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
  hanzi-inline:
    fontFamily: Noto Sans SC
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  pinyin-display:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system crafts an intentional, distraction-free environment for Vietnamese learners mastering Chinese characters, syntax, and phonetics. Synthesizing traditional calligraphic focus with clean Nordic minimalism, the visual philosophy creates quiet academic rigor complemented by gentle, non-intrusive gamification. 

The aesthetic eschews overstimulating neon mechanics and hyperactive cartoon rewards in favor of contemplative progression, tactile micro-interactions, and balanced space. The goal is to induce deep focus, intellectual calm, and intrinsic motivation. Learners interact with crisp, legible characters grounded on warm ivory paper-like surfaces, accented with brush-ink blues, scholarly jade, and subtle gold milestones.

## Colors

The palette draws inspiration from traditional inkstones, mineral pigments, and fine rice paper:

- **Primary Brand Blue (`#185D80`)**: Represents clarity, intellectual depth, and navigation anchor points. Active states and interactive triggers shift to a deeper ink hue (`#104460`).
- **Pale Blue Tint / Container (`#EAF3F8`)**: Soft foundational wash for selectable items, active navigation badges, character breakdown containers, and tone-mark highlights.
- **Jade Green (`#1F7A58`)**: Signifies correct strokes, successful review sessions, mastery badges, and completed study intervals.
- **Restrained Gold (`#C49332`)**: Reserved for learning streaks, high-tier mastery crowns, review milestones, and achievement micro-moments. Used sparingly to preserve value.
- **Primary Charcoal (`#20323D`)**: The primary text and Hanzi character stroke color, offering high legibility without the harshness of pure black.
- **Secondary Slate (`#5B6D7A`)**: Applied to Pinyin annotations, grammatical role tags, secondary metadata, and icon accents.
- **Base Canvas & Surfaces**: Backing canvas uses warm Ivory (`#FAFAF7`) to ease visual fatigue during extended reading sessions, paired with pure white (`#FFFFFF`) for elevated cards. Borders maintain architectural structure with Subtle Border (`#E2E8EC`).

## Typography

The type hierarchy coordinates two scripts: Vietnamese Latin typography via **Be Vietnam Pro** and Simplified Chinese glyphs via **Noto Sans SC**. 

- **Be Vietnam Pro** delivers native diacritic support, balancing Vietnamese tonal accents without clipping or awkward line wrap artifacts.
- **Noto Sans SC** renders Chinese characters with uniform optical density, preserving stroke weight parity across Latin and Hanzi text blocks.
- **Pinyin Annotations**: Always positioned directly above or below corresponding Hanzi, set in `pinyin-display` or `body-sm` medium weights, colored in `#5B6D7A` to preserve character hierarchy.
- **Bilingual Stacking**: When presenting Chinese sentences followed by Vietnamese translations, Hanzi is styled at `body-lg` or `headline-sm`, followed by a `0.25rem` baseline shift, leading into Vietnamese contextual copy in `body-md` muted text.

## Layout & Spacing

Layouts are divided into three distinct operational modes:

1. **Public Layout**: 12-column grid capped at 1200px max width. Features a sticky top navigation (height: 72px) and editorial footer, prioritizing informational storytelling and onboarding.
2. **Learner Dashboard Layout**: Split architecture with a 260px fixed collapsible sidebar, an interactive 64px utility top bar (showing streaks, level progress, and active HSK goals), and an offset 8-column primary content area.
3. **Study Focus Layout**: Single-column viewport-centered canvas (max-width: 768px). Omits sidebars, primary menus, and distracting visual cues. Houses the active flashcard, stroke-order canvas, and linear progress track.

Grid columns use fluid percentage scaling with a consistent 24px desktop gutter (`16px` on mobile screens below 768px).

## Elevation & Depth

Visual hierarchy prioritizes crisp borders and subtle ambient diffusion over heavy drop shadows:

- **Flat Surface Border**: Default state for idle cards, flashcard borders, and list items: `1px solid #E2E8EC` on `#FFFFFF` backgrounds.
- **Subtle Ambient Elevation (Resting Cards)**: `0 2px 8px rgba(32, 50, 61, 0.04)`.
- **Raised Interactive Elevation (Hover & Focus States)**: `0 8px 24px rgba(24, 93, 128, 0.08)`, paired with a border shift to `#185D80`.
- **Floating Modals & Character Tracing Drawers**: `0 16px 40px rgba(32, 50, 61, 0.12)` with a soft ivory backdrop blur (`backdrop-filter: blur(8px)` over `rgba(250, 250, 247, 0.8)`).
- **Gamified Tactile Press**: Key interactive study buttons feature a solid 3px bottom lip border (`#104460`) rather than a shadow, which compresses to `0px` upon `:active` state to provide responsive haptic feedback.

## Shapes

The geometric signature is grounded on structured, organic softness:

- **Standard Cards & Containers**: Strictly locked to `16px` (`rounded-lg` token scale) corner curvature, evoking polished river stones and traditional writing tablets.
- **Buttons & Input Controls**: Set to `12px` roundedness to maintain architectural harmony without feeling overly circular.
- **Pills & Status Chips**: Utilize full radius (`9999px`) for tone tags (First, Second, Third, Fourth tone indicators), HSK level indicators, and vocabulary mastery markers.

## Components

### Buttons
- **Primary**: Solid `#185D80` fill with `#FFFFFF` text. Height: 48px, radius: 12px. Subtle 2px bottom bevel in `#104460`. Active state transforms `translateY(2px)`.
- **Secondary**: `#EAF3F8` surface with `#185D80` label. No border. On hover, background shifts to `#D6E8F2`.
- **Success / Submit**: `#1F7A58` fill with `#FFFFFF` text, used exclusively during answer confirmation or study milestone completion.
- **Ghost**: Transparent fill, `#5B6D7A` text, hover reveals `#EAF3F8` background.

### Cards
- **Study Flashcard**: Pure `#FFFFFF` fill, 16px corner radius, 1px `#E2E8EC` border. Padding: 32px. Features dedicated upper slot for Pinyin, centered large Hanzi display, and expandable lower drawer for Sino-Vietnamese (Hán-Việt) etymology.
- **Progress Track Card**: Dual-layered card with `#FAFAF7` background, holding a segmented emerald progress bar (`#1F7A58`) tracking daily spaced-repetition goals.

### Chips & Badges
- **HSK Level Badges**: Pill-shaped (`rounded-full`), padded `4px 12px`. Subtle ivory background with `#185D80` border and text.
- **Tone Indicators**: Fixed mini-pills displaying tone pitch graphs alongside numeric marks (e.g., Thanh 1, Thanh 4).
- **Streak Pill**: Gold container (`rgba(196, 147, 50, 0.12)`) housing `#C49332` iconography and dynamic day counter.

### Input Fields & Character Tracing Canvas
- **Text Inputs**: 48px height, `#FFFFFF` fill, 1px solid `#E2E8EC` border, 12px corner radius. Focused state applies a 2px outer ring in `#185D80` at 20% opacity with border `#185D80`.
- **Hanzi Stroke Canvas**: 280x280px square container with 16px radius, overlaid with faint rice-grid guidelines (Mễ tự cách / 米字格) in `#E2E8EC`. Includes clear and hint control anchors at base.

### Lists & Vocabulary Rows
- **Dictionary & Vocab Row**: 16px horizontal, 12px vertical padding. Left column holds Hanzi + Pinyin stack; center holds Vietnamese definition and Part of Speech tag; right slot houses audio pronunciation trigger. Separated by `1px solid #E2E8EC`.