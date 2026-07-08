# DESIGN.md — Tarbiyah

## Color tokens (Tailwind v4 @theme, globals.css)
- primary #046a38 (emerald) / primary-dark #03502b / primary-soft #e3efe7
- secondary #1b5fa8 (blue) / secondary-dark #12477f / secondary-soft #e6eef8
- gold #c8a24b (Arabic calligraphy only) / gold-soft #f7f0df
- ink #16261d (text) / ink-soft #5b6f63 (secondary text)
- mist #f3f8f4 (canvas) / line #dde8df (borders)
- danger #b3382c / danger-soft #fbeae8; amber #9a6b15 / amber-soft #faf1dd

## Typography
- Display: Marcellus (Latin serif) — page titles, stat numbers, card headings
- Body/UI: Karla — everything else
- Arabic: Amiri, gold color, dir="rtl", one accent per view

## Layout system
- Shell: white top bar (brand / center / avatar + sign out), 240px icon sidebar
  (desktop), drawer nav (mobile), content max-w-5xl on mist/40 canvas
- Cards: white, border-line, rounded-xl, p-5
- Signature shapes: .arch (mihrab, used for prayer niches + logo), .arch-card
  (arched top corners, used on landing/empty states)
- Pattern: eight-point star lattice SVG; landing band = green→blue gradient underlay

## Components (src/components/ui.tsx)
- btnPrimary (green solid), btnGhost (outline), inputCls, Field, Card, PageHeader
  (title + optional Arabic + subtitle + action), Badge (green/gold/red/amber/neutral),
  StatCard (accent bar green/blue), EmptyState, Star8
- ModuleTiles: icon squares alternating primary/secondary soft fills
- AttendanceCalendar: month grid, status colors, gold dot = reported absence
- PrayerTimes: arch niches, active prayer = solid green
- Icons: src/components/icons.tsx, 1.7px stroke, round caps

## Interaction
- Server-action forms, full-page transitions; chips with has-checked styling for
  attendance radio groups
- Focus: ring-2 ring-primary/40+ on inputs and primary buttons
