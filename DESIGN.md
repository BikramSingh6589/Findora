# DESIGN SYSTEM — Campus Connect (Lost & Found)

> **Source:** Stitch Project — *Master Frontend Architecture Stitcher*
> **Project ID:** `projects/6357447587790881575`
> **Last Updated:** 2026-06-28
> **Device Target:** Desktop + Mobile (Responsive)

---

## Brand & Personality

The brand personality is **"The Helpful Senior Student"**: reliable, tech-savvy, energetic, and approachable. It aims to reduce the anxiety of losing personal items by providing a supportive, gamified environment.

**Design Style:** Corporate / Modern with a **Tactile** twist — soft gradients, high-quality whitespace, and significant roundedness create a friendly, non-intimidating atmosphere.

The interface prioritizes optimism through Gen Z-friendly conversational copy and vibrant accent colors. The visual language is distinctly student-centered, balancing the professional requirements of a campus-wide system with the playful energy of a campus community.

---

## Color Palette

### Primary Brand Colors

| Token                  | Hex Value   | Usage                                      |
|------------------------|-------------|--------------------------------------------|
| `primary`              | `#4143d5`   | High-priority interactive elements         |
| `primary-container`    | `#5b5fef`   | Buttons, active badges                     |
| `on-primary`           | `#ffffff`   | Text/icons on primary surfaces             |
| `on-primary-container` | `#f9f6ff`   | Text on primary containers                 |
| `inverse-primary`      | `#c0c1ff`   | Inverse/dark mode primary                  |
| `primary-fixed`        | `#e1e0ff`   | Fixed primary tint                         |
| `primary-fixed-dim`    | `#c0c1ff`   | Dimmed fixed primary                       |
| `on-primary-fixed`     | `#05006c`   | Text on fixed primary                      |
| `on-primary-fixed-variant` | `#2c2cc3` | Variant text on fixed primary            |

### Secondary Colors

| Token                      | Hex Value   | Usage                              |
|----------------------------|-------------|------------------------------------|
| `secondary`                | `#6b38d4`   | Supporting UI, secondary actions   |
| `secondary-container`      | `#8455ef`   | Secondary button fills             |
| `on-secondary`             | `#ffffff`   | Text on secondary surfaces         |
| `on-secondary-container`   | `#fffbff`   | Text on secondary containers       |
| `secondary-fixed`          | `#e9ddff`   | Fixed secondary tint               |
| `secondary-fixed-dim`      | `#d0bcff`   | Dimmed fixed secondary             |
| `on-secondary-fixed`       | `#23005c`   | Text on fixed secondary            |
| `on-secondary-fixed-variant` | `#5516be` | Variant text on fixed secondary  |

### Tertiary (Reward / Gamification)

| Token                      | Hex Value   | Usage                                    |
|----------------------------|-------------|------------------------------------------|
| `tertiary`                 | `#735500`   | Reward, XP milestones                    |
| `tertiary-container`       | `#916c00`   | XP bar fills, achievement badges         |
| `on-tertiary`              | `#ffffff`   | Text on tertiary surfaces                |
| `on-tertiary-container`    | `#fff7ee`   | Text on tertiary containers              |
| `tertiary-fixed`           | `#ffdf9f`   | Fixed tertiary (Reward Yellow)           |
| `tertiary-fixed-dim`       | `#f9bd22`   | Dimmed reward yellow (XP bars)           |
| `on-tertiary-fixed`        | `#261a00`   | Text on fixed tertiary                   |
| `on-tertiary-fixed-variant` | `#5c4300`  | Variant text on fixed tertiary           |

### Surface & Background

