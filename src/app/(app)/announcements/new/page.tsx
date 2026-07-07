import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createAnnouncement } from "@/lib/actions";
import { Card, Field, PageHeader, btnPrimary, inputCls } from "@/components/ui";

export default async function NewAnnouncementPage() {
  const user = await requireRole("SUPER_ADMIN", "ADMIN", "TEACHER");
  const centers =
    user.role === "SUPER_ADMIN" ? await prisma.center.findMany({ orderBy: { name: "asc" } }) : [];

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New announcement" subtitle="Share news with your community" />
      <Card>
        <form action={createAnnouncement} className="space-y-4">
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
            <input name="title" required className={inputCls} placeholder="e.g. Ramadan timetable published" />
          </Field>
          <Field label="Message">
            <textarea name="body" rows={6} required className={inputCls} placeholder="Assalamu alaikum…" />
          </Field>
          <Field label="Audience">
            <select name="audience" className={inputCls}>
              <option value="ALL">Everyone</option>
              <option value="PARENTS">Parents only</option>
              <option value="TEACHERS">Teachers only</option>
            </select>
          </Field>
          <button className={`${btnPrimary} w-full`}>Publish</button>
        </form>
      </Card>
    </div>
  );
}
