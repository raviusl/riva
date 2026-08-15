import type { Metadata } from "next";
import { carlito, cormorantGaramond, greatVibes } from "./fonts";
import "./globals.css";

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
    <html
      lang="en"
      className={`${greatVibes.variable} ${cormorantGaramond.variable} ${carlito.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
