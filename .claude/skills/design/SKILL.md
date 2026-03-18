---
name: design
description: Design Advisor — 550+ rules, 37 industry palettes, font pairings, layout patterns, anti-patterns. Use when asked for /design advice, industry-specific UI recommendations, color palettes, typography, or page structure.
---

# Design Advisor

## Overview
Industry-specific UI/UX recommendations in seconds. Searches design data files to give actionable recommendations with hex codes, font pairings, layout patterns, and anti-pattern warnings.

## Workflow
1. Identify the industry/product type from the user's request
2. Read relevant CSV data files in `.claude/skills/design/data/`
3. Cross-reference with design vocabulary for proper terminology
4. Present structured recommendations with implementation details

## Data Files
Search these CSV files based on what the user needs:
- `colors.csv` — 37 industry color palettes (primary, secondary, CTA, bg, text, border)
- `typography.csv` — 19 font pairings with mood, use cases, Google Fonts links
- `ui-reasoning.csv` — 20 industry design patterns + anti-patterns with severity
- `styles.csv` — 10 visual design styles and implementation details
- `landing.csv` — 11 landing page layout patterns and CTA strategies
- `ux-guidelines.csv` — 22 UX do/don't rules with code examples
- `charts.csv` — 11 data visualization recommendations

## Output Format
Structure your response as:

### 1. Style Direction
Recommended visual style and why it fits this industry.

### 2. Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#...` | Headers, key UI |
| Secondary | `#...` | Hover, supporting |
| CTA | `#...` | Buttons, links |
| Background | `#...` | Page bg |
| Text | `#...` | Body text |
| Border | `#...` | Cards, dividers |

### 3. Typography
- **Heading:** Font name (reason)
- **Body:** Font name (reason)
- **Google Fonts:** [Click to load both fonts](url)
- **Tailwind:** `font-family: 'Font', sans-serif`

### 4. Page Structure
Section order with CTA placement strategy.

### 5. Key Effects
Specific animations and interactions with CSS/Tailwind examples.

### 6. Anti-Patterns to Avoid
| Pattern | Severity | Why |
|---------|----------|-----|
| ... | HIGH | ... |

### 7. Next Step
Suggest a specific implementation starting point.

## Rules
- Always return exact hex codes, never vague color names
- Always include a Google Fonts URL for the typography recommendation
- Flag HIGH severity anti-patterns first and in bold
- If industry not found in CSV, derive from closest match and note it
- Be specific: not "use blue" but "use #2563EB for headers, #3B82F6 for hover"
- For EUCX specifically: always use the existing design system tokens from `design-system/eucx/MASTER.md`
