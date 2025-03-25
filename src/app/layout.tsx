import type { Metadata } from "next";
import { notoSansJP, montserrat } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AccessibilityProvider } from "@/components/ui";

export const metadata: Metadata = {
  title: "Yasuna A. Portfolio",
  description: "初めまして。ポートフォリオサイトです。ゆっくりしていってください。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${montserrat.variable} max-md:scroll-pt-20 scroll-smooth`}
      suppressHydrationWarning
    >
      <body className={`${notoSansJP.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AccessibilityProvider>{children}</AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
