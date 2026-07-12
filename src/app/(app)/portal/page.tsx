import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { onboardCenter } from "@/lib/actions";
import { getPortalStats, fmtMoney } from "@/lib/portalStats";
import { CALC_METHODS } from "@/lib/constants";
import { Badge, Card, Field, PageHeader, StatCard, btnGhost, btnPrimary, inputCls } from "@/components/ui";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarded?: string; onboard?: string }>;
}) {
  await requireRole("SUPER_ADMIN");
  const { onboarded, onboard } = await searchParams;
  const { centers, totals, weeks } = await getPortalStats();
  const onboardedCenter = onboarded ? centers.find((c) => c.slug === onboarded) : null;

  return (
    <div>
      <PageHeader
        title="Platform Portal"
        arabic="البوابة"
        subtitle="Onboard centers and see how the whole platform is doing"
        action={
          <a href="/portal/report" className={btnGhost} download>
            Download CSV report
          </a>
        }
      />

      {onboardedCenter && (
        <div className="mb-4 rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary-dark">
          <p className="font-semibold">{onboardedCenter.name} is onboarded and its admin can sign in now.</p>
          <p className="mt-1">
            Their branded sign-in link:{" "}
            <code className="rounded bg-white/70 px-1.5 py-0.5 font-semibold">
              /login?center={onboardedCenter.slug}
            </code>{" "}
            — share it with the center admin, who can add a logo and colors under Administration → Branding.
          </p>
        </div>
      )}
      {onboard === "emailtaken" && (
        <p className="mb-4 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          That admin email is already in use. The center was not created — try a different email.
        </p>
      )}

      {/* Platform stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Centers" value={totals.centers} tone="green" />
        <StatCard label="Students" value={totals.students} tone="blue" />
        <StatCard label="Staff" value={totals.staff} tone="green" />
        <StatCard label="Parents" value={totals.parents} tone="blue" />
        <StatCard
          label="Attendance 30d"
          value={totals.attRate30 === null ? "—" : `${totals.attRate30}%`}
          tone="green"
        />
        <StatCard
          label="Fees collected"
          value={`$${Math.round(totals.feesPaidCents / 100).toLocaleString("en-AU")}`}
          tone="blue"
        />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {/* Attendance trend */}
        <Card>
          <h3 className="font-display text-lg">Attendance trend</h3>
          <p className="mb-4 text-sm text-ink-soft">
            Share of marked rolls attended (present or late), per week across all centers.
          </p>
          <ul className="space-y-2.5">
            {weeks.map((w) => (
              <li key={w.label} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 text-xs font-semibold text-ink-soft">{w.label}</span>
                <span className="h-4 flex-1 overflow-hidden rounded-full bg-mist" role="presentation">
                  {w.rate !== null && (
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${w.rate}%` }} />
                  )}
                </span>
                <span className="w-20 shrink-0 text-right text-xs text-ink-soft">
                  {w.rate === null ? "no rolls" : `${w.rate}% of ${w.marked}`}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Onboard a center */}
        <Card>
          <h3 className="font-display text-lg">Onboard a center</h3>
          <p className="mb-4 text-sm text-ink-soft">
            Creates the center and its first admin account in one step.
          </p>
          <form action={onboardCenter} className="grid gap-3 sm:grid-cols-2">
            <Field label="Center name">
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
            <div className="sm:col-span-2">
              <Field label="Prayer calculation method">
                <select name="calcMethod" className={inputCls} defaultValue="3">
                  {CALC_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="sm:col-span-2 mt-1 border-t border-line pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Center admin account</p>
            </div>
            <Field label="Admin name">
              <input name="adminName" required className={inputCls} />
            </Field>
            <Field label="Admin email">
              <input name="adminEmail" type="email" required className={inputCls} />
            </Field>
            <Field label="Temporary password">
              <input name="adminPassword" type="text" required minLength={8} className={inputCls} placeholder="min 8 chars" />
            </Field>
            <div className="flex items-end">
              <button className={`${btnPrimary} w-full`}>Onboard center</button>
            </div>
          </form>
        </Card>
      </div>

      {/* Per-center report */}
      <h2 className="mb-3 font-display text-xl">Center report — last 30 days</h2>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="bg-mist text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Center</th>
              <th className="px-4 py-3 text-right">Students</th>
              <th className="px-4 py-3 text-right">Classes</th>
              <th className="px-4 py-3 text-right">Staff</th>
              <th className="px-4 py-3 text-right">Parents</th>
              <th className="px-4 py-3 text-right">Attendance</th>
              <th className="px-4 py-3 text-right">Absence notices</th>
              <th className="px-4 py-3 text-right">Fees collected</th>
              <th className="px-4 py-3 text-right">Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {centers.map((c) => (
              <tr key={c.id} className="hover:bg-mist/50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="text-xs text-ink-soft">
                    {c.city}, {c.country} ·{" "}
                    <Link href={`/login?center=${c.slug}`} className="font-semibold text-primary hover:underline">
                      sign-in page
                    </Link>
                  </p>
                </td>
                <td className="px-4 py-3 text-right">{c.students}</td>
                <td className="px-4 py-3 text-right">{c.classes}</td>
                <td className="px-4 py-3 text-right">{c.teachers + c.admins}</td>
                <td className="px-4 py-3 text-right">{c.parents}</td>
                <td className="px-4 py-3 text-right">
                  {c.attRate30 === null ? (
                    <Badge tone="neutral">no rolls</Badge>
                  ) : (
                    <Badge tone={c.attRate30 >= 85 ? "green" : c.attRate30 >= 70 ? "amber" : "red"}>
                      {c.attRate30}%
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">{c.notices30}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary-dark">{fmtMoney(c.feesPaidCents)}</td>
                <td className="px-4 py-3 text-right">
                  {c.feesPendingCents > 0 ? (
                    <span className="font-semibold text-amber">{fmtMoney(c.feesPendingCents)}</span>
                  ) : (
                    <span className="text-ink-soft">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Attendance is the share of marked roll entries recorded as present or late over the last 30
        days. Fees are all-time totals.
      </p>
    </div>
  );
}
