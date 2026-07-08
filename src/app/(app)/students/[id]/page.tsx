import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { createBehavior, createProgress, payInvoice, reportAbsence } from "@/lib/actions";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { formatDate, formatMoney, fullName, todayISO } from "@/lib/format";
import {
  GRADES, GRADE_LABELS, PROGRESS_TYPES, PROGRESS_TYPE_LABELS, SURAHS,
} from "@/lib/constants";
import {
  Badge, Card, Field, PageHeader, attendanceTone, behaviorTone, btnPrimary, gradeTone, inputCls,
} from "@/components/ui";

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month: monthParam } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(monthParam ?? "") ? monthParam! : todayISO().slice(0, 7);
  const user = await requireUser();
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      parent: true,
      center: true,
      attendance: { orderBy: { date: "desc" }, take: 12, include: { class: true } },
      invoices: { orderBy: { createdAt: "desc" } },
      progress: { orderBy: [{ date: "desc" }, { createdAt: "desc" }], include: { teacher: true } },
      behavior: { orderBy: { createdAt: "desc" }, include: { author: true } },
      absenceNotices: { orderBy: { dateFrom: "desc" }, take: 10, include: { submittedBy: true } },
    },
  });
  if (!student) notFound();

  const monthRecords = await prisma.attendanceRecord.findMany({
    where: { studentId: id, date: { startsWith: month } },
  });
  const monthNotices = await prisma.absenceNotice.findMany({
    where: { studentId: id, dateFrom: { lte: `${month}-31` }, dateTo: { gte: `${month}-01` } },
  });
  const calendarDays = new Map<string, { status?: string; note?: string | null; reported?: boolean }>();
  for (const r of monthRecords) calendarDays.set(r.date, { status: r.status, note: r.note });
  for (const n of monthNotices) {
    const from = n.dateFrom > `${month}-01` ? n.dateFrom : `${month}-01`;
    const to = n.dateTo < `${month}-31` ? n.dateTo : `${month}-31`;
    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      calendarDays.set(iso, { ...calendarDays.get(iso), reported: true });
    }
  }

  const staff = isStaff(user);
  const canView =
    user.role === "SUPER_ADMIN" ||
    (staff && student.centerId === user.centerId) ||
    (user.role === "PARENT" && student.parentId === user.id);
  if (!canView) redirect("/dashboard");

  const presentCount = student.attendance.filter((a) => a.status === "PRESENT").length;

  return (
    <div>
      <PageHeader
        title={fullName(student)}
        subtitle={`${student.class?.name ?? "No class"} · ${student.center.name}${
          student.parent ? ` · Parent: ${student.parent.name}` : ""
        }`}
      />

      {student.medicalNotes && (
        <div className="mb-5 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm">
          <p className="font-semibold text-danger">Medical notes</p>
          <p className="mt-0.5 text-ink">{student.medicalNotes}</p>
        </div>
      )}

      {/* Attendance calendar + absence reporting */}
      <Card className="mb-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg">
            Attendance calendar <span className="font-arabic text-base text-gold" dir="rtl">الحضور</span>
          </h2>
        </div>
        <AttendanceCalendar month={month} days={calendarDays} baseHref={`/students/${student.id}`} />

        <form action={reportAbsence} className="mt-5 space-y-3 border-t border-line pt-4">
          <p className="text-sm font-semibold">
            {user.role === "PARENT" ? "Report an upcoming absence" : "Record a reported absence"}
          </p>
          <p className="text-xs text-ink-soft">
            {user.role === "PARENT"
              ? "Let the teachers know ahead of time — the roll will show your child as excused for these dates."
              : "Log an absence a parent communicated to you (call, in person)."}
          </p>
          <input type="hidden" name="studentId" value={student.id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="From">
              <input name="dateFrom" type="date" required defaultValue={todayISO()} className={inputCls} />
            </Field>
            <Field label="To (optional)">
              <input name="dateTo" type="date" className={inputCls} />
            </Field>
            <Field label="Reason">
              <input name="reason" required className={inputCls} placeholder="e.g. Family travel, unwell" />
            </Field>
          </div>
          <button className={btnPrimary}>Submit absence notice</button>
        </form>

        {student.absenceNotices.length > 0 && (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {student.absenceNotices.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-sm">
                  {formatDate(n.dateFrom)}
                  {n.dateTo !== n.dateFrom && ` – ${formatDate(n.dateTo)}`}
                  <span className="text-ink-soft"> — {n.reason}</span>
                </span>
                <span className="text-xs text-ink-soft">by {n.submittedBy.name}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Attendance */}
        <Card>
          <h2 className="mb-3 font-display text-lg">
            Attendance{" "}
            <span className="text-sm text-ink-soft">
              (last {student.attendance.length} — {presentCount} present)
            </span>
          </h2>
          <ul className="divide-y divide-line">
            {student.attendance.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <span className="text-sm">
                  {formatDate(a.date)} <span className="text-ink-soft">· {a.class.name}</span>
                  {a.note && <span className="block text-xs text-ink-soft">{a.note}</span>}
                </span>
                <Badge tone={attendanceTone(a.status)}>{a.status.toLowerCase()}</Badge>
              </li>
            ))}
            {student.attendance.length === 0 && (
              <li className="py-2 text-sm text-ink-soft">No attendance recorded yet.</li>
            )}
          </ul>
        </Card>

        {/* Fees */}
        <Card>
          <h2 className="mb-3 font-display text-lg">Fees</h2>
          <ul className="divide-y divide-line">
            {student.invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-sm">
                  {inv.title} — <strong>{formatMoney(inv.amountCents)}</strong>
                  <span className="block text-xs text-ink-soft">
                    {inv.status === "PAID"
                      ? `Paid ${inv.paidAt ? formatDate(inv.paidAt) : ""} (${inv.paymentMethod ?? "—"})`
                      : `Due ${formatDate(inv.dueDate)}`}
                  </span>
                </span>
                {inv.status === "PAID" ? (
                  <Badge tone="green">Paid</Badge>
                ) : user.role === "PARENT" ? (
                  <form action={payInvoice}>
                    <input type="hidden" name="id" value={inv.id} />
                    <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">
                      Pay now
                    </button>
                  </form>
                ) : (
                  <Badge tone="amber">Pending</Badge>
                )}
              </li>
            ))}
            {student.invoices.length === 0 && <li className="py-2 text-sm text-ink-soft">No invoices.</li>}
          </ul>
        </Card>
      </div>

      {/* Progress */}
      <Card className="mt-4">
        <h2 className="mb-3 font-display text-lg">
          Learning progress <span className="font-arabic text-base text-gold" dir="rtl">التقدم</span>
        </h2>
        <ul className="divide-y divide-line">
          {student.progress.map((p) => (
            <li key={p.id} className="py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  {PROGRESS_TYPE_LABELS[p.type as keyof typeof PROGRESS_TYPE_LABELS] ?? p.type}
                  {p.surah && (
                    <span className="font-normal">
                      {" "}— Surah {p.surah}
                      {p.ayahFrom && p.ayahTo ? ` (${p.ayahFrom}–${p.ayahTo})` : ""}
                    </span>
                  )}
                </span>
                <Badge tone={gradeTone(p.grade)}>
                  {GRADE_LABELS[p.grade as keyof typeof GRADE_LABELS] ?? p.grade}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-ink-soft">
                {formatDate(p.date)} · {p.teacher.name}
                {p.notes && ` — ${p.notes}`}
              </p>
            </li>
          ))}
          {student.progress.length === 0 && (
            <li className="py-2 text-sm text-ink-soft">No progress records yet.</li>
          )}
        </ul>

        {staff && (
          <form action={createProgress} className="mt-4 space-y-3 border-t border-line pt-4">
            <p className="text-sm font-semibold">Record progress</p>
            <input type="hidden" name="studentId" value={student.id} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Date">
                <input name="date" type="date" defaultValue={todayISO()} required className={inputCls} />
              </Field>
              <Field label="Type">
                <select name="type" className={inputCls}>
                  {PROGRESS_TYPES.map((t) => (
                    <option key={t} value={t}>{PROGRESS_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </Field>
              <Field label="Grade">
                <select name="grade" className={inputCls}>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{GRADE_LABELS[g]}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Surah (for Qur'an work)">
                <select name="surah" className={inputCls}>
                  <option value="">—</option>
                  {SURAHS.map((s, i) => (
                    <option key={s} value={s}>{i + 1}. {s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Ayah from">
                <input name="ayahFrom" type="number" min="1" className={inputCls} />
              </Field>
              <Field label="Ayah to">
                <input name="ayahTo" type="number" min="1" className={inputCls} />
              </Field>
            </div>
            <Field label="Notes">
              <input name="notes" className={inputCls} placeholder="e.g. Strong retention, revise madd rules" />
            </Field>
            <button className={btnPrimary}>Save progress</button>
          </form>
        )}
      </Card>

      {/* Behaviour */}
      <Card className="mt-4">
        <h2 className="mb-3 font-display text-lg">
          Akhlaq &amp; behaviour <span className="font-arabic text-base text-gold" dir="rtl">الأخلاق</span>
        </h2>
        <ul className="divide-y divide-line">
          {student.behavior.map((b) => (
            <li key={b.id} className="py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm">{b.note}</span>
                <Badge tone={behaviorTone(b.type)}>{b.type.toLowerCase()}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-ink-soft">
                {formatDate(b.createdAt)} · {b.author.name}
              </p>
            </li>
          ))}
          {student.behavior.length === 0 && (
            <li className="py-2 text-sm text-ink-soft">No behaviour notes.</li>
          )}
        </ul>

        {staff && (
          <form action={createBehavior} className="mt-4 space-y-3 border-t border-line pt-4">
            <p className="text-sm font-semibold">Add note</p>
            <input type="hidden" name="studentId" value={student.id} />
            <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
              <Field label="Type">
                <select name="type" className={inputCls}>
                  <option value="POSITIVE">Positive</option>
                  <option value="NEUTRAL">Neutral</option>
                  <option value="NEGATIVE">Negative</option>
                </select>
              </Field>
              <Field label="Note">
                <input name="note" required className={inputCls} placeholder="What happened?" />
              </Field>
            </div>
            <button className={btnPrimary}>Save note</button>
          </form>
        )}
      </Card>
    </div>
  );
}
