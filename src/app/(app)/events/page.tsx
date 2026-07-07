import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { formatDateTime } from "@/lib/format";
import { Badge, Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui";

export default async function EventsPage() {
  const user = await requireUser();
  const events = await prisma.event.findMany({
    where: centerScope(user),
    include: { center: true, _count: { select: { responses: true } } },
    orderBy: { startsAt: "asc" },
  });
  const now = new Date();
  const upcoming = events.filter((e) => e.startsAt >= now);
  const past = events.filter((e) => e.startsAt < now).reverse();

  const Section = ({ title, list }: { title: string; list: typeof events }) => (
    <>
      <h2 className="mb-3 mt-6 font-display text-xl first:mt-0">{title}</h2>
      <div className="space-y-3">
        {list.map((e) => (
          <Card key={e.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`/events/${e.id}`} className="font-display text-lg hover:text-primary">
                  {e.title}
                </Link>
                <p className="text-sm text-ink-soft">
                  {formatDateTime(e.startsAt)}
                  {e.location ? ` · ${e.location}` : ""}
                  {user.role === "SUPER_ADMIN" ? ` · ${e.center.name}` : ""}
                </p>
              </div>
              {e.requiresPermission && (
                <Badge tone="gold">
                  Permission slip{isStaff(user) ? ` · ${e._count.responses} responses` : ""}
                </Badge>
              )}
            </div>
            {e.description && <p className="mt-2 text-sm text-ink-soft">{e.description}</p>}
          </Card>
        ))}
        {list.length === 0 && <p className="text-sm text-ink-soft">Nothing here.</p>}
      </div>
    </>
  );

  return (
    <div>
      <PageHeader
        title="Events"
        arabic="الفعاليات"
        action={
          isStaff(user) ? (
            <Link href="/events/new" className={btnPrimary}>
              New event
            </Link>
          ) : undefined
        }
      />
      {events.length === 0 ? (
        <EmptyState title="No events yet" hint="Eid programs, excursions and open days will appear here." />
      ) : (
        <>
          <Section title="Upcoming" list={upcoming} />
          {past.length > 0 && <Section title="Past" list={past} />}
        </>
      )}
    </div>
  );
}
