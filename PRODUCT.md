# PRODUCT.md — Tarbiyah (تربية)

## Product purpose
Administration platform for Islamic teaching centers (madrasah/maktab): enrolment,
classes, attendance, fees, hifz progress, akhlaq notes, announcements, events with
permission slips, plus Adhan timings and a Qibla locator. Multi-center (multi-tenant).
Source spec: docs/PRD.md.

## Register
product — app UI (portal/dashboard). Design serves daily administrative work.
The public landing page is the one brand surface.

## Users
- Center admins (often volunteers, not tech-savvy) — desktop + mobile
- Teachers (Ustadh/Ustadha) marking rolls on phones/tablets in class
- Parents — overwhelmingly on phones, quick tasks: check child, pay fee, answer slip
- Super admin (platform operator) — rare, desktop

## Brand & tone
Calm, trustworthy, unhurried; institutional but warm ("run your center with barakah").
Islamic visual identity: mihrab-arch shapes, eight-point star lattice, Amiri Arabic
calligraphy accents in brass gold. UI copy plain and directive, sentence case,
occasional transliterated Islamic vocabulary (hifz, akhlaq) used naturally.

## Visual constraints (user-mandated)
- White/light surfaces; palette is a mix of **emerald green** (primary, #046A38 family)
  and **blue** (secondary, #1B5FA8 family); brass gold reserved for Arabic calligraphy.
- Overall layout intentionally mirrors School Bytes' portal: white top bar, icon
  sidebar, module tile grid, card/table content. Do not redesign this structure.
- Mobile responsiveness is a hard requirement.

## Anti-references
- Crypto/neon dashboards, dark-mode-by-default admin tools
- Generic bootstrap-admin look; hero-metric gradient SaaS clichés
- Orientalist kitsch (excessive ornament, faux-Arabic Latin fonts)

## Strategic principles
1. A teacher marks a full roll in under a minute on a phone.
2. A parent completes any task (pay, permit, report absence) in ≤2 taps from dashboard.
3. Arabic accents are seasoning, not decoration walls — one per view maximum rule of thumb.
4. Data tables must stay legible for volunteer admins: strong headers, generous rows.
