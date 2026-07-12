"use client";

import { useEffect, useMemo, useState } from "react";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const ARABIC: Record<string, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

type Timings = Record<string, string>;
type AlAdhanData = {
  timings: Timings;
  date: { hijri: { day: string; month: { en: string }; year: string }; readable: string };
  meta: { timezone: string };
};

const toMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

const fmt12 = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

type Period = "day" | "evening" | "night";

function periodOf(t: Timings, now: Date): Period {
  const n = now.getHours() * 60 + now.getMinutes();
  if (n >= toMin(t.Sunrise) && n < toMin(t.Asr)) return "day";
  if (n >= toMin(t.Asr) && n < toMin(t.Isha)) return "evening";
  return "night";
}

export function PrayerTimes({
  latitude,
  longitude,
  method = 3,
  locationLabel,
  compact = false,
  variant = "widget",
}: {
  latitude?: number;
  longitude?: number;
  method?: number;
  locationLabel?: string;
  compact?: boolean;
  variant?: "widget" | "full";
}) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null
  );
  const [label, setLabel] = useState(locationLabel ?? "");
  const [data, setData] = useState<AlAdhanData | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  // Ask the browser for a more precise location when none was provided
  useEffect(() => {
    if (coords || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLabel("Your location");
      },
      () => {
        // Fall back to Makkah so the section still shows something useful
        setCoords({ lat: 21.4225, lng: 39.8262 });
        setLabel("Makkah (default — allow location access for local times)");
      },
      { timeout: 8000 }
    );
  }, [coords]);

  useEffect(() => {
    if (!coords) return;
    const d = new Date();
    const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
    fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.lat}&longitude=${coords.lng}&method=${method}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 200) setData(json.data);
        else setError("Could not load prayer times.");
      })
      .catch(() => setError("Could not load prayer times. Check your connection."));
  }, [coords, method]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!data) return null;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (const p of PRAYERS) {
      const [h, m] = data.timings[p].split(":").map(Number);
      if (h * 60 + m > nowMin) return { name: p, minutes: h * 60 + m - nowMin };
    }
    return { name: "Fajr", minutes: null as number | null };
  }, [data, now]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data)
    return (
      <p className="animate-pulse text-sm text-ink-soft">
        Locating you and fetching today&rsquo;s prayer times…
      </p>
    );

  const hijri = `${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year} AH`;

  if (variant === "widget" && nextPrayer) {
    const period = periodOf(data.timings, now);
    const night = period === "night";
    const sky = {
      day: "sky-day border-line text-ink",
      evening: "sky-evening border-line text-ink",
      night: "sky-night border-transparent text-white",
    }[period];
    const soft = night ? "text-white/75" : "text-ink-soft";
    const others = PRAYERS.filter((p) => p !== nextPrayer.name);
    const clock = fmt12(`${now.getHours()}:${now.getMinutes()}`);
    const dateLine = now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });

    return (
      <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border px-4 py-3 ${sky}`}>
        <div className="min-w-[104px]">
          <p className="font-display text-lg leading-tight">{clock}</p>
          <p className={`text-xs ${soft}`}>
            {dateLine} · <span className={night ? "text-gold-soft" : "text-gold"}>{hijri}</span>
          </p>
          {label && <p className={`text-[10px] ${soft}`}>{label}</p>}
        </div>
        <div className={`hidden w-px self-stretch sm:block ${night ? "bg-white/25" : "bg-line"}`} />
        <div>
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${soft}`}>
            Next{nextPrayer.minutes == null && " (tomorrow)"} ·{" "}
            <span className={`font-arabic text-xs normal-case ${night ? "text-gold-soft" : "text-gold"}`} dir="rtl">
              {ARABIC[nextPrayer.name]}
            </span>
          </p>
          <p className="font-display text-2xl leading-tight">
            {nextPrayer.name} {fmt12(data.timings[nextPrayer.name])}
          </p>
          {nextPrayer.minutes != null && (
            <p className={`text-xs ${soft}`}>
              in {Math.floor(nextPrayer.minutes / 60) > 0 ? `${Math.floor(nextPrayer.minutes / 60)}h ` : ""}
              {nextPrayer.minutes % 60}m
            </p>
          )}
        </div>
        <div className="ms-auto flex flex-wrap gap-1.5">
          {others.map((p) => (
            <span
              key={p}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                night ? "border-white/40 text-white/90" : "border-line-strong bg-white/60 text-ink"
              }`}
            >
              <span className="font-semibold">{p}</span> {fmt12(data.timings[p])}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-ink-soft">
          {label && <span>{label} · </span>}
          <span className="font-semibold text-gold">{hijri}</span>
        </p>
        {nextPrayer && (
          <p className="text-sm font-semibold text-primary">
            Next: {nextPrayer.name}
            {nextPrayer.minutes != null &&
              ` in ${Math.floor(nextPrayer.minutes / 60) > 0 ? `${Math.floor(nextPrayer.minutes / 60)}h ` : ""}${nextPrayer.minutes % 60}m`}
          </p>
        )}
      </div>
      <div className={`grid gap-2 ${compact ? "grid-cols-5" : "grid-cols-2 sm:grid-cols-5 sm:gap-3"}`}>
        {PRAYERS.map((p) => {
          const isNext = nextPrayer?.name === p;
          return (
            <div
              key={p}
              className={`arch flex flex-col items-center border px-2 pb-3 pt-5 ${
                isNext ? "border-primary bg-primary text-white" : "border-line bg-white text-ink"
              }`}
            >
              <span className={`font-arabic text-base leading-none ${isNext ? "text-gold-soft" : "text-gold"}`} dir="rtl">
                {ARABIC[p]}
              </span>
              <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80">{p}</span>
              <span className="mt-0.5 font-display text-lg">{data.timings[p]}</span>
            </div>
          );
        })}
      </div>
      {!compact && (
        <p className="mt-3 text-xs text-ink-soft">
          Sunrise {data.timings.Sunrise} · Timezone {data.meta.timezone} · Method {method} (AlAdhan)
        </p>
      )}
    </div>
  );
}