| Token                       | Hex Value   | Usage                                   |
|-----------------------------|-------------|-----------------------------------------|
| `surface`                   | `#f7f9fb`   | Main page background                    |
| `surface-dim`               | `#d8dadc`   | Dimmed surface                          |
| `surface-bright`            | `#f7f9fb`   | Bright surface variant                  |
| `surface-container-lowest`  | `#ffffff`   | Pure white — cards, modals              |
| `surface-container-low`     | `#f2f4f6`   | Low emphasis containers                 |
| `surface-container`         | `#eceef0`   | Standard containers                     |
| `surface-container-high`    | `#e6e8ea`   | High emphasis containers                |
| `surface-container-highest` | `#e0e3e5`   | Highest emphasis containers             |
| `surface-tint`              | `#474adb`   | Tinted surface overlay                  |
| `surface-variant`           | `#e0e3e5`   | Surface variant                         |
| `background`                | `#f7f9fb`   | Page background (alias)                 |
| `on-background`             | `#191c1e`   | Text on background                      |
| `on-surface`                | `#191c1e`   | Text on surface                         |
| `on-surface-variant`        | `#464555`   | Secondary text, captions                |
| `inverse-surface`           | `#2d3133`   | Dark surface (dark mode base)           |
| `inverse-on-surface`        | `#eff1f3`   | Text on dark surface                    |
| `outline`                   | `#767586`   | Default borders, dividers               |
| `outline-variant`           | `#c6c5d7`   | Subtle borders                          |

### Dark Mode Overrides

| Token          | Hex Value   | Usage                            |
|----------------|-------------|----------------------------------|
| `dark-bg`      | `#111827`   | Dark mode page background        |
| `dark-card`    | `#1F2937`   | Dark mode card surfaces          |
| `dark-primary` | `#8B80FF`   | Lightened primary for dark mode  |

### Semantic / Functional Colors

| Token             | Hex Value   | Usage                                           |
|-------------------|-------------|-------------------------------------------------|
| `success`         | `#22C55E`   | Item recovery confirmations, positive states    |
| `warning`         | `#FB923C`   | Pending claims, caution states                  |
| `danger`          | `#F43F5E`   | Destructive actions, critical alerts            |
| `info-ai`         | `#38BDF8`   | AI-driven match suggestions (reserved for AI)   |
| `card-bg`         | `#FFFFFF`   | Card background alias                           |
| `border-default`  | `#E5E7EB`   | Standard card/input borders                     |
| `text-primary`    | `#111827`   | Primary text colour                             |
| `text-secondary`  | `#6B7280`   | Secondary/muted text                            |

### Error States

| Token                | Hex Value   | Usage                    |
|----------------------|-------------|--------------------------|
| `error`              | `#ba1a1a`   | Error text, icons        |
| `error-container`    | `#ffdad6`   | Error background tint    |
| `on-error`           | `#ffffff`   | Text on error surface    |
| `on-error-container` | `#93000a`   | Text on error container  |

---

## Typography

**Font Family:** `Plus Jakarta Sans` (used exclusively across all text roles)

