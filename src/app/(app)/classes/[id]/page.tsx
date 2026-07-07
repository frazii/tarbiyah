import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { fullName } from "@/lib/format";
import { Card, PageHeader, btnPrimary } from "@/components/ui";

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!isStaff(user)) redirect("/dashboard");

  const cls = await prisma.classRoom.findUnique({
    where: { id },
    include: {
      teacher: true,
      center: true,
      students: { orderBy: [{ lastName: "asc" }], include: { parent: true } },
    },
  });
  if (!cls) notFound();
  if (user.role !== "SUPER_ADMIN" && cls.centerId !== user.centerId) redirect("/classes");

  return (
    <div>
      <PageHeader
        title={cls.name}
        subtitle={`${cls.schedule ?? "No schedule"} · ${cls.teacher?.name ?? "No teacher assigned"} · ${cls.center.name}`}
        action={
          <Link href={`/attendance?classId=${cls.id}`} className={btnPrimary}>
            Mark roll
          </Link>
        }
      />
      {cls.description && <p className="-mt-3 mb-5 text-sm text-ink-soft">{cls.description}</p>}

      <Card>
        <h2 className="mb-3 font-display text-lg">Roster ({cls.students.length})</h2>
        <ul className="divide-y divide-line">
          {cls.students.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2.5">
              <div>
                <Link href={`/students/${s.id}`} className="font-semibold hover:text-primary">
                  {fullName(s)}
                </Link>
                <p className="text-xs text-ink-soft">{s.parent ? `Parent: ${s.parent.name}` : "No parent linked"}</p>
              </div>
              <Link href={`/students/${s.id}`} className="text-sm font-semibold text-primary hover:underline">
                Profile
              </Link>
            </li>
          ))}
          {cls.students.length === 0 && <li className="py-3 text-sm text-ink-soft">No students enrolled yet.</li>}
        </ul>
      </Card>
    </div>
  );
}
