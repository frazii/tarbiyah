import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createEvent } from "@/lib/actions";
import { Card, Field, PageHeader, btnPrimary, inputCls } from "@/components/ui";

export default async function NewEventPage() {
  const user = await requireRole("SUPER_ADMIN", "ADMIN", "TEACHER");
  const centers =
    user.role === "SUPER_ADMIN" ? await prisma.center.findMany({ orderBy: { name: "asc" } }) : [];

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New event" subtitle="Programs, excursions and community days" />
      <Card>
        <form action={createEvent} className="space-y-4">
          {user.role === "SUPER_ADMIN" && (
            <Field label="Center">
              <select name="centerId" required className={inputCls}>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Title">
            <input name="title" required className={inputCls} placeholder="e.g. Eid Family Fun Day" />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} className={inputCls} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date & time">
              <input name="startsAt" type="datetime-local" required className={inputCls} />
            </Field>
            <Field label="Location">
              <input name="location" className={inputCls} placeholder="e.g. Main Hall" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="requiresPermission" className="h-4 w-4 accent-[#046a38]" />
            Parents must give permission for their child to attend
          </label>
          <button className={`${btnPrimary} w-full`}>Create event</button>
        </form>
      </Card>
    </div>
  );
}
