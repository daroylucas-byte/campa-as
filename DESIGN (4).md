---
name: Synthetic Intelligence Platform
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#6b38d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#8455ef'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for a professional B2B SaaS environment, specifically catering to marketing agencies managing high-volume AI campaigns. The personality is **authoritative, innovative, and precise**, balancing the reliability of traditional enterprise software with the forward-leaning energy of generative AI.

The aesthetic follows a **Modern Corporate** approach with **Glassmorphic** accents. It utilizes high-clarity layouts, generous whitespace, and purposeful motion to convey a sense of "intelligence under the hood." While the core structure is grounded and neutral to ensure long-term usability, AI-driven features are highlighted with vibrant indigo gradients and subtle glow effects to differentiate manual workflows from automated intelligence.

## Colors

The palette is anchored by a deep **Indigo/Violet** primary scale, used exclusively for primary actions and AI-related features. In Dark Mode, these colors utilize a slightly higher luminosity to maintain accessibility.

- **Primary & AI Brand:** Indigo (#6366f1) and Violet (#4f46e5) are used for "Magic" buttons, AI status indicators, and active navigational states.
- **Surface & Structure:** A neutral Slate scale (from #f8fafc to #0f172a) provides a sophisticated, low-fatigue backdrop.
- **Semantic:** Success, Warning, and Error colors follow industry standards but are slightly desaturated to match the professional tone of the system.

## Typography

The design system employs a dual-font strategy. **Plus Jakarta Sans** is used for headlines to provide a modern, geometric, and friendly character, particularly when set in **Extra Bold**. **Inter** is utilized for body text, data tables, and labels, ensuring maximum legibility and a systematic feel for complex agency workflows.

- **Headlines:** Use Extra Bold (800) for page titles and Bold (700) for section headers.
- **Body:** Standardize on 16px (body-md) for most content to maintain a high-end, spacious feel.
- **Scaling:** On mobile devices, large headlines should scale down to 24px (headline-lg-mobile) to prevent awkward word breaks in the dense agency dashboard.

## Layout & Spacing

This design system uses a **Fluid Grid** model with a maximum container width of 1440px for desktop. The system is built on an 8px base unit to ensure consistent vertical rhythm.

- **Desktop (1280px+):** 12-column grid, 24px gutters, 32px side margins.
- **Tablet (768px - 1279px):** 8-column grid, 20px gutters, 24px side margins.
- **Mobile (<767px):** 4-column grid, 16px gutters, 16px side margins.

Content cards should use a `lg` (48px) spacing between major sections and `md` (24px) for internal padding to maintain the "high whitespace" brand promise.

## Elevation & Depth

Visual hierarchy is established using **Tonal Layers** and **Ambient Shadows**. This design system avoids harsh borders in favor of soft depth cues.

1. **Flat Base:** The main background is the lowest level (Level 0).
2. **Surface Level:** Cards and main content containers sit on Level 1, using a 1px subtle border (#e2e8f0 in light, #334155 in dark) and a soft, diffused shadow (Y: 4, Blur: 20, Opacity: 0.05).
3. **Elevated AI Level:** Features requiring AI interaction use a subtle backdrop blur (8px) and a tinted violet inner-glow to suggest "depth" within the tool.
4. **Overlay Level:** Modals and dropdowns use a higher elevation (Level 3) with a more pronounced shadow (Y: 12, Blur: 30, Opacity: 0.1).

## Shapes

The shape language is consistently **Rounded**, reinforcing the modern and approachable AI persona. 

- **Standard Elements:** Buttons, input fields, and small components use `rounded` (0.5rem / 8px).
- **Cards & Containers:** All primary content cards must use `rounded-xl` (1.5rem / 24px) to emphasize the generous, soft aesthetic.
- **Interactive Chips:** Tags and status indicators use a fully rounded (pill-shaped) geometry to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid Indigo/Violet gradient with white text. 
- **AI/Magic Button:** Features a subtle "sparkle" icon (Material Symbol: `auto_awesome`) and a faint violet outer glow.
- **Secondary:** Transparent background with a 1px neutral border.

### Cards
- **Structure:** 24px padding, 24px border radius.
- **Header:** Uses `headline-md` with an icon from the Material Symbols Outlined set.

### Input Fields
- **Style:** Subtle light gray background (#f1f5f9) that shifts to white on focus with an indigo ring.
- **Labels:** Always use `label-md` placed above the field.

### Lists & Data Tables
- **Rows:** Minimum height of 64px to ensure touch-friendly targets and breathing room for data.
- **Dividers:** Use 1px thin lines in #f1f5f9 (Light) or #334155 (Dark).

### Icons
- Use **Material Symbols Outlined**. Standard weight is 300 to maintain a sophisticated, thin-line aesthetic that complements the Inter typeface.

### AI Feedback Components
- **Progress Bars:** Use a shimmering indigo gradient for AI processing states.
- **Tooltip/Ghost Hints:** Use glassmorphic semi-transparent backgrounds to suggest AI assistance without obstructing the view.