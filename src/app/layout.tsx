import type { ReactElement, ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans, Sora } from "next/font/google";

import { SITE } from "@/lib/seo";
import { AppProviders } from "@/components/providers/AppProviders";
import { DemoSwitcher } from "@/components/demo/DemoSwitcher";

import "@/styles/globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-sora",
});
/** Dashboard face (portals only): geometric, compact, with clear figures for data. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
  preload: false,
});
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Live courses in software & AI`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0B1428",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html
      lang="en-PK"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} ${jakarta.variable}`}
    >
      <body>
        <AppProviders>
          {children}
          <DemoSwitcher />
        </AppProviders>
      </body>
    </html>
  );
}