> Import via Google Fonts:
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
> ```

### Type Scale

| Token               | Font Family        | Size   | Weight | Line Height |
|---------------------|--------------------|--------|--------|-------------|
| `hero-title`        | Plus Jakarta Sans  | 48px   | 700    | 1.2         |
| `page-title`        | Plus Jakarta Sans  | 36px   | 700    | 1.3         |
| `page-title-mobile` | Plus Jakarta Sans  | 28px   | 700    | 1.3         |
| `section-title`     | Plus Jakarta Sans  | 28px   | 600    | 1.4         |
| `card-title`        | Plus Jakarta Sans  | 22px   | 600    | 1.4         |
| `body-lg`           | Plus Jakarta Sans  | 18px   | 400    | 1.5         |
| `body-md`           | Plus Jakarta Sans  | 16px   | 400    | 1.5         |
| `label-md`          | Plus Jakarta Sans  | 16px   | 600    | 1.2         |
| `caption`           | Plus Jakarta Sans  | 14px   | 400    | 1.4         |

### Typography Rules

- **Headlines:** Bold (700) to establish clear hierarchy and confident voice
- **Body:** Regular (400) for high legibility in long-form descriptions / item details
- **Interactive:** Semibold (600) for buttons, navigation — distinguishes from static content
- **Mobile Scaling:** Titles scale down ~20-25% on mobile (see `page-title-mobile`)
- **Minimum Body Size:** 14px for accessibility compliance

---

## Spacing System

Based on an **8pt grid** for mathematical harmony across all components.

| Token             | Value   | Usage                                        |
|-------------------|---------|----------------------------------------------|
| `xs`              | 4px     | Micro spacing, icon padding                  |
| `sm`              | 8px     | Tight spacing, inline gaps                   |
| `md`              | 16px    | Standard internal card padding               |
| `lg`              | 24px    | Page section gaps, generous card padding     |
| `xl`              | 32px    | Major section separators                     |
| `2xl`             | 48px    | Hero section spacing                         |
| `3xl`             | 64px    | Large viewport section gaps                  |
| `gutter`          | 16px    | Column gutter                                |
| `margin-mobile`   | 16px    | Mobile side margins                          |
| `margin-desktop`  | 32px    | Desktop side margins                         |
| `base`            | 8px     | Grid base unit                               |

### Grid System

| Breakpoint | Columns | Gutter | Max Width |
|------------|---------|--------|-----------|
| Desktop    | 12      | 16px   | 1440px    |
| Tablet     | 6-8     | 16px   | —         |
| Mobile     | 1       | 16px   | —         |

> **Touch Targets:** All interactive elements must maintain a minimum of **44x44px** regardless of visual size.

---

## Border Radius (Roundness)

The shape language is purposefully **Rounded** to reinforce the "friendly senior" persona.

| Token     | Value    | Usage                                                  |
|-----------|----------|--------------------------------------------------------|
| `sm`      | 0.25rem  | Subtle rounding for small UI elements                  |
| `DEFAULT` | 0.5rem   | Standard rounding (8px)                               |
| `md`      | 0.75rem  | Inputs, dropdowns, primary buttons (12px)             |
| `lg`      | 1rem     | Content cards, information panels (16px)              |
| `xl`      | 1.5rem   | Modals, dialogs, bottom sheets (24px)                 |
| `full`    | 9999px   | Status badges, tags, chips, FABs (pill shape)         |

### Shape Rules by Component

| Component              | Radius    |
|------------------------|-----------|
| Standard Buttons       | 16px      |
| Inputs / Dropdowns     | 16px      |
| Content Cards          | 20px      |
| Information Panels     | 20px      |
| Modals / Dialogs       | 24px      |
| Bottom Sheets (mobile) | 24px      |
| Status Badges / Tags   | Full pill |
| FAB (Floating Action)  | Full pill |

---

## Elevation & Shadow System

Visual hierarchy via **Tonal Layering** + **Ambient Shadows**. Avoids harsh black shadows — uses soft, brand-tinted shadows.

| Level   | Context               | Shadow Value                                     |
|---------|-----------------------|--------------------------------------------------|
| Level 1 | Cards (resting)       | `0 8px 30px rgba(0, 0, 0, 0.08)`                |
| Level 2 | Cards (hover/active)  | Increased spread + `scale(1.03)` transform       |
| Level 3 | Modals / Overlays     | Deep shadow + `backdrop-blur` 50% opacity        |
| Glow    | Primary buttons, CTAs | `0 0 20px rgba(91, 95, 239, 0.25)` (Indigo glow) |

### Interaction: Card Hover State

```css
.card:hover {
  transform: scale(1.03);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14);
  transition: all 0.2s ease;
}
```

---

## Component Guidelines

### Buttons

| Variant   | Background                        | Text      | Border        | Hover       |
|-----------|-----------------------------------|-----------|---------------|-------------|
| Primary   | Indigo-to-Purple gradient         | `#ffffff` | None          | scale(1.03) |
| Secondary | Transparent                       | Primary   | 1px Primary   | scale(1.03) |
| Danger    | `#F43F5E`                         | `#ffffff` | None          | darken 10%  |

```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #4143d5, #6b38d4);
  color: #ffffff;
  border-radius: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(91, 95, 239, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 24px rgba(91, 95, 239, 0.35);
}
```

### Input Fields

- **Resting:** 16px radius, 1px `#E5E7EB` border, `#f7f9fb` background
- **Focus:** Border transitions to `#4143d5` with soft `rgba(65, 67, 213, 0.15)` outer glow
- **Error:** Border becomes `#ba1a1a`, background tints to `#ffdad6`

