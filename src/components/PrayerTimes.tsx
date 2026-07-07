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

export function PrayerTimes({
  latitude,
  longitude,
  method = 3,
  locationLabel,
  compact = false,
}: {
  latitude?: number;
  longitude?: number;
  method?: number;
  locationLabel?: string;
  compact?: boolean;
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
