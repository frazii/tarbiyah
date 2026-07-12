import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { PrayerTimes } from "@/components/PrayerTimes";
import { ModuleTiles } from "@/components/ModuleTiles";
import { navForRole } from "@/components/Shell";
import { payInvoice, respondPermission } from "@/lib/actions";
import { formatDate, formatDateTime, formatMoney, fullName } from "@/lib/format";
import { Badge, Card, PageHeader, StatCard, attendanceTone, btnPrimary } from "@/components/ui";

export default async function DashboardPage() {
  const user = await requireUser();
  const scope = centerScope(user);

  const center = user.center;
  const greeting = (
    <PageHeader
      title={`Assalamu alaikum, ${user.name.split(" ").slice(-1)[0] === user.name ? user.name : user.name}`}
      arabic="السلام عليكم"
      subtitle={center ? center.name : "All centers"}
    />
  );

  if (user.role === "PARENT") {
    const children = await prisma.student.findMany({
      where: { parentId: user.id },
      include: {
        class: true,
        attendance: { orderBy: { date: "desc" }, take: 3 },
        invoices: { where: { status: "PENDING" }, orderBy: { dueDate: "asc" } },
        progress: { orderBy: { createdAt: "desc" }, take: 2 },
      },
    });
    const events = await prisma.event.findMany({
      where: { ...scope, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 3,
      include: { responses: true },
    });
    const announcements = await prisma.announcement.findMany({
      where: { ...scope, audience: { in: ["ALL", "PARENTS"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return (
      <div>
        {greeting}
        <div className="mb-6">
          <ModuleTiles nav={navForRole(user.role)} />
        </div>
        <div className="mb-6">
          <PrayerTimes
            latitude={center?.latitude}
            longitude={center?.longitude}
            method={center?.calcMethod}
            locationLabel={center ? `${center.city}, ${center.country}` : undefined}
          />
        </div>

        <h2 className="mb-3 font-display text-xl">Your children</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg">{fullName(child)}</p>
                  <p className="text-sm text-ink-soft">{child.class?.name ?? "Not enrolled in a class"}</p>
                </div>
                <Link href={`/students/${child.id}`} className="text-sm font-semibold text-primary hover:underline">
                  View
                </Link>
              </div>
              {child.attendance.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {child.attendance.map((a) => (
                    <Badge key={a.id} tone={attendanceTone(a.status)}>
                      {formatDate(a.date)}: {a.status.toLowerCase()}
                    </Badge>
                  ))}
                </div>
              )}
              {child.invoices.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-line pt-3">
                  {child.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm">
                        {inv.title} — <strong>{formatMoney(inv.amountCents)}</strong>
                        <span className="text-xs text-ink-soft"> due {formatDate(inv.dueDate)}</span>
                      </span>
                      <form action={payInvoice}>
                        <input type="hidden" name="id" value={inv.id} />
                        <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">
                          Pay now
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {events.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 font-display text-xl">Upcoming events</h2>
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-ink-soft">
                        {formatDateTime(event.startsAt)}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                    {event.requiresPermission && <Badge tone="gold">Permission needed</Badge>}
                  </div>
                  {event.requiresPermission && (
                    <div className="mt-3 space-y-2 border-t border-line pt-3">
                      {children.map((child) => {
                        const resp = event.responses.find((r) => r.studentId === child.id);
                        return (
                          <div key={child.id} className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm">{fullName(child)}</span>
                            {resp ? (
                              <Badge tone={resp.granted ? "green" : "red"}>
                                {resp.granted ? "Permission given" : "Declined"}
                              </Badge>
                            ) : (
                              <div className="flex gap-2">
                                {(["yes", "no"] as const).map((v) => (
                                  <form key={v} action={respondPermission}>
                                    <input type="hidden" name="eventId" value={event.id} />
                                    <input type="hidden" name="studentId" value={child.id} />
                                    <input type="hidden" name="granted" value={v} />
                                    <button
                                      className={
                                        v === "yes"
                                          ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
                                          : "rounded-lg border border-line-strong bg-mist px-3 py-1.5 text-xs font-semibold text-ink hover:bg-danger-soft"
                                      }
                                    >
                                      {v === "yes" ? "Give permission" : "Decline"}
                                    </button>
                                  </form>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}

        {announcements.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 font-display text-xl">Latest announcements</h2>
            <div className="space-y-3">
              {announcements.map((a) => (
                <Card key={a.id}>
                  <p className="font-semibold">{a.title}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{a.body}</p>
                  <p className="mt-2 text-xs text-ink-soft">{formatDate(a.createdAt)}</p>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Staff dashboards
  const [studentCount, classCount, pendingInvoices, upcomingEvents, announcements] = await Promise.all([
    prisma.student.count({ where: scope }),
    prisma.classRoom.count({ where: scope }),
    prisma.invoice.findMany({ where: { ...scope, status: "PENDING" } }),
    prisma.event.findMany({
      where: { ...scope, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 4,
    }),
    prisma.announcement.findMany({ where: scope, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const outstanding = pendingInvoices.reduce((sum, i) => sum + i.amountCents, 0);

  const myClasses = isStaff(user)
    ? await prisma.classRoom.findMany({
        where: user.role === "TEACHER" ? { teacherId: user.id } : scope,
        include: { _count: { select: { students: true } }, teacher: true },
        take: 6,
      })
    : [];

  return (
    <div>
      {greeting}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Students" value={studentCount} href="/students" />
        <StatCard label="Classes" value={classCount} href="/classes" tone="blue" />
        <StatCard label="Unpaid invoices" value={pendingInvoices.length} href="/fees" />
        <StatCard label="Outstanding" value={formatMoney(outstanding)} href="/fees" tone="blue" />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-xl">Modules</h2>
        <ModuleTiles nav={navForRole(user.role)} />
      </div>

      <div className="mt-6">
        <PrayerTimes
          latitude={center?.latitude}
          longitude={center?.longitude}
          method={center?.calcMethod}
          locationLabel={center ? `${center.city}, ${center.country}` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg">{user.role === "TEACHER" ? "Your classes" : "Classes"}</h2>
            <Link href="/classes" className="text-sm font-semibold text-primary hover:underline">
              All classes
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {myClasses.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5">
                <div>
                  <Link href={`/classes/${c.id}`} className="font-semibold hover:text-primary">
                    {c.name}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {c.schedule ?? "No schedule"} · {c._count.students} students
                  </p>
                </div>
                <Link
                  href={`/attendance?classId=${c.id}`}
                  className="rounded-lg border border-line-strong bg-mist px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary-soft"
                >
                  Mark roll
                </Link>
              </li>
            ))}
            {myClasses.length === 0 && <li className="py-3 text-sm text-ink-soft">No classes yet.</li>}
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg">Upcoming events</h2>
            <Link href="/events" className="text-sm font-semibold text-primary hover:underline">
              All events
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {upcomingEvents.map((e) => (
              <li key={e.id} className="py-2.5">
                <Link href={`/events/${e.id}`} className="font-semibold hover:text-primary">
                  {e.title}
                </Link>
                <p className="text-xs text-ink-soft">{formatDateTime(e.startsAt)}</p>
              </li>
            ))}
            {upcomingEvents.length === 0 && <li className="py-3 text-sm text-ink-soft">No upcoming events.</li>}
          </ul>
        </Card>
      </div>

      {announcements.length > 0 && (
        <Card className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg">Latest announcements</h2>
            <Link href="/announcements" className="text-sm font-semibold text-primary hover:underline">
              All announcements
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {announcements.map((a) => (
              <li key={a.id} className="py-2.5">
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-ink-soft">{formatDate(a.createdAt)}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/students/new" className={btnPrimary}>
          Add student
        </Link>
        <Link href="/announcements/new" className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-primary hover:bg-mist">
          New announcement
        </Link>
        <Link href="/events/new" className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-primary hover:bg-mist">
          New event
        </Link>
      </div>
    </div>
  );
}
