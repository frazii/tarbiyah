import { prisma } from "@/lib/db";
import { requireUser, isAdmin, isStaff } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { createInvoice, payInvoice } from "@/lib/actions";
import { formatDate, formatMoney, fullName } from "@/lib/format";
import { Badge, Card, EmptyState, Field, PageHeader, btnPrimary, inputCls } from "@/components/ui";

export default async function FeesPage() {
  const user = await requireUser();
  const scope = centerScope(user);

  const invoices = await prisma.invoice.findMany({
    where:
      user.role === "PARENT"
        ? { student: { parentId: user.id } }
        : scope,
    include: { student: { include: { parent: true } } },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const students = isAdmin(user)
    ? await prisma.student.findMany({ where: scope, orderBy: [{ lastName: "asc" }] })
    : [];

  const outstanding = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((sum, i) => sum + i.amountCents, 0);

  return (
    <div>
      <PageHeader
        title="Fees"
        arabic="الرسوم"
        subtitle={
          user.role === "PARENT"
            ? `Outstanding for your children: ${formatMoney(outstanding)}`
            : `Total outstanding: ${formatMoney(outstanding)}`
        }
      />

      {isAdmin(user) && (
        <Card className="mb-5">
          <h2 className="mb-3 font-display text-lg">Issue invoice</h2>
          <form action={createInvoice} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Student">
              <select name="studentId" required className={inputCls}>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{fullName(s)}</option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <input name="title" required className={inputCls} placeholder="e.g. Term 4 Tuition" />
            </Field>
            <Field label="Amount">
              <input name="amount" type="number" step="0.01" min="0" required className={inputCls} placeholder="180.00" />
            </Field>
            <Field label="Due date">
              <input name="dueDate" type="date" required className={inputCls} />
            </Field>
            <div className="flex items-end">
              <button className={`${btnPrimary} w-full`}>Issue</button>
            </div>
          </form>
        </Card>
      )}

      {invoices.length === 0 ? (
        <EmptyState title="No invoices" hint="Invoices you issue will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-mist text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {invoices.map((inv) => {
                const overdue = inv.status === "PENDING" && inv.dueDate < new Date();
                return (
                  <tr key={inv.id} className="hover:bg-mist/50">
                    <td className="px-4 py-3 font-semibold">
                      {inv.title}
                      {inv.description && <span className="block text-xs font-normal text-ink-soft">{inv.description}</span>}
                    </td>
                    <td className="px-4 py-3">{fullName(inv.student)}</td>
                    <td className="px-4 py-3 font-semibold">{formatMoney(inv.amountCents)}</td>
                    <td className="px-4 py-3">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3">
                      {inv.status === "PAID" ? (
                        <Badge tone="green">Paid {inv.paidAt ? formatDate(inv.paidAt) : ""}</Badge>
                      ) : overdue ? (
                        <Badge tone="red">Overdue</Badge>
                      ) : (
                        <Badge tone="amber">Pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.status === "PENDING" &&
                        (user.role === "PARENT" ? (
                          <form action={payInvoice}>
                            <input type="hidden" name="id" value={inv.id} />
                            <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">
                              Pay now
                            </button>
                          </form>
                        ) : isAdmin(user) ? (
                          <form action={payInvoice}>
                            <input type="hidden" name="id" value={inv.id} />
                            <input type="hidden" name="method" value="Recorded by admin" />
                            <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-primary hover:bg-mist">
                              Mark paid
                            </button>
                          </form>
                        ) : null)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {user.role === "PARENT" && (
        <p className="mt-3 text-xs text-ink-soft">
          Payments here are recorded instantly for demonstration — no real money moves.
        </p>
      )}
      {isStaff(user) && !isAdmin(user) && (
        <p className="mt-3 text-xs text-ink-soft">Only center admins can issue invoices or record payments.</p>
      )}
    </div>
  );
}
