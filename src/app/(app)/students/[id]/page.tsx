import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { createBehavior, createProgress, payInvoice } from "@/lib/actions";
import { formatDate, formatMoney, fullName, todayISO } from "@/lib/format";
import {
  GRADES, GRADE_LABELS, PROGRESS_TYPES, PROGRESS_TYPE_LABELS, SURAHS,
} from "@/lib/constants";
import {
  Badge, Card, Field, PageHeader, attendanceTone, behaviorTone, btnPrimary, gradeTone, inputCls,
} from "@/components/ui";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    },
  });
  if (!student) notFound();

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
