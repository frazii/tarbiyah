import { requireUser } from "@/lib/auth";
import { QiblaCompass } from "@/components/QiblaCompass";
import { Card, PageHeader } from "@/components/ui";

export default async function QiblaPage() {
  await requireUser();
  return (
    <div>
      <PageHeader
        title="Qibla locator"
        arabic="القبلة"
        subtitle="The direction of the Kaaba from where you are"
      />
      <Card>
        <QiblaCompass />
      </Card>
      <p className="mt-3 text-xs text-ink-soft">
        On phones, enable the live compass and hold your device flat. On desktops without a compass,
        use the bearing shown with a physical compass or a maps app. Bearings are relative to true
        north.
      </p>
    </div>
  );
}
