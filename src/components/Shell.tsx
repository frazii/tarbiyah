import Link from "next/link";
import { logout } from "@/lib/actions";
import type { CurrentUser } from "@/lib/auth";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { MobileNav } from "./MobileNav";
import { Star8 } from "./ui";

export type NavItem = { href: string; label: string; arabic?: string };

export function navForRole(role: string): NavItem[] {
  const base: NavItem[] = [{ href: "/dashboard", label: "Dashboard" }];
  const staff: NavItem[] = [
    { href: "/students", label: "Students" },
    { href: "/classes", label: "Classes" },
    { href: "/attendance", label: "Attendance" },
    { href: "/fees", label: "Fees" },
    { href: "/announcements", label: "Announcements" },
    { href: "/events", label: "Events" },
    { href: "/progress", label: "Progress" },
  ];
  const parent: NavItem[] = [
    { href: "/announcements", label: "Announcements" },
    { href: "/events", label: "Events" },
    { href: "/fees", label: "Fees" },
  ];
  const utilities: NavItem[] = [
    { href: "/prayer-times", label: "Prayer Times", arabic: "الأذان" },
    { href: "/qibla", label: "Qibla Locator", arabic: "القبلة" },
  ];
  const admin: NavItem[] = [{ href: "/admin", label: "Administration" }];

  if (role === "PARENT") return [...base, ...parent, ...utilities];
  if (role === "TEACHER") return [...base, ...staff, ...utilities];
  return [...base, ...staff, ...utilities, ...admin];
}

export function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="arch flex h-9 w-8 items-end justify-center bg-primary pb-1.5 text-white">
        <Star8 className="h-3.5 w-3.5" />
      </span>
      <span>
        <span className="block font-display text-lg leading-tight text-ink">Tarbiyah</span>
        <span className="block font-arabic text-xs leading-none text-gold" dir="rtl">
          تربية
        </span>
      </span>
    </Link>
  );
}

export function Shell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const nav = navForRole(user.role);
  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-mist/50 lg:flex">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-primary-soft hover:text-primary-dark"
            >
              {item.label}
              {item.arabic && (
                <span className="font-arabic text-xs text-gold" dir="rtl">
                  {item.arabic}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line px-5 py-4 text-sm">
          <p className="font-semibold text-ink">{user.name}</p>
          <p className="text-xs text-ink-soft">
            {ROLE_LABELS[user.role as Role]}
            {user.center ? ` · ${user.center.name}` : ""}
          </p>
          <form action={logout} className="mt-2">
            <button className="text-xs font-semibold text-primary hover:underline">Sign out</button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
          <Brand />
          <MobileNav
            nav={nav}
            userLine={`${user.name} — ${ROLE_LABELS[user.role as Role]}`}
          />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <footer className="border-t border-line px-4 py-4 text-center text-xs text-ink-soft">
          <span className="font-arabic text-sm text-gold" dir="rtl">
            رَبِّ زِدْنِي عِلْمًا
          </span>
          <span className="mx-2">·</span>
          &ldquo;My Lord, increase me in knowledge&rdquo; — Ta-Ha 114
        </footer>
      </div>
    </div>
  );
}
