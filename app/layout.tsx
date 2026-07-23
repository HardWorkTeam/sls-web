import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Srolanh — Your Wedding, Beautifully Managed",
  description:
    "Srolanh is the all-in-one wedding platform for couples: design digital invitations, track RSVPs, plan seating, manage guests, expenses and gifts — all in one elegant place.",
  keywords: [
    "wedding planner",
    "digital wedding invitation",
    "RSVP",
    "seating chart",
    "wedding management",
    "Khmer wedding",
  ],
  openGraph: {
    title: "Srolanh — Your Wedding, Beautifully Managed",
    description:
      "Design digital invitations, track RSVPs, plan seating and manage every detail of your big day.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
