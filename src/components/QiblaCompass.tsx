"use client";

import { useEffect, useState } from "react";
import { KAABA } from "@/lib/constants";

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

/** Great-circle initial bearing from (lat,lng) to the Kaaba, in degrees from true north. */
export function qiblaBearing(lat: number, lng: number) {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function distanceKm(lat: number, lng: number) {
  const R = 6371;
  const dφ = toRad(KAABA.lat - lat);
  const dλ = toRad(KAABA.lng - lng);
  const a =
    Math.sin(dφ / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dλ / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

type OrientationEventWithWebkit = DeviceOrientationEvent & { webkitCompassHeading?: number };

export function QiblaCompass() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState("");
  const [heading, setHeading] = useState<number | null>(null);
  const [compassState, setCompassState] = useState<"idle" | "active" | "unsupported">("idle");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("This browser does not support location access.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError("Location access was denied. Allow location access to find the qibla from where you are."),
      { timeout: 10000 }
    );
  }, []);

  async function enableCompass() {
    type DOEClass = { requestPermission?: () => Promise<string> };
    const doe = DeviceOrientationEvent as unknown as DOEClass;
    if (typeof doe.requestPermission === "function") {
      try {
        const res = await doe.requestPermission();
        if (res !== "granted") {
          setCompassState("unsupported");
          return;
        }
      } catch {
        setCompassState("unsupported");
        return;
      }
    }
    const handler = (e: DeviceOrientationEvent) => {
      const webkit = (e as OrientationEventWithWebkit).webkitCompassHeading;
      if (webkit != null) setHeading(webkit);
      else if (e.absolute && e.alpha != null) setHeading(360 - e.alpha);
      else if (e.alpha != null) setHeading(360 - e.alpha);
    };
    window.addEventListener("deviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation", handler as EventListener);
    setCompassState("active");
  }

  if (geoError) return <p className="rounded-lg bg-danger-soft p-4 text-sm text-danger">{geoError}</p>;
  if (!coords) return <p className="animate-pulse text-sm text-ink-soft">Getting your location…</p>;

  const bearing = qiblaBearing(coords.lat, coords.lng);
  const km = distanceKm(coords.lat, coords.lng);
  // With an active compass, rotate the needle relative to the device heading
  const needleRotation = heading != null ? bearing - heading : bearing;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-64 w-64 sm:h-72 sm:w-72">
        <div className="absolute inset-0 rounded-full border-2 border-line bg-mist/40" />
        {["N", "E", "S", "W"].map((d, i) => (
          <span
            key={d}
            className="absolute font-display text-sm text-ink-soft"
            style={{
              top: i === 0 ? "6px" : i === 2 ? "auto" : "50%",
              bottom: i === 2 ? "6px" : "auto",
              left: i === 3 ? "10px" : i === 1 ? "auto" : "50%",
              right: i === 1 ? "10px" : "auto",
              transform: `translate(${i % 2 === 0 ? "-50%" : "0"}, ${i % 2 !== 0 ? "-50%" : "0"})`,
            }}
          >
            {d}
          </span>
        ))}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
          style={{ transform: `rotate(${needleRotation}deg)` }}
        >
          <div className="flex h-full flex-col items-center justify-start pt-7">
            <span className="font-arabic text-2xl leading-none text-primary" dir="rtl">
              ٱلْكَعْبَة
            </span>
            <svg viewBox="0 0 24 60" className="mt-1 h-24 w-8 text-primary" fill="currentColor" aria-hidden>
              <path d="M12 0l7 22H5z" />
              <rect x="10.5" y="22" width="3" height="38" rx="1.5" className="text-line" fill="currentColor" opacity="0.4" />
            </svg>
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
      </div>

      <div className="mt-6 text-center">
        <p className="font-display text-2xl text-ink">
          {Math.round(bearing)}° <span className="text-base text-ink-soft">from true north</span>
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          You are ~{km.toLocaleString()} km from the Kaaba in Makkah.
        </p>
        {compassState !== "active" && (
          <button
            onClick={enableCompass}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Enable live compass
          </button>
        )}
        {compassState === "active" && heading == null && (
          <p className="mt-3 text-xs text-ink-soft">
            Waiting for compass data — this works best on a phone. On devices without a compass, face{" "}
            {Math.round(bearing)}° using a physical compass.
          </p>
        )}
        {compassState === "unsupported" && (
          <p className="mt-3 text-xs text-ink-soft">
            Compass unavailable on this device. Face {Math.round(bearing)}° from true north using a
            physical compass or a maps app.
          </p>
        )}
      </div>
    </div>
  );
}
