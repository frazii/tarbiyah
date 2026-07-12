import Link from "next/link";
import { logout } from "@/lib/actions";
import type { CurrentUser } from "@/lib/auth";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { MobileNav } from "./MobileNav";
import { SideNav } from "./SideNav";
import { Star8 } from "./ui";
import { brandStyle } from "@/lib/branding";

export type NavItem = { href: string; label: string; icon: string; arabic?: string };

export function navForRole(role: string): NavItem[] {
  const base: NavItem[] = [{ href: "/dashboard", label: "Dashboard", icon: "home" }];
  const staff: NavItem[] = [
    { href: "/students", label: "Students", icon: "students" },
    { href: "/classes", label: "Classes", icon: "classes" },
    { href: "/attendance", label: "Attendance", icon: "attendance" },
    { href: "/fees", label: "Fees", icon: "fees" },
    { href: "/announcements", label: "Announcements", icon: "announcements" },
    { href: "/events", label: "Events", icon: "events" },
    { href: "/progress", label: "Progress", icon: "progress" },
  ];
  const parent: NavItem[] = [
    { href: "/announcements", label: "Announcements", icon: "announcements" },
    { href: "/events", label: "Events", icon: "events" },
    { href: "/fees", label: "Fees", icon: "fees" },
  ];
  const utilities: NavItem[] = [
    { href: "/prayer-times", label: "Prayer Times", icon: "prayer", arabic: "الأذان" },
    { href: "/qibla", label: "Qibla Locator", icon: "qibla", arabic: "القبلة" },
  ];
  const admin: NavItem[] = [{ href: "/admin", label: "Administration", icon: "admin" }];

  if (role === "PARENT") return [...base, ...parent, ...utilities];
  if (role === "TEACHER") return [...base, ...staff, ...utilities];
  if (role === "SUPER_ADMIN") {
    return [
      ...base,
      { href: "/portal", label: "Platform Portal", icon: "portal" },
      ...staff,
      ...utilities,
      ...admin,
    ];
  }
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
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen w-full flex-col" style={brandStyle(user.center?.brandColor)}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <MobileNav nav={nav} userLine={`${user.name} — ${ROLE_LABELS[user.role as Role]}`} />
            </div>
            <Brand />
          </div>
          <div className="hidden items-center gap-2 text-sm text-ink-soft sm:flex">
            {user.center?.logoData && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.center.logoData}
                alt={`${user.center.name} logo`}
                className="h-8 w-8 rounded-lg border border-line bg-white object-contain"
              />
            )}
            <span className="font-semibold text-ink">{user.center ? user.center.name : "All centers"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink">{user.name}</p>
              <p className="text-xs leading-tight text-ink-soft">{ROLE_LABELS[user.role as Role]}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-soft text-sm font-bold text-secondary">
              {initials}
            </span>
            <form action={logout}>
              <button className="rounded-lg border border-line-strong bg-mist px-3 py-1.5 text-xs font-semibold text-ink hover:bg-danger-soft hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-line bg-white lg:block">
          <SideNav nav={nav} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-mist/40">
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
    </div>
  );
}
