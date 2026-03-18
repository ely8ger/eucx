# HSBC.de — Extrahiertes Design-System
> Quelle: https://www.hsbc.de (HSBC PWS Framework)
> Extrahiert: 2026-03-18
> Angepasst für EUCX: Blau (#154194) ersetzt HSBC-Rot (#DB0011)

---

## Farben — HSBC-Adaption für EUCX

| Rolle | HSBC Original | EUCX-Adaption |
|-------|--------------|---------------|
| Primary | `#DB0011` | `#154194` |
| Primary Hover | `#b1000e` | `#0f3070` |
| Primary Active | `#5e0009` | `#0a2050` |
| Background | `#ffffff` | `#ffffff` |
| Surface | `#ededed` | `#f5f5f5` |
| Feature Card | `#3e505d` | `#1e3a5f` |
| Text Primary | `#333333` | `#1a1a1a` |
| Text Secondary | `#505050` | `#505050` |
| Text Muted | `#6d6d6d` | `#6d6d6d` |
| Border | `#c6c6c6` | `#d0d0d0` |
| Footer BG | `#404040` | `#1a1a1a` |

## Typografie

- **Font:** IBM Plex Sans (Univers Next → nächste Google Fonts Alternative)
- **Base:** 16px body, rem-Scale
- **H1:** 48–64px, weight 300 (light — HSBC-typisch)
- **H2:** 28–32px, weight 400
- **H3:** 20–24px, weight 500
- **Body:** 16px, weight 400, line-height 1.5
- **Button/Label:** 14px, weight 400

## Komponenten-Regeln

### Border-Radius
- Buttons: `0` (komplett eckig — HSBC-Markenzeichen)
- Cards: `0`
- Inputs: `0`
- Ausnahme: Suchfeld `3px`

### Buttons
```css
/* Primary */
background: #154194; border: 1px solid #154194; color: white;
padding: 12px 24px; font-size: 14px; border-radius: 0;
hover: background #0f3070;

/* Outline */
background: transparent; border: 1px solid white; color: white;
/* Outline Dark */
background: transparent; border: 1px solid #154194; color: #154194;
```

### Header/Navigation
```css
box-shadow: 0 1px 4px 0 rgba(0,0,0,.2);
height: 60px;
border-top: 3px solid #154194; /* Marken-Akzentlinie oben */
```

### Cards/Sections
```css
/* Standard */
background: white; padding: 40px 20px;

/* Feature (dunkel) */
background: #1e3a5f; color: white; padding: 32px;

/* Surface */
background: #f5f5f5; padding: 32px;
```

### Container
```css
max-width: 1180px; margin: 0 auto; padding: 0 20px;
```

### Schatten
```css
Header:    0 1px 4px 0 rgba(0,0,0,.2)
Cards:     0 2px 4px rgba(0,0,0,.1)
Page-wrap: 0 0 5px 0 rgba(0,0,0,.15)
```

### Transitions
```css
Buttons:    background .2s ease, color .2s ease
Nav:        margin-left .3s
Accordion:  background .2s
```

## Layout

- Grid: 12-spaltig
- Breakpoints: 420 / 640 / 960 / 1024 / 1120 / 1180px
- Section-Abstände: 60–80px vertikal
- Innenabstand: 20px (mobile), 40px (desktop)
