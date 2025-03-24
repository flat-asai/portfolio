import { Montserrat, Noto_Sans_JP } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-montserrat",
});

export const notoSansJP = Noto_Sans_JP({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const mixedFonts = {
  japanese: "--font-noto-sans-jp",
  english: "--font-montserrat",
  cssVars: `var(--font-noto-sans-jp), var(--font-montserrat)`,
};
