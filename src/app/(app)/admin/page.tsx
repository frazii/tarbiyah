import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { createCenter, createUser } from "@/lib/actions";
import { CALC_METHODS, ROLE_LABELS, type Role } from "@/lib/constants";
import { Badge, Card, Field, PageHeader, btnPrimary, inputCls } from "@/components/ui";

export default async function AdminPage() {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const isSuper = user.role === "SUPER_ADMIN";

  const [users, centers] = await Promise.all([
    prisma.user.findMany({
      where: isSuper ? {} : { ...centerScope(user), role: { in: ["TEACHER", "PARENT", "ADMIN"] } },
      include: { center: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.center.findMany({
      include: { _count: { select: { students: true, users: true, classes: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Administration"
        arabic="الإدارة"
        subtitle={isSuper ? "Manage centers and accounts across the platform" : `Manage accounts at ${user.center?.name}`}
      />

      {isSuper && (
        <>
          <h2 className="mb-3 font-display text-xl">Centers</h2>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {centers.map((c) => (
              <Card key={c.id}>
                <p className="font-display text-lg">{c.name}</p>
                <p className="text-sm text-ink-soft">
                  {c.city}, {c.country}
                </p>
                <p className="mt-2 text-xs text-ink-soft">
                  {c._count.students} students · {c._count.classes} classes · {c._count.users} accounts
                </p>
              </Card>
            ))}
          </div>
          <Card className="mb-8">
            <h3 className="mb-3 font-display text-lg">Add center</h3>
            <form action={createCenter} className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input name="name" required className={inputCls} placeholder="e.g. Darul Ilm Institute" />
              </Field>
              <Field label="Address">
                <input name="address" className={inputCls} />
              </Field>
              <Field label="City">
                <input name="city" required className={inputCls} />
              </Field>
              <Field label="Country">
                <input name="country" required className={inputCls} />
              </Field>
              <Field label="Latitude">
                <input name="latitude" type="number" step="any" required className={inputCls} placeholder="-33.8688" />
              </Field>
              <Field label="Longitude">
                <input name="longitude" type="number" step="any" required className={inputCls} placeholder="151.2093" />
              </Field>
              <Field label="Prayer calculation method">
                <select name="calcMethod" className={inputCls} defaultValue="3">
                  {CALC_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <button className={btnPrimary}>Add center</button>
              </div>
            </form>
          </Card>
        </>
      )}

      <h2 className="mb-3 font-display text-xl">Accounts</h2>
      <Card className="mb-4">
        <h3 className="mb-3 font-display text-lg">Add account</h3>
        <form action={createUser} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Name">
            <input name="name" required className={inputCls} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required className={inputCls} />
          </Field>
          <Field label="Password">
            <input name="password" type="text" required minLength={8} className={inputCls} placeholder="min 8 chars" />
          </Field>
          <Field label="Role">
            <select name="role" className={inputCls}>
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
              {isSuper && <option value="ADMIN">Center Admin</option>}
              {isSuper && <option value="SUPER_ADMIN">Super Admin</option>}
            </select>
          </Field>
          {isSuper ? (
            <Field label="Center">
              <select name="centerId" className={inputCls}>
                <option value="">— none (super admin) —</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          ) : (
            <div className="flex items-end">
              <button className={`${btnPrimary} w-full`}>Add</button>
            </div>
          )}
          {isSuper && (
            <div className="flex items-end lg:col-start-5">
              <button className={`${btnPrimary} w-full`}>Add</button>
            </div>
          )}
        </form>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-mist text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Center</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-mist/50">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={u.role === "PARENT" ? "neutral" : "green"}>
                    {ROLE_LABELS[u.role as Role] ?? u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ink-soft">{u.center?.name ?? "All centers"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
