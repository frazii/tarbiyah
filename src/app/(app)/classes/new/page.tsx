import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { createClass } from "@/lib/actions";
import { Card, Field, PageHeader, btnPrimary, inputCls } from "@/components/ui";

export default async function NewClassPage() {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const [teachers, centers] = await Promise.all([
    prisma.user.findMany({ where: { ...centerScope(user), role: "TEACHER" }, orderBy: { name: "asc" } }),
    user.role === "SUPER_ADMIN" ? prisma.center.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add class" subtitle="Create a halaqah, hifz group or study class" />
      <Card>
        <form action={createClass} className="space-y-4">
          {user.role === "SUPER_ADMIN" && (
            <Field label="Center">
              <select name="centerId" required className={inputCls}>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Class name">
            <input name="name" required className={inputCls} placeholder="e.g. Hifz Level 2" />
          </Field>
          <Field label="Description">
            <input name="description" className={inputCls} placeholder="e.g. Memorisation of Juz 29–30" />
          </Field>
          <Field label="Schedule">
            <input name="schedule" className={inputCls} placeholder="e.g. Sat & Sun 10:00–12:00" />
          </Field>
          <Field label="Teacher">
            <select name="teacherId" className={inputCls}>
              <option value="">Assign later</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <button className={`${btnPrimary} w-full`}>Create class</button>
        </form>
      </Card>
    </div>
  );
}
