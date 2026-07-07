import type { Metadata } from "next";
import { Karla, Marcellus, Amiri } from "next/font/google";
import "./globals.css";

const karla = Karla({ subsets: ["latin"], variable: "--font-karla" });
const marcellus = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-marcellus" });
const amiri = Amiri({ weight: ["400", "700"], subsets: ["arabic"], variable: "--font-amiri" });

export const metadata: Metadata = {
  title: "Tarbiyah — Islamic Center Management",
  description:
    "Administration platform for Islamic teaching centers: enrolment, attendance, fees, progress, events, prayer times and qibla.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${karla.variable} ${marcellus.variable} ${amiri.variable} font-sans min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
