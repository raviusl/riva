import { Carlito, Great_Vibes } from "next/font/google";

/**
 * FINAL approved wedding typography.
 * Couple names must use Great Vibes (luxury script).
 */
export const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  fallback: ["cursive"],
});

export const carlito = Carlito({
  variable: "--font-carlito",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});
