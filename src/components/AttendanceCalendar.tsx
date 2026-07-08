import Link from "next/link";

type DayInfo = { status?: string; note?: string | null; reported?: boolean };

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-primary text-white",
  LATE: "bg-amber-soft text-amber border border-amber/40",
  EXCUSED: "bg-mist text-ink-soft border border-line",
  ABSENT: "bg-danger-soft text-danger border border-danger/40",
};

const LEGEND: { key: string; label: string }[] = [
  { key: "PRESENT", label: "Present" },
  { key: "LATE", label: "Late" },
  { key: "EXCUSED", label: "Excused" },
  { key: "ABSENT", label: "Absent" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Month grid of attendance. `month` is "YYYY-MM"; `days` maps "YYYY-MM-DD" → info. */
export function AttendanceCalendar({
  month,
  days,
  baseHref,
}: {
  month: string;
  days: Map<string, DayInfo>;
  baseHref: string; // e.g. /students/xyz — month switched via ?month=
}) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const startWeekday = first.getDay(); // 0 = Sunday
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const prev = m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
  const monthName = first.toLocaleDateString("en", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Link href={`${baseHref}?month=${prev}`} className="rounded-lg border border-line-strong bg-mist px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary-soft" aria-label="Previous month">
          ← {prev}
        </Link>
        <p className="font-display text-lg">{monthName}</p>
        <Link href={`${baseHref}?month=${next}`} className="rounded-lg border border-line-strong bg-mist px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary-soft" aria-label="Next month">
          {next} →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} />;
          const iso = `${y}-${pad(m)}-${pad(day)}`;
          const info = days.get(iso);
          const style = info?.status ? STATUS_STYLES[info.status] : "bg-white border border-line/70 text-ink-soft/60";
          const title = info?.status
            ? `${iso}: ${info.status.toLowerCase()}${info.note ? ` — ${info.note}` : ""}${info.reported ? " · absence reported by parent" : ""}`
            : info?.reported
              ? `${iso}: absence reported by parent`
              : iso;
          return (
            <div
              key={iso}
              title={title}
              className={`relative flex h-10 items-center justify-center rounded-lg text-sm font-semibold ${style} ${
                iso === todayISO ? "ring-2 ring-gold" : ""
              }`}
            >
              {day}
              {info?.reported && (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gold"
                  aria-label="Absence reported"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
        {LEGEND.map((l) => (
          <span key={l.key} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded ${STATUS_STYLES[l.key]}`} />
            {l.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
          Reported absence
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded ring-2 ring-gold" />
          Today
        </span>
      </div>
    </div>
  );
}
