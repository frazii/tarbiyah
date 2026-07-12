# Tarbiyah — Demo Login Credentials

App URL (local): **http://localhost:3199** (production build) or `pnpm dev` → http://localhost:3000

**Password for every account:** `tarbiyah123`

## Platform

| Email | Role | Scope |
| --- | --- | --- |
| `super@tarbiyah.app` | Super Admin | All centers — manage centers, all accounts, see everything |

## Al-Noor Islamic Center (Sydney, Australia)

| Email | Role | Notes |
| --- | --- | --- |
| `admin@alnoor.example` | Center Admin | Br. Yusuf Rahman — students, classes, fees, accounts |
| `ahmad@alnoor.example` | Teacher | Ustadh Ahmad Siddiqui — teaches Hifz Level 1 |
| `maryam@alnoor.example` | Teacher | Ustadha Maryam Hassan — Tajweed & Tilawah, Islamic Studies |
| `parent@alnoor.example` | Parent | Fatima Ali — children: Zayd, Ruqayyah |
| `ibrahim@alnoor.example` | Parent | Ibrahim Malik — children: Hamza, Sumayyah |

## Masjid Al-Falah Academy (Melbourne, Australia)

| Email | Role | Notes |
| --- | --- | --- |
| `admin@alfalah.example` | Center Admin | Sr. Khadijah Omar |
| `bilal@alfalah.example` | Teacher | Ustadh Bilal Khan — Qur'an Foundation |
| `parent@alfalah.example` | Parent | Aisha Begum — child: Yahya |

## Darul Ilm Institute (Brisbane, Australia) — onboarded via Platform Portal

| Email | Role | Notes |
| --- | --- | --- |
| `admin@darulilm.example` | Center Admin | Bilal Khan — created through Portal → Onboard a center (not in the seed) |

## Notes

- These are **seeded demo accounts** (`pnpm db:seed` recreates them and resets all data).
- Passwords are stored as bcrypt hashes; `tarbiyah123` is set in `prisma/seed.ts`.
- New accounts are created from **Administration** (admins add teachers/parents for
  their center; the super admin can add anyone, including other center admins).
