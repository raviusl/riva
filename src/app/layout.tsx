import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { RivaBackground } from "@/components/layout/riva-background";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/config/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative min-h-svh bg-transparent text-white antialiased`}
      >
        <RivaBackground />
        <div className="relative z-10 min-h-svh bg-transparent">
          <AppProviders>{children}</AppProviders>
        </div>
      </body>
    </html>
  );
}
