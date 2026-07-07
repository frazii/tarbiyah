import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser, isAdmin } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { fullName } from "@/lib/format";
import { Badge, EmptyState, PageHeader, btnPrimary } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const user = await requireUser();
  if (user.role === "PARENT") redirect("/dashboard");

  const students = await prisma.student.findMany({
    where: centerScope(user),
    include: { class: true, parent: true, center: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Students"
        arabic="الطلاب"
        subtitle={`${students.length} enrolled`}
        action={
          isAdmin(user) ? (
            <Link href="/students/new" className={btnPrimary}>
              Add student
            </Link>
          ) : undefined
        }
      />

      {students.length === 0 ? (
        <EmptyState title="No students yet" hint="Add your first student to begin enrolment." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-mist text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Parent</th>
                {user.role === "SUPER_ADMIN" && <th className="px-4 py-3">Center</th>}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-mist/50">
                  <td className="px-4 py-3 font-semibold">
                    {fullName(s)}
                    {s.medicalNotes && (
                      <span className="ml-2">
                        <Badge tone="red">Medical</Badge>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{s.class?.name ?? <span className="text-ink-soft">—</span>}</td>
                  <td className="px-4 py-3">{s.parent?.name ?? <span className="text-ink-soft">—</span>}</td>
                  {user.role === "SUPER_ADMIN" && <td className="px-4 py-3">{s.center.name}</td>}
                  <td className="px-4 py-3 text-right">
                    <Link href={`/students/${s.id}`} className="font-semibold text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
