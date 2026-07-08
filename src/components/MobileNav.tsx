"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./Shell";
import { Icon } from "./icons";

export function MobileNav({ nav, userLine }: { nav: NavItem[]; userLine: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div>
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-line p-2 text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[57px] z-50 border-b border-line bg-white shadow-lg">
          <nav className="px-4 py-3">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    active ? "bg-primary-soft text-primary-dark" : "text-ink-soft"
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
            <div className="mt-2 border-t border-line px-3 pt-3 text-xs text-ink-soft">{userLine}</div>
            <form action="/api/logout" method="post" className="px-3 pb-2 pt-1">
              <button className="text-xs font-semibold text-primary hover:underline">Sign out</button>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
