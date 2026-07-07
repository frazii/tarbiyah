import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { centerScope } from "@/lib/scope";
import { formatDate } from "@/lib/format";
import { Badge, Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui";

export default async function AnnouncementsPage() {
  const user = await requireUser();
  const scope = centerScope(user);

  const audienceFilter =
    user.role === "PARENT"
      ? { audience: { in: ["ALL", "PARENTS"] } }
      : user.role === "TEACHER"
        ? { audience: { in: ["ALL", "TEACHERS"] } }
        : {};

  const announcements = await prisma.announcement.findMany({
    where: { ...scope, ...audienceFilter },
    include: { author: true, center: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Announcements"
        arabic="الإعلانات"
        action={
          isStaff(user) ? (
            <Link href="/announcements/new" className={btnPrimary}>
              New announcement
            </Link>
          ) : undefined
        }
      />
      {announcements.length === 0 ? (
        <EmptyState title="No announcements yet" hint="News for your community will appear here." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-display text-lg">{a.title}</h2>
                <Badge tone={a.audience === "ALL" ? "green" : "gold"}>
                  {a.audience === "ALL" ? "Everyone" : a.audience === "PARENTS" ? "Parents" : "Teachers"}
                </Badge>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{a.body}</p>
              <p className="mt-3 text-xs text-ink-soft">
                {a.author.name} · {formatDate(a.createdAt)}
                {user.role === "SUPER_ADMIN" ? ` · ${a.center.name}` : ""}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
