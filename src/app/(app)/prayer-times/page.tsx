import { requireUser } from "@/lib/auth";
import { PrayerTimes } from "@/components/PrayerTimes";
import { Card, PageHeader } from "@/components/ui";

export default async function PrayerTimesPage() {
  const user = await requireUser();
  const center = user.center;

  return (
    <div>
      <PageHeader
        title="Adhan timings"
        arabic="مواقيت الصلاة"
        subtitle="Daily prayer times from the AlAdhan calendar service"
      />
      <Card>
        <h2 className="mb-3 font-display text-lg">Your location</h2>
        <PrayerTimes variant="full" />
      </Card>
      {center && (
        <Card className="mt-4">
          <h2 className="mb-3 font-display text-lg">{center.name}</h2>
          <PrayerTimes
            variant="full"
            latitude={center.latitude}
            longitude={center.longitude}
            method={center.calcMethod}
            locationLabel={`${center.city}, ${center.country}`}
          />
        </Card>
      )}
    </div>
  );
}
