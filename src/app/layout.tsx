import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeColorProvider } from "@/components/providers/theme-color-provider";
import { CookieConsentProvider } from "@/components/providers/cookie-consent-provider";
import { CookieConsentBanner, CookieSettingsButton } from "@/components/cookie-consent-banner";
import { PasswordProtection } from "@/components/password-protection";
import { SessionGuard } from "@/components/session-guard";
import cookiesData from "@/data/cookies.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NICNOA&CO.online",
  description: "Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorProvider />
          <SessionProvider>
            <CookieConsentProvider categories={cookiesData.categories}>
              <SessionGuard />
              <PasswordProtection />
              {children}
              <CookieConsentBanner />
              <CookieSettingsButton />
            </CookieConsentProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
