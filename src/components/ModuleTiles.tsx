import Link from "next/link";
import type { NavItem } from "./Shell";
import { Icon } from "./icons";

const TILE_DESCRIPTIONS: Record<string, string> = {
  "/students": "Enrolment and student profiles",
  "/classes": "Halaqahs, rosters and schedules",
  "/attendance": "Mark and review the roll",
  "/fees": "Invoices and payments",
  "/announcements": "News for your community",
  "/events": "Programs and permission slips",
  "/progress": "Hifz and studies records",
  "/prayer-times": "Today's Adhan timings",
  "/qibla": "Direction of the Kaaba",
  "/admin": "Centers and accounts",
};

export function ModuleTiles({ nav }: { nav: NavItem[] }) {
  const tiles = nav.filter((n) => n.href !== "/dashboard");
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((t, i) => {
        const blue = i % 2 === 1;
        return (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-xl border border-line bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-md"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                blue ? "bg-secondary-soft text-secondary" : "bg-primary-soft text-primary"
              }`}
            >
              <Icon name={t.icon} className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-bold text-ink group-hover:text-primary-dark">{t.label}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{TILE_DESCRIPTIONS[t.href] ?? ""}</p>
          </Link>
        );
      })}
    </div>
  );
}
