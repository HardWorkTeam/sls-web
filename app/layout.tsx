import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
