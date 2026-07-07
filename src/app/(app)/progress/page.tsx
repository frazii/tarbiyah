import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { formatDate, fullName } from "@/lib/format";
import { GRADE_LABELS, PROGRESS_TYPE_LABELS } from "@/lib/constants";
import { Badge, EmptyState, PageHeader, gradeTone } from "@/components/ui";

export default async function ProgressPage() {
  const user = await requireUser();
  if (!isStaff(user)) redirect("/dashboard");

  const records = await prisma.progressRecord.findMany({
    where: { student: centerScope(user) },
    include: { student: true, teacher: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Progress"
        arabic="التقدم"
        subtitle="Latest hifz, tilawah and studies records. Add records from a student's profile."
      />
      {records.length === 0 ? (
        <EmptyState title="No progress recorded yet" hint="Open a student profile to record their first lesson." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-mist text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Portion</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-mist/50">
                  <td className="px-4 py-3">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/students/${r.studentId}`} className="hover:text-primary">
                      {fullName(r.student)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {PROGRESS_TYPE_LABELS[r.type as keyof typeof PROGRESS_TYPE_LABELS] ?? r.type}
                  </td>
                  <td className="px-4 py-3">
                    {r.surah ? `${r.surah}${r.ayahFrom && r.ayahTo ? ` ${r.ayahFrom}–${r.ayahTo}` : ""}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={gradeTone(r.grade)}>
                      {GRADE_LABELS[r.grade as keyof typeof GRADE_LABELS] ?? r.grade}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{r.teacher.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
