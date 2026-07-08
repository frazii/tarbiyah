import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { saveAttendance } from "@/lib/actions";
import { fullName, todayISO } from "@/lib/format";
import { ATTENDANCE_STATUSES, ATTENDANCE_LABELS } from "@/lib/constants";
import { Card, EmptyState, PageHeader, btnPrimary, inputCls } from "@/components/ui";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string; saved?: string }>;
}) {
  const user = await requireUser();
  if (!isStaff(user)) redirect("/dashboard");
  const { classId, date: dateParam, saved } = await searchParams;
  const date = dateParam || todayISO();

  const classes = await prisma.classRoom.findMany({
    where: user.role === "TEACHER" ? { teacherId: user.id } : centerScope(user),
    orderBy: { name: "asc" },
  });
  const selected = classId ? classes.find((c) => c.id === classId) : undefined;

  const students = selected
    ? await prisma.student.findMany({
        where: { classId: selected.id },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          attendance: { where: { classId: selected.id, date } },
          absenceNotices: {
            where: { dateFrom: { lte: date }, dateTo: { gte: date } },
            include: { submittedBy: true },
          },
        },
      })
    : [];

  return (
    <div>
      <PageHeader title="Attendance" arabic="الحضور" subtitle="Mark the roll for a class and date" />

      <Card className="mb-5">
        <form method="get" className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Class</span>
            <select name="classId" defaultValue={classId ?? ""} className={inputCls}>
              <option value="" disabled>
                Choose a class
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Date</span>
            <input name="date" type="date" defaultValue={date} className={inputCls} />
          </label>
          <div className="flex items-end">
            <button className={btnPrimary}>Load roll</button>
          </div>
        </form>
      </Card>

      {saved && (
        <p className="mb-4 rounded-lg bg-primary-soft px-4 py-3 text-sm font-semibold text-primary-dark">
          Roll saved for {date}.
        </p>
      )}

      {!selected ? (
        <EmptyState title="Choose a class to mark the roll" hint="Select a class and date above, then load the roll." />
      ) : students.length === 0 ? (
        <EmptyState title="No students in this class" hint="Enrol students into the class first." />
      ) : (
        <Card>
          <h2 className="mb-4 font-display text-lg">
            {selected.name} — {date}
          </h2>
          <form action={saveAttendance}>
            <input type="hidden" name="classId" value={selected.id} />
            <input type="hidden" name="date" value={date} />
            <ul className="divide-y divide-line">
              {students.map((s) => {
                const existing = s.attendance[0];
                const notice = s.absenceNotices[0];
                const current = existing?.status ?? (notice ? "EXCUSED" : "PRESENT");
                return (
                  <li key={s.id} className="py-3">
                    <input type="hidden" name="studentId" value={s.id} />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold">
                        {fullName(s)}
                        {notice && (
                          <span className="mt-0.5 block text-xs font-normal text-amber">
                            Absence reported by {notice.submittedBy.name}: {notice.reason}
                          </span>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Status for ${fullName(s)}`}>
                        {ATTENDANCE_STATUSES.map((status) => (
                          <label
                            key={status}
                            className="cursor-pointer rounded-full border border-line-strong bg-mist px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-primary-soft has-checked:border-primary has-checked:bg-primary has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-primary/60 has-focus-visible:ring-offset-1"
                          >
                            <input
                              type="radio"
                              name={`status_${s.id}`}
                              value={status}
                              defaultChecked={current === status}
                              className="sr-only"
                            />
                            {ATTENDANCE_LABELS[status]}
                          </label>
                        ))}
                      </div>
                    </div>
                    <input
                      name={`note_${s.id}`}
                      defaultValue={existing?.note ?? (notice ? `Reported: ${notice.reason}` : "")}
                      placeholder="Note (optional)"
                      className="mt-2 w-full rounded-lg border border-line px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </li>
                );
              })}
            </ul>
            <button className={`${btnPrimary} mt-4 w-full sm:w-auto`}>Save roll</button>
          </form>
        </Card>
      )}
    </div>
  );
}
