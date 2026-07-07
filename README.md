# Tarbiyah — تربية

Administration platform for Islamic teaching centers (madrasah / maktab), inspired by
[School Bytes](https://www.schoolbytes.education/) and rebuilt around the rhythm of the deen.
Multi-center, mobile-responsive, white + emerald green with Islamic calligraphy accents.

See [docs/DISCOVERY.md](docs/DISCOVERY.md) for the R&D on School Bytes and how each module maps.

## Features

- **Multi-center (multi-tenant)** — every record is scoped to a center; a Super Admin manages all centers
- **Roles** — Super Admin, Center Admin, Teacher (Ustadh/Ustadha), Parent
- **Students & classes** — enrolment, rosters, teachers, schedules, medical notes
- **Attendance** — one-tap roll marking (present / absent / late / excused) with notes and history
- **Fees** — invoices per student, parent "pay now" (demo), admin payment recording, outstanding totals
- **Progress** — hifz by surah/ayah, tilawah, Islamic studies and Arabic grades, shared with parents
- **Akhlaq / behaviour notes** — positive, neutral, negative records
- **Announcements** — center-wide notices with audience targeting (all / parents / teachers)
- **Events & permission slips** — parents respond per child; staff track responses
- **Adhan timings** — daily prayer times (AlAdhan API) with Hijri date and next-prayer countdown, per center location and per your own location
- **Qibla locator** — great-circle bearing to the Kaaba with a live device-orientation compass on phones

## Stack

Next.js (App Router) + TypeScript · Tailwind CSS v4 · Prisma + SQLite · cookie-session auth (bcrypt)

## Getting started

```bash
pnpm install
pnpm db:push     # create prisma/dev.db from the schema
pnpm db:seed     # demo centers, users, students, records
pnpm dev         # http://localhost:3000
```

## Demo accounts (password: `tarbiyah123`)

| Email | Role |
| --- | --- |
| `super@tarbiyah.app` | Super Admin (all centers) |
| `admin@alnoor.example` | Center Admin — Al-Noor Islamic Center (Sydney) |
| `admin@alfalah.example` | Center Admin — Masjid Al-Falah Academy (Melbourne) |
| `ahmad@alnoor.example` / `maryam@alnoor.example` | Teachers — Al-Noor |
| `bilal@alfalah.example` | Teacher — Al-Falah |
| `parent@alnoor.example` / `ibrahim@alnoor.example` | Parents — Al-Noor |
| `parent@alfalah.example` | Parent — Al-Falah |
