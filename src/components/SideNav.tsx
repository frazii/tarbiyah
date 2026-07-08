"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./Shell";
import { Icon } from "./icons";

export function SideNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-0.5 px-3 py-4">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/") || pathname.startsWith(item.href + "?");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-primary-soft text-primary-dark"
                : "text-ink-soft hover:bg-secondary-soft hover:text-secondary-dark"
            }`}
          >
            <Icon name={item.icon} className={`h-5 w-5 ${active ? "text-primary" : "text-secondary"}`} />
            <span className="flex-1">{item.label}</span>
            {item.arabic && (
              <span className="font-arabic text-xs text-gold" dir="rtl">
                {item.arabic}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
