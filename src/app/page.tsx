import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrayerTimes } from "@/components/PrayerTimes";
import { Star8, btnPrimary, btnGhost } from "@/components/ui";

const MODULES = [
  { title: "Enrolment & Classes", desc: "Register students and organise Qur'an, hifz, tajweed and Islamic studies classes across every center." },
  { title: "Attendance", desc: "Mark the roll in seconds, record late arrivals and excused absences, and see attendance history per child." },
  { title: "Fees & Payments", desc: "Issue tuition and book invoices, let parents pay online, and track what is outstanding at a glance." },
  { title: "Progress Reports", desc: "Record hifz by surah and ayah, tilawah, Arabic and Islamic studies grades — shared with parents instantly." },
  { title: "Events & Permissions", desc: "Eid programs and excursions with digital permission slips parents answer from their phone." },
  { title: "Announcements", desc: "Reach every parent or teacher in the community with center-wide notices." },
] as const;

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="arch flex h-9 w-8 items-end justify-center bg-primary pb-1.5 text-white">
            <Star8 className="h-3.5 w-3.5" />
          </span>
          <span className="font-display text-xl text-ink">Tarbiyah</span>
        </div>
        <Link href="/login" className={btnGhost}>
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-10 text-center sm:px-6 sm:pt-16">
        <p className="font-arabic text-3xl leading-relaxed text-gold sm:text-4xl" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-tight text-ink sm:text-5xl">
          Run your Islamic teaching center with <span className="text-primary">barakah</span>, not
          paperwork.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
          Tarbiyah (تربية) brings enrolment, attendance, fees, hifz progress, events and parent
          communication into one place — for one madrasah or a whole network of centers.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className={btnPrimary}>
            Sign in to your center
          </Link>
          <Link href="/qibla" className={btnGhost}>
            Qibla locator
          </Link>
        </div>
      </section>

      {/* Prayer times band */}
      <section className="pattern-band px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="font-display text-xl text-ink">Today&rsquo;s Adhan timings</h2>
            <span className="font-arabic text-lg text-gold" dir="rtl">
              مواقيت الصلاة
            </span>
          </div>
          <PrayerTimes />
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center font-display text-3xl text-ink">Everything a maktab needs</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink-soft">
          Modelled on the tools modern schools rely on, rebuilt around the rhythm of the deen.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div key={m.title} className="arch-card border border-line bg-white px-6 pb-5 pt-7">
              <Star8 className="h-4 w-4 text-gold" />
              <h3 className="mt-3 font-display text-lg text-ink">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-line bg-mist/50 px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-6 text-center sm:grid-cols-3">
          <div>
            <h3 className="font-display text-lg text-primary">For administrators</h3>
            <p className="mt-1.5 text-sm text-ink-soft">
              Manage students, teachers, classes and fees for one center — or every branch — from one
              dashboard.
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg text-primary">For teachers</h3>
            <p className="mt-1.5 text-sm text-ink-soft">
              Mark attendance, record each student&rsquo;s hifz and akhlaq, and keep parents in the
              loop without extra admin.
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg text-primary">For parents</h3>
            <p className="mt-1.5 text-sm text-ink-soft">
              See your children&rsquo;s progress and attendance, pay fees, and respond to permission
              slips in one tap.
            </p>
          </div>
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-xs text-ink-soft">
        <span className="font-arabic text-sm text-gold" dir="rtl">
          رَبِّ زِدْنِي عِلْمًا
        </span>
        <span className="mx-2">·</span>
        Tarbiyah — administration for Islamic teaching centers
      </footer>
    </div>
  );
}
