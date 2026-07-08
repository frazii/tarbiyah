# Product Requirements Document — Tarbiyah (تربية)

| | |
| --- | --- |
| **Product** | Tarbiyah — administration platform for Islamic teaching centers |
| **Version** | 1.0 (MVP shipped) |
| **Date** | 8 July 2026 |
| **Status** | Living document — §7 tracks delivery status per requirement |
| **Related** | [DISCOVERY.md](DISCOVERY.md) — R&D on School Bytes and module mapping |

## 1. Problem statement

Islamic teaching centers (madrasahs, maktabs, weekend Qur'an schools) run enrolment,
attendance, fee collection, parent communication and student progress on a patchwork of
WhatsApp groups, paper registers and spreadsheets. Mainstream school-administration
platforms such as **School Bytes** solve this for public schools but assume a secular
school's structures (SAP finance, government reporting, sport selection) and none of the
rhythms a Muslim community runs on: Hijri dates, prayer times, hifz tracking, Islamic
etiquette (adab/akhlaq) records.

Tarbiyah gives these centers a School Bytes-class admin platform built around the deen,
usable by a single madrasah or a network of centers.

## 2. Goals & non-goals

### Goals
1. One platform for the daily operations of a teaching center: enrolment, classes,
   attendance, fees, communication, events, progress.
2. **Multi-center from day one** — one deployment serves many independent centers with
   strict data isolation.
3. Serve all four audiences with role-appropriate views: platform operator, center
   admin, teacher, parent.
4. Islamic-first UX: Adhan timings, Qibla locator, Hijri dates, hifz-native progress
   tracking, visual identity rooted in Islamic art (white ground, emerald green,
   calligraphy).
5. Web-first and fully usable on a phone (parents are overwhelmingly mobile users).

### Non-goals (v1)
- Native mobile apps (the responsive web app is the mobile experience).
- Real payment processing (v1 simulates payment; gateway integration is v2).
- Email/SMS delivery (announcements are in-app; outbound channels are v2).
- Government/compliance reporting, timetabling optimisation, payroll.
- Student self-service accounts (parents act for students in v1).

## 3. Users & personas

| Persona | Role in product | Top jobs |
| --- | --- | --- |
| **Platform operator** (Super Admin) | Runs the deployment across all centers | Onboard a new center; create its first admin; see cross-center totals |
| **Center administrator** — e.g. Br. Yusuf, volunteer admin at Al-Noor | ADMIN, scoped to one center | Enrol students; manage classes and staff/parent accounts; issue invoices and track outstanding fees; publish announcements and events |
| **Teacher (Ustadh/Ustadha)** — e.g. Ustadh Ahmad, hifz teacher | TEACHER, scoped to one center | Mark the roll in under a minute; record each student's sabaq/surah progress; note behaviour; see own classes |
| **Parent** — e.g. Sr. Fatima, two children enrolled | PARENT, children linked | See children's attendance and progress; pay fees; answer permission slips; read announcements; check prayer times |

## 4. Functional requirements

Priority: **P0** = must have (MVP), **P1** = should have, **P2** = later.

### 4.1 Authentication & access control
- **FR-1 (P0)** Email + password sign-in; passwords stored as bcrypt hashes; session via
  HttpOnly cookie (30-day expiry, revocable server-side).
- **FR-2 (P0)** Four roles: SUPER_ADMIN, ADMIN, TEACHER, PARENT. Every route and mutation
  enforces role checks server-side.
- **FR-3 (P0)** Tenant isolation: all queries scoped to the user's center; super admin
  sees all centers. Cross-center access attempts redirect away without leaking data.
- **FR-4 (P1)** Password reset by email. *(v2 — currently admin resets by recreating account)*

### 4.2 Centers (multi-tenancy)
- **FR-5 (P0)** Super admin can create centers with name, address, city, country,
  coordinates and prayer-calculation method.
- **FR-6 (P0)** Center coordinates + method drive that center's Adhan timings everywhere
  they are shown.

### 4.3 Students & classes
- **FR-7 (P0)** Admins create/edit students: name, gender, DOB, medical notes, linked
  parent, assigned class.
- **FR-8 (P0)** Medical notes are flagged prominently (list badge + banner on profile).
- **FR-9 (P0)** Admins create classes with name, description, schedule text, teacher.
- **FR-10 (P0)** Class page shows the roster with links to student profiles.
- **FR-11 (P0)** Student profile is the single hub: attendance history, fees, progress
  records, behaviour notes, with staff entry forms inline.

### 4.4 Attendance
- **FR-12 (P0)** Staff select class + date, mark every student Present / Absent / Late /
  Excused with an optional note, in one screen with one save.
- **FR-13 (P0)** Re-loading a marked roll shows saved values and allows correction (upsert).
- **FR-14 (P0)** Teachers see only their own classes in the roll picker; admins see all.
- **FR-15 (P1)** Attendance rate summaries and exportable reports. *(v1 shows per-student history only)*
- **FR-16 (P1)** Automatic absence notification to the parent. *(v2, needs outbound channel)*

### 4.5 Fees
- **FR-17 (P0)** Admins issue invoices (title, description, amount, due date) per student.
- **FR-18 (P0)** Parents see their children's invoices and can pay in-app
  (v1: simulated instant payment, clearly labelled as demo).
- **FR-19 (P0)** Admins can record offline payments ("mark paid") and see outstanding
  totals; overdue invoices are flagged.
- **FR-20 (P1)** Real payment gateway — **Stripe** (decided 8 Jul 2026): checkout per
  invoice, receipts, webhook-driven status updates; per-center Stripe account (Connect).
- **FR-20a (P1)** Per-center currency (decided 8 Jul 2026): each center configures its
  currency (AUD, GBP, USD, PKR…); all invoices and totals for that center display in it.

### 4.6 Progress (academic reports, Islamic-native)
- **FR-21 (P0)** Staff record progress per student: date, type (Hifz / Tilawah / Islamic
  Studies / Arabic), surah + ayah range for Qur'an work (full 114-surah list), grade
  (Mumtaz / Jayyid / Maqbul / Needs Improvement), notes.
- **FR-22 (P0)** Parents see progress on the child's profile; staff see a center-wide
  recent-progress feed.
- **FR-23 (P1)** Hifz completion visualisation (juz'/surah coverage map) and printable
  term reports.

### 4.7 Behaviour (akhlaq)
- **FR-24 (P0)** Staff record positive / neutral / negative notes per student; visible to
  the linked parent on the profile.

### 4.8 Announcements
- **FR-25 (P0)** Staff publish announcements with audience targeting: everyone, parents
  only, teachers only. Audience filtering enforced on read.
- **FR-26 (P1)** Outbound fan-out — **email first** (decided 8 Jul 2026): announcements,
  absence alerts and invoice notices by email; SMS/push deferred until after email ships.
  Per-class targeting alongside.

### 4.9 Events & permission slips
- **FR-27 (P0)** Staff create events (title, description, location, date/time) and flag
  whether parent permission is required.
- **FR-28 (P0)** Parents grant/decline permission per child, from the dashboard or the
  event page; response is recorded with who answered and when.
- **FR-29 (P0)** Staff see a per-event response tally (granted / declined / awaiting) for
  every student in the center.
- **FR-30 (P2)** Staff→executive approval workflow before an event is published
  (School Bytes parity).

### 4.10 Adhan timings
- **FR-31 (P0)** Prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha + sunrise) from the
  AlAdhan API, with Hijri date and a next-prayer countdown.
- **FR-32 (P0)** Shown on: public landing page (visitor's geolocation, Makkah fallback),
  every dashboard (center's coordinates + method), dedicated page (both).

### 4.11 Qibla locator
- **FR-33 (P0)** Compute the great-circle bearing from the user's location to the Kaaba
  (21.4225°N 39.8262°E); show bearing, distance, and a compass rose.
- **FR-34 (P0)** On devices with an orientation sensor, a live compass rotates the needle;
  graceful degradation to a static bearing elsewhere; explicit iOS permission flow.

### 4.12 Administration
- **FR-35 (P0)** Center admins create teacher/parent accounts for their center; super
  admin creates any account for any center.

## 5. Non-functional requirements

- **NFR-1 Responsive**: every screen usable at 390 px; drawer nav on mobile, sidebar ≥ lg.
- **NFR-2 Theme**: white background; emerald `#046A38` primary; brass `#C8A24B` reserved
  for calligraphic accents; Marcellus display / Karla body / Amiri Arabic; mihrab-arch
  signature shapes and eight-point-star pattern. No dark mode in v1.
- **NFR-3 Accessibility**: semantic forms with labels, keyboard-visible focus, reduced-
  motion respected, radio groups labelled per student.
- **NFR-4 Security**: server-side authorization on every action; HttpOnly SameSite=Lax
  cookies; no client-trusted role checks.
- **NFR-5 Portability**: SQLite for zero-infra local/dev; Prisma schema swaps to Postgres
  for production hosting without app changes.
- **NFR-6 Seed/demo**: one command seeds two realistic centers and all record types.

## 6. Success metrics (post-launch)

- A center can go from zero to first marked roll in under 15 minutes.
- ≥ 80 % of permission slips answered digitally within 72 h of event publication.
- ≥ 70 % of invoices paid/recorded through the platform within a term.
- Weekly active parents ≥ 50 % of linked parent accounts.

## 7. Delivery status (v1 audit — 8 Jul 2026)

| Area | Status |
| --- | --- |
| Auth, roles, tenant isolation (FR-1–3, 5, 6, 35) | ✅ Shipped & verified E2E |
| Students, classes, profiles (FR-7–11) | ✅ Shipped |
| Attendance marking + history (FR-12–14) | ✅ Shipped & verified E2E |
| Fees: issue, pay (demo), record, overdue (FR-17–19) | ✅ Shipped & verified E2E |
| Progress + behaviour (FR-21, 22, 24) | ✅ Shipped |
| Announcements with audiences (FR-25) | ✅ Shipped |
| Events + permission slips + tally (FR-27–29) | ✅ Shipped & verified E2E |
| Adhan timings, Qibla locator (FR-31–34) | ✅ Shipped & verified E2E |
| Password reset (FR-4), reports (FR-15, 23), notifications (FR-16, 26), real payments (FR-20), approval workflow (FR-30) | ⏳ Backlog (P1/P2) |

## 8. Roadmap (beyond v1)

1. **Payments v2** — Stripe checkout + per-center currency (FR-20/20a), receipts,
   sibling discounts.
2. **Outbound communication** — email first (FR-26); SMS absence alerts and web push later.
3. **Reports** — attendance analytics, printable hifz term reports, juz' coverage map.
4. **Forms module** — generic response-required forms (School Bytes parity).
5. **Calendar view** — month grid combining events, class schedules and Islamic dates.
6. **Ramadan mode** — automatic timetable shifts and iftar/taraweeh event templates.
7. **Student portal** — read-only progress and sabaq for older students.
8. **Postgres + hosted deployment** — multi-center SaaS with per-center subdomains.

## 9. Decisions log

Resolved 8 Jul 2026 (product owner):

| Question | Decision |
| --- | --- |
| Payment processing | **Stripe integration** (FR-20) — real checkout with receipts; per-center accounts |
| Parent onboarding | **Admin-invited only** — current behavior confirmed; no self-registration in scope |
| First outbound channel | **Email** (FR-26) — SMS and web push deferred until email ships |
| Currency | **Per-center currency** (FR-20a) — configured on the center, drives all money display |

## 10. Open questions

- Hijri date is sourced from AlAdhan; do centers need a manual ±1 day moon-sighting offset?
- Data retention/export obligations per country of operation.
- Stripe: platform-level account with Connect for centers, or each center brings its own
  Stripe keys?
