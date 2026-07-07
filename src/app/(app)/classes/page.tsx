import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, isAdmin } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui";

export default async function ClassesPage() {
  const user = await requireUser();
  if (user.role === "PARENT") redirect("/dashboard");

  const classes = await prisma.classRoom.findMany({
    where: centerScope(user),
    include: { teacher: true, center: true, _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Classes"
        arabic="الحلقات"
        subtitle={`${classes.length} classes`}
        action={
          isAdmin(user) ? (
            <Link href="/classes/new" className={btnPrimary}>
              Add class
            </Link>
          ) : undefined
        }
      />
      {classes.length === 0 ? (
        <EmptyState title="No classes yet" hint="Create your first halaqah or class." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id}>
              <Link href={`/classes/${c.id}`} className="font-display text-lg hover:text-primary">
                {c.name}
              </Link>
              {c.description && <p className="mt-1 text-sm text-ink-soft">{c.description}</p>}
              <p className="mt-2 text-xs text-ink-soft">
                {c.schedule ?? "No schedule"} · {c._count.students} students
                {c.teacher ? ` · ${c.teacher.name}` : ""}
                {user.role === "SUPER_ADMIN" ? ` · ${c.center.name}` : ""}
              </p>
              <div className="mt-3">
                <Link
                  href={`/attendance?classId=${c.id}`}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-primary hover:bg-mist"
                >
                  Mark roll
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
