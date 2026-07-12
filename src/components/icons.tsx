const PATHS: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5L12 3l9 7.5M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" />,
  students: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.8a3.5 3.5 0 010 6.4M17.5 14.4c2.4.7 4 2.6 4 5.6" />
    </>
  ),
  classes: <path d="M4 19V5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zm0 0a2 2 0 002 2h13M8 7h7" />,
  attendance: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M8.5 14.5l2.5 2.5 4.5-5" />
    </>
  ),
  fees: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M2.5 10h19M6 14.5h4" />
    </>
  ),
  announcements: <path d="M3 11v2a1 1 0 001 1h2l5 4V6l-5 4H4a1 1 0 00-1 1zm11-2.5s1.5 1 1.5 3.5-1.5 3.5-1.5 3.5M17 6s3 2 3 6-3 6-3 6" />,
  events: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16M12 14h4M8 14h.01M8 17.5h4" />
    </>
  ),
  progress: <path d="M4 20V10M10 20V4M16 20v-9M21 20H3" />,
  prayer: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  qibla: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  portal: (
    <>
      <path d="M3 21h18M5 21V8l7-4.5L19 8v13M9.5 21v-4.5h5V21" />
      <path d="M9 11h.01M15 11h.01M9 14.5h.01M15 14.5h.01" />
    </>
  ),
  admin: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5l1.2 2.6 2.8-.6 1 2.7 2.7 1-.6 2.8 2.4 1.5-1.5 2.4.6 2.8-2.7 1-1 2.7-2.8-.6L12 20.5l-1.2-2.6-2.8.6-1-2.7-2.7-1 .6-2.8L2.5 12l1.5-2.4-.6-2.8 2.7-1 1-2.7 2.8.6z" />
    </>
  ),
};

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
