import { getCurrentUser } from "@/lib/auth";
import { getPortalStats } from "@/lib/portalStats";

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const { centers, totals } = await getPortalStats();
  const header = [
    "Center", "City", "Country", "Students", "Classes", "Teachers", "Admins", "Parents",
    "Attendance rate 30d (%)", "Rolls marked 30d", "Absence notices 30d",
    "Fees collected ($)", "Fees outstanding ($)",
  ];
  const rows = centers.map((c) => [
    c.name, c.city, c.country, c.students, c.classes, c.teachers, c.admins, c.parents,
    c.attRate30 ?? "", c.attMarked30, c.notices30,
    (c.feesPaidCents / 100).toFixed(2), (c.feesPendingCents / 100).toFixed(2),
  ]);
  rows.push([
    "TOTAL", "", "", totals.students, totals.classes, "", "", totals.parents,
    totals.attRate30 ?? "", totals.attMarked30, totals.notices30,
    (totals.feesPaidCents / 100).toFixed(2), (totals.feesPendingCents / 100).toFixed(2),
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tarbiyah-report-${date}.csv"`,
    },
  });
}
