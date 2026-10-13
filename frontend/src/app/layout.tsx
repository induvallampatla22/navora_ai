import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NAVORA | AI Travel Operating Platform",
  description: "Worldwide AI-powered end-to-end Travel Operating Platform",
};

import { Providers } from "@/lib/providers";
import { I18nProvider, useI18n } from "@/lib/i18n";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider><Providers>{children}</Providers></I18nProvider>
      </body>
    </html>
  );
}
