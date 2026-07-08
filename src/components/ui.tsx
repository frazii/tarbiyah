import Link from "next/link";

export const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-primary hover:bg-mist focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";

export function Star8({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 1l2.35 5.3L20 4l-2.3 5.65L23 12l-5.3 2.35L20 20l-5.65-2.3L12 23l-2.35-5.3L4 20l2.3-5.65L1 12l5.3-2.35L4 4l5.65 2.3z" />
    </svg>
  );
}

export function PageHeader({
  title,
  arabic,
  subtitle,
  action,
}: {
  title: string;
  arabic?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-2xl sm:text-3xl text-ink">{title}</h1>
          {arabic && (
            <span className="font-arabic text-xl text-gold" dir="rtl">
              {arabic}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-white p-5 ${className}`}>{children}</div>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-primary-soft text-primary-dark",
  gold: "bg-gold-soft text-amber",
  red: "bg-danger-soft text-danger",
  amber: "bg-amber-soft text-amber",
  neutral: "bg-mist text-ink-soft",
};

export function Badge({ tone = "neutral", children }: { tone?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTones[tone] ?? badgeTones.neutral}`}>
      {children}
    </span>
  );
}

export function attendanceTone(status: string) {
  return { PRESENT: "green", ABSENT: "red", LATE: "amber", EXCUSED: "neutral" }[status] ?? "neutral";
}

export function gradeTone(grade: string) {
  return { EXCELLENT: "green", GOOD: "green", SATISFACTORY: "amber", NEEDS_IMPROVEMENT: "red" }[grade] ?? "neutral";
}

export function behaviorTone(type: string) {
  return { POSITIVE: "green", NEUTRAL: "neutral", NEGATIVE: "red" }[type] ?? "neutral";
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="arch-card border border-dashed border-line bg-mist/60 px-6 py-10 text-center">
      <Star8 className="mx-auto h-5 w-5 text-gold" />
      <p className="mt-3 font-display text-lg text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  href,
  tone = "green",
}: {
  label: string;
  value: string | number;
  href?: string;
  tone?: "green" | "blue";
}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 transition-shadow hover:shadow-sm">
      <span
        className={`h-10 w-1.5 shrink-0 rounded-full ${tone === "blue" ? "bg-secondary" : "bg-primary"}`}
      />
      <div className="min-w-0">
        <div className={`truncate font-display text-2xl ${tone === "blue" ? "text-secondary" : "text-primary"}`}>
          {value}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
