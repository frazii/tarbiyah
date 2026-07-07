import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { createStudent } from "@/lib/actions";
import { Card, Field, PageHeader, btnPrimary, inputCls } from "@/components/ui";

export default async function NewStudentPage() {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const scope = centerScope(user);
  const [classes, parents, centers] = await Promise.all([
    prisma.classRoom.findMany({ where: scope, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { ...scope, role: "PARENT" }, orderBy: { name: "asc" } }),
    user.role === "SUPER_ADMIN" ? prisma.center.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add student" subtitle="Enrol a new student at your center" />
      <Card>
        <form action={createStudent} className="space-y-4">
          {user.role === "SUPER_ADMIN" && (
            <Field label="Center">
              <select name="centerId" required className={inputCls}>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input name="firstName" required className={inputCls} />
            </Field>
            <Field label="Last name">
              <input name="lastName" required className={inputCls} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gender">
              <select name="gender" className={inputCls}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </Field>
            <Field label="Date of birth">
              <input name="dateOfBirth" type="date" className={inputCls} />
            </Field>
          </div>
          <Field label="Class">
            <select name="classId" className={inputCls}>
              <option value="">Not assigned yet</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Parent / guardian">
            <select name="parentId" className={inputCls}>
              <option value="">Not linked yet</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
              ))}
            </select>
          </Field>
          <Field label="Medical notes (allergies, conditions, medication)">
            <textarea name="medicalNotes" rows={2} className={inputCls} />
          </Field>
          <button type="submit" className={`${btnPrimary} w-full`}>
            Add student
          </button>
        </form>
      </Card>
    </div>
  );
}
