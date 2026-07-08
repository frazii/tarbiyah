import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { brandStyle } from "@/lib/branding";
import { Field, Star8, btnPrimary, inputCls } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; center?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const { error, center: centerSlug } = await searchParams;

  const center = centerSlug
    ? await prisma.center.findUnique({ where: { slug: centerSlug } })
    : null;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10" style={brandStyle(center?.brandColor)}>
      <div className="w-full max-w-md">
        <div className="arch-card border border-line bg-white px-6 pb-8 pt-10 sm:px-10">
          <div className="text-center">
            {center?.logoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={center.logoData}
                alt={`${center.name} logo`}
                className="mx-auto h-16 w-16 rounded-xl border border-line bg-white object-contain"
              />
            ) : (
              <span className="arch mx-auto flex h-12 w-10 items-end justify-center bg-primary pb-2 text-white">
                <Star8 className="h-4 w-4" />
              </span>
            )}
            <h1 className="mt-4 font-display text-2xl text-ink">
              {center ? `Sign in to ${center.name}` : "Sign in to Tarbiyah"}
            </h1>
            {center ? (
              <p className="mt-1 text-sm text-ink-soft">
                {center.city}, {center.country} · powered by Tarbiyah{" "}
                <span className="font-arabic text-gold" dir="rtl">تربية</span>
              </p>
            ) : (
              <p className="mt-1 font-arabic text-lg text-gold" dir="rtl">
                تربية
              </p>
            )}
          </div>

          {error && (
            <p className="mt-5 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
              That email and password don&rsquo;t match. Try again.
            </p>
          )}

          <form action={login} className="mt-6 space-y-4">
            {center && <input type="hidden" name="center" value={center.slug} />}
            <Field label="Email">
              <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@example.com" />
            </Field>
            <Field label="Password">
              <input name="password" type="password" required autoComplete="current-password" className={inputCls} placeholder="••••••••" />
            </Field>
            <button type="submit" className={`${btnPrimary} w-full`}>
              Sign in
            </button>
          </form>
        </div>

        {!center && (
          <div className="mt-4 rounded-xl border border-line bg-mist/60 p-4 text-xs text-ink-soft">
            <p className="font-semibold text-ink">Demo accounts (password: tarbiyah123)</p>
            <ul className="mt-1.5 space-y-0.5">
              <li>super@tarbiyah.app — Super Admin (all centers)</li>
              <li>admin@alnoor.example — Center Admin, Al-Noor</li>
              <li>ahmad@alnoor.example — Teacher, Al-Noor</li>
              <li>parent@alnoor.example — Parent, Al-Noor</li>
            </ul>
          </div>
        )}

        <p className="mt-4 text-center text-sm">
          <Link href="/" className="font-semibold text-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
