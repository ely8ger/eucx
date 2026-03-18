---
name: ui-ux-pro-max
description: Design Intelligence for EUCX — Professional UI/UX guidance. Use when designing pages, components, color, typography, layout, or reviewing UX quality.
---

# EUCX Design Intelligence

## Project Context
EUCX is a **regulated European commodity exchange** (eucx.eu) — institutional fintech platform for trading steel, timber, agri, and industrial goods. BaFin-regulated. B2B audience. Trust and professionalism are paramount.

## Active Design System
Located in `design-system/eucx/MASTER.md`. Page overrides: `design-system/eucx/pages/`.

**Core System:**
- Style: **Minimalism & Swiss Style** — Clean, grid-based, high contrast, spacious
- Colors: Primary `#2563EB` | Background `#F8FAFC` | Text `#1E293B` | CTA `#F97316`
- Font: **Inter** (all weights 300–700)
- Effects: Subtle hover 200–250ms, sharp shadows, clear type hierarchy

**Anti-patterns (NEVER USE):**
- Playful design or rounded comic-style elements
- AI purple/pink gradients
- Unclear fee structures or vague CTAs
- Emoji as icons (use Lucide SVG)
- Random color choices without semantic tokens

## How to Use This Skill

### When Designing a Page
```bash
# Check page-specific overrides first, then MASTER:
cat design-system/eucx/pages/<page>.md 2>/dev/null || cat design-system/eucx/MASTER.md
```

### Run Design System Generator
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --design-system -p "EUCX"
```

### Search Specific Domains
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain>
# Domains: product | style | color | typography | chart | ux | landing | react | web
```

## Quick Reference — Priority Rules

### 1. Accessibility (CRITICAL)
- Contrast ≥4.5:1 for text, ≥3:1 for large text
- Focus rings visible on all interactive elements
- No icon-only buttons without aria-label
- Keyboard navigation must work

### 2. Touch & Interaction (CRITICAL)
- Min touch target: 44×44px + 8px spacing
- Loading state on async buttons
- cursor-pointer on all clickable elements
- Hover states with 150–300ms transitions

### 3. Layout (HIGH)
- Mobile-first, breakpoints: 375 / 768 / 1024 / 1440
- Consistent max-w-7xl container
- 4/8px spacing system
- No horizontal scroll

### 4. Typography (MEDIUM)
- Body: 16px min, line-height 1.5–1.75
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48
- Weight: 700 headings, 400 body, 500 labels
- Inter font throughout

### 5. Data & Charts (important for trading)
- Always show legend + tooltip on hover
- Match chart type: trend→line, comparison→bar
- Accessible color pairs (not red/green only)
- Skeleton loading for >300ms operations
