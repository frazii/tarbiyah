import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, isStaff } from "@/lib/auth";
import { respondPermission } from "@/lib/actions";
import { formatDateTime, fullName } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/ui";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      center: true,
      responses: { include: { student: true, respondedBy: true } },
    },
  });
  if (!event) notFound();
  const inCenter = user.role === "SUPER_ADMIN" || event.centerId === user.centerId;
  if (!inCenter) redirect("/events");

  const myChildren =
    user.role === "PARENT"
      ? await prisma.student.findMany({ where: { parentId: user.id }, orderBy: { firstName: "asc" } })
      : [];

  const centerStudents =
    isStaff(user) && event.requiresPermission
      ? await prisma.student.findMany({ where: { centerId: event.centerId }, orderBy: [{ lastName: "asc" }] })
      : [];

  return (
    <div>
      <PageHeader
        title={event.title}
        subtitle={`${formatDateTime(event.startsAt)}${event.location ? ` · ${event.location}` : ""} · ${event.center.name}`}
      />
      {event.description && (
        <Card className="mb-4">
          <p className="whitespace-pre-line text-sm leading-relaxed">{event.description}</p>
        </Card>
      )}

      {event.requiresPermission && user.role === "PARENT" && (
        <Card className="mb-4">
          <h2 className="mb-3 font-display text-lg">Permission slip</h2>
          <div className="space-y-3">
            {myChildren.map((child) => {
              const resp = event.responses.find((r) => r.studentId === child.id);
              return (
                <div key={child.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 last:border-0 last:pb-0">
                  <span className="font-semibold">{fullName(child)}</span>
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
            {myChildren.length === 0 && <p className="text-sm text-ink-soft">No children linked to your account.</p>}
          </div>
        </Card>
      )}

      {event.requiresPermission && isStaff(user) && (
        <Card>
          <h2 className="mb-3 font-display text-lg">
            Permission responses ({event.responses.length}/{centerStudents.length})
          </h2>
          <ul className="divide-y divide-line">
            {centerStudents.map((s) => {
              const resp = event.responses.find((r) => r.studentId === s.id);
              return (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <span className="text-sm">
                    {fullName(s)}
                    {resp && (
                      <span className="block text-xs text-ink-soft">
                        by {resp.respondedBy.name} · {formatDateTime(resp.respondedAt)}
                      </span>
                    )}
                  </span>
                  {resp ? (
                    <Badge tone={resp.granted ? "green" : "red"}>{resp.granted ? "Granted" : "Declined"}</Badge>
                  ) : (
                    <Badge tone="neutral">Awaiting</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
