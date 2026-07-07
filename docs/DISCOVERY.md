# Tarbiyah — Discovery & Product Spec

## 1. R&D: What is School Bytes?

School Bytes (schoolbytes.education, a Compass company) is an all-in-one school
administration platform used by NSW public schools in Australia. Research findings:

### Modules
| Module | What it does |
| --- | --- |
| **Student Finance** | One-stop shop for student payments/fees (integrated with SAP) |
| **Parent Communication** | Bulk personalised email/SMS — newsletters, notifications |
| **Event Management** | Excursions/incursions lifecycle: staff submission → executive approval → online parent permission notes |
| **Attendance** | Mark a roll, late arrivals / early leavers, absence communication, attendance reports |
| **Forms** | Flexible forms for parents/students/staff when a specific response is required |
| **Medical** | Sick-bay records, medication requirements, health-care plans, conditions |
| **Wellbeing** | Behaviour administration: positive/neutral/negative records, suspensions, parent communication |
| **Academic Reports** | Staff create student reports; admins configure subjects, outcomes, grading scales |
| **School Organisation** | Calendars, Meetings, Resources, Task List |
| **Sport Selection** | Students select activity choices online |
| **Parent Portal** | Account linked to all children; documents, calendar feeds, news, payments, attendance, forms, parent-teacher interview bookings |

### User types
- **School staff** — admins configure; teachers mark rolls, record behaviour, submit events
- **Parents/carers** — portal + app: pay, respond to permission notes, view attendance/reports
- **Students** — limited self-service (activity selection)

## 2. Adaptation: Tarbiyah (تربية)

*Tarbiyah* — Arabic for nurturing/education — is the same platform re-imagined for
**Islamic religious teaching classes (madrasah / maktab)**, usable by **multiple centers**
(multi-tenant).

### Roles
| School Bytes | Tarbiyah |
| --- | --- |
| Platform admin | **Super Admin** — manages all centers |
| School admin | **Center Admin** — manages one center |
| Teacher | **Teacher (Ustadh/Ustadha)** |
| Parent/carer | **Parent** — linked to their children |
| Student | **Student** — record entity (portal via parent) |

### Module mapping
| School Bytes | Tarbiyah equivalent |
| --- | --- |
| Student Finance | **Fees** — invoices per student (tuition, books), payment recording, status |
| Parent Communication | **Announcements** — center-wide or class-scoped notices to parents |
| Event Management | **Events & Permissions** — Eid programs, trips; parent permission responses |
| Attendance | **Attendance** — per-class roll: present/absent/late/excused, reports |
| Academic Reports | **Progress** — Qur'an memorisation (hifz) by surah/ayah, tilawah, Islamic studies grades |
| Wellbeing | **Akhlaq notes** — positive/neutral/negative behaviour records |
| Class Builder | **Classes** — e.g. "Hifz Level 1", teacher + weekly schedule |
| School Organisation | **Calendar** — events + class schedule view |
| Parent Portal | **Parent portal** — children, attendance, fees, progress, events, announcements |

### New Islamic utilities (not in School Bytes)
- **Adhan timings** — daily prayer times per center location (AlAdhan API), shown on the
  dashboard and a dedicated page; next-prayer countdown.
- **Qibla locator** — utility page computing the great-circle bearing to the Kaaba
  (21.4225°N, 39.8262°E) from device location, with a live device-orientation compass
  where supported and a numeric bearing fallback.

### Multi-center
Every record is scoped by `centerId`. Center admins/teachers/parents only see their
center. A Super Admin can create and manage centers. Each center stores its city,
coordinates and prayer-calculation method for Adhan timings.

## 3. Tech stack
- **Next.js (App Router) + TypeScript** — one deployable, API routes as backend
- **Tailwind CSS** — mobile-first responsive UI
- **Prisma + SQLite** — zero-infra persistent database, easily swapped for Postgres
- **Cookie-session auth** (bcrypt password hashes, signed HttpOnly session cookie), role-based access
- **AlAdhan API** for prayer times (no key required)

## 4. Theme
- White background, **green primary** (deep emerald `#046A38` family)
- Islamic visual language: geometric star/arabesque pattern accents, arch (mihrab-style)
  shapes, **Amiri** calligraphic font for Arabic accents (e.g. بسم الله), Latin UI in a
  clean humanist sans
- Fully mobile-responsive; bottom-friendly navigation on small screens

## 5. Demo data
Seeded with two centers (e.g. *Al-Noor Islamic Center*, *Masjid Al-Falah Academy*),
one super admin, per-center admins, teachers, parents, students, classes, attendance,
fees, announcements, events, progress and behaviour records. Demo credentials are
printed by the seed script and listed in the README.
