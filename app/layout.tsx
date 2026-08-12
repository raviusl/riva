import type { Metadata } from "next";
import { Carlito, Great_Vibes } from "next/font/google";
import "./globals.css";

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

const carlito = Carlito({
  variable: "--font-carlito",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Samuel & Jun Yu",
  description: "Samuel & Jun Yu Wedding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${greatVibes.variable} ${carlito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
