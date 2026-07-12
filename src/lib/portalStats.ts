import { prisma } from "./db";

export type CenterStats = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  students: number;
  classes: number;
  teachers: number;
  parents: number;
  admins: number;
  attMarked30: number;
  attAttended30: number;
  attRate30: number | null; // percent, null when nothing marked
  notices30: number;
  feesPaidCents: number;
  feesPendingCents: number;
};

export type WeekBucket = {
  label: string; // e.g. "18 May"
  marked: number;
  attended: number;
  rate: number | null;
};

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

export async function getPortalStats() {
  const now = Date.now();
  const cutoff30 = iso(new Date(now - 29 * DAY));
  const cutoff56 = iso(new Date(now - 55 * DAY)); // 8 weekly buckets

  const [centers, roleCounts, attendance, notices, invoiceSums] = await Promise.all([
    prisma.center.findMany({
      include: { _count: { select: { students: true, classes: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.groupBy({ by: ["centerId", "role"], _count: { _all: true } }),
    prisma.attendanceRecord.findMany({
      where: { date: { gte: cutoff56 } },
      select: { date: true, status: true, class: { select: { centerId: true } } },
    }),
    prisma.absenceNotice.findMany({
      where: { dateFrom: { gte: cutoff30 } },
      select: { student: { select: { centerId: true } } },
    }),
    prisma.invoice.groupBy({ by: ["centerId", "status"], _sum: { amountCents: true } }),
  ]);

  const byCenter = new Map<string, CenterStats>(
    centers.map((c) => [
      c.id,
      {
        id: c.id,
        name: c.name,
        slug: c.slug,
        city: c.city,
        country: c.country,
        students: c._count.students,
        classes: c._count.classes,
        teachers: 0,
        parents: 0,
        admins: 0,
        attMarked30: 0,
        attAttended30: 0,
        attRate30: null,
        notices30: 0,
        feesPaidCents: 0,
        feesPendingCents: 0,
      },
    ])
  );

  for (const rc of roleCounts) {
    const s = rc.centerId ? byCenter.get(rc.centerId) : undefined;
    if (!s) continue;
    if (rc.role === "TEACHER") s.teachers = rc._count._all;
    else if (rc.role === "PARENT") s.parents = rc._count._all;
    else if (rc.role === "ADMIN") s.admins = rc._count._all;
  }

  // Weekly buckets: 8 windows of 7 days, oldest first, the last one ending today.
  const weeks: WeekBucket[] = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(now - (7 * (8 - i) - 1) * DAY);
    return {
      label: start.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
      marked: 0,
      attended: 0,
      rate: null,
    };
  });
  const weekIndex = (date: string) => {
    const age = Math.floor((now - new Date(`${date}T00:00:00Z`).getTime()) / DAY);
    const idx = 7 - Math.floor(age / 7);
    return idx >= 0 && idx < 8 ? idx : -1;
  };

  for (const rec of attendance) {
    const attended = rec.status === "PRESENT" || rec.status === "LATE";
    const s = byCenter.get(rec.class.centerId);
    if (s && rec.date >= cutoff30) {
      s.attMarked30 += 1;
      if (attended) s.attAttended30 += 1;
    }
    const wi = weekIndex(rec.date);
    if (wi >= 0) {
      weeks[wi].marked += 1;
      if (attended) weeks[wi].attended += 1;
    }
  }
  for (const s of byCenter.values()) {
    if (s.attMarked30 > 0) s.attRate30 = Math.round((s.attAttended30 / s.attMarked30) * 100);
  }
  for (const w of weeks) {
    if (w.marked > 0) w.rate = Math.round((w.attended / w.marked) * 100);
  }

  for (const n of notices) {
    const s = byCenter.get(n.student.centerId);
    if (s) s.notices30 += 1;
  }

  for (const inv of invoiceSums) {
    const s = byCenter.get(inv.centerId);
    if (!s) continue;
    if (inv.status === "PAID") s.feesPaidCents += inv._sum.amountCents ?? 0;
    else s.feesPendingCents += inv._sum.amountCents ?? 0;
  }

  const centerStats = [...byCenter.values()];
  const totals = centerStats.reduce(
    (t, s) => ({
      students: t.students + s.students,
      classes: t.classes + s.classes,
      staff: t.staff + s.teachers + s.admins,
      parents: t.parents + s.parents,
      attMarked30: t.attMarked30 + s.attMarked30,
      attAttended30: t.attAttended30 + s.attAttended30,
      notices30: t.notices30 + s.notices30,
      feesPaidCents: t.feesPaidCents + s.feesPaidCents,
      feesPendingCents: t.feesPendingCents + s.feesPendingCents,
    }),
    {
      students: 0,
      classes: 0,
      staff: 0,
      parents: 0,
      attMarked30: 0,
      attAttended30: 0,
      notices30: 0,
      feesPaidCents: 0,
      feesPendingCents: 0,
    }
  );

  return {
    centers: centerStats,
    totals: {
      ...totals,
      centers: centerStats.length,
      attRate30:
        totals.attMarked30 > 0 ? Math.round((totals.attAttended30 / totals.attMarked30) * 100) : null,
    },
    weeks,
  };
}

export function fmtMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