### Cards

- **Background:** `#FFFFFF`
- **Border Radius:** 20px
- **Padding:** 24px
- **Shadow:** `0 8px 30px rgba(0, 0, 0, 0.08)`
- **Hover:** Lifts with increased shadow + `scale(1.03)`

### Chips & Badges

- **Shape:** Full pill (`border-radius: 9999px`)
- **Style:** Semi-transparent semantic color tints
  - Success: `rgba(34, 197, 94, 0.1)` bg / `#22C55E` text
  - Warning: `rgba(251, 146, 60, 0.1)` bg / `#FB923C` text
  - Danger: `rgba(244, 63, 94, 0.1)` bg / `#F43F5E` text
  - AI Match: `rgba(56, 189, 248, 0.1)` bg / `#38BDF8` text (Sky Blue)

### Gamification Elements

- **XP Bars:** Reward gradient (`#ffdf9f` to `#f9bd22`), rounded-pill track
- **Achievement Badges:** Tertiary color family, pill-shaped

### AI Match Suggestions

AI-matched item cards must be visually distinguished:
- Subtle `#38BDF8` (Sky Blue) border **or** a soft blue glow
- Distinguishes AI suggestions from manual search results

### Icons

- **Library:** Phosphor Icons (Rounded / Regular weight)
- **General use:** 24px
- **Hero / Empty states:** 32px

---

## CSS Custom Properties Reference

Paste into your `:root` to use throughout the project:

```css
:root {
  /* Primary */
  --color-primary: #4143d5;
  --color-primary-container: #5b5fef;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #f9f6ff;
  --color-inverse-primary: #c0c1ff;

  /* Secondary */
  --color-secondary: #6b38d4;
  --color-secondary-container: #8455ef;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #fffbff;

  /* Tertiary (Reward) */
  --color-tertiary: #735500;
  --color-tertiary-container: #916c00;
  --color-tertiary-fixed: #ffdf9f;
  --color-tertiary-fixed-dim: #f9bd22;

  /* Surface */
  --color-surface: #f7f9fb;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f2f4f6;
  --color-surface-container: #eceef0;
  --color-surface-container-high: #e6e8ea;
  --color-surface-container-highest: #e0e3e5;
  --color-on-surface: #191c1e;
  --color-on-surface-variant: #464555;
  --color-outline: #767586;
  --color-outline-variant: #c6c5d7;

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #FB923C;
  --color-danger: #F43F5E;
  --color-info-ai: #38BDF8;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-card-bg: #ffffff;
  --color-border-default: #E5E7EB;
  --color-background: #f7f9fb;

  /* Dark Mode */
  --color-dark-bg: #111827;
  --color-dark-card: #1F2937;
  --color-dark-primary: #8B80FF;

  /* Error */
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;
  --color-on-error: #ffffff;

  /* Typography */
  --font-family: 'Plus Jakarta Sans', sans-serif;
  --font-size-hero: 48px;
  --font-size-page-title: 36px;
  --font-size-page-title-mobile: 28px;
  --font-size-section-title: 28px;
  --font-size-card-title: 22px;
  --font-size-body-lg: 18px;
  --font-size-body-md: 16px;
  --font-size-label-md: 16px;
  --font-size-caption: 14px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-gutter: 16px;
  --space-margin-mobile: 16px;
  --space-margin-desktop: 32px;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-default: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-card-hover: 0 16px 48px rgba(0, 0, 0, 0.14);
  --shadow-modal: 0 24px 64px rgba(0, 0, 0, 0.2);
  --shadow-glow-primary: 0 0 20px rgba(91, 95, 239, 0.25);
}
```

---

## Accessibility

- All color combinations **must** maintain a **4.5:1 contrast ratio** (WCAG AA)
- In dark mode, primary shifts to `#8B80FF` for luminance against deep backgrounds
- Minimum touch target: **44x44px**
- Minimum body text: **14px**

---

*This file was auto-generated from the Stitch design system. For updates, re-fetch from Stitch project `6357447587790881575`.*
