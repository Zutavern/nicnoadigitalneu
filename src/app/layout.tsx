import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeColorProvider } from "@/components/providers/theme-color-provider";
import { CookieConsentProvider } from "@/components/providers/cookie-consent-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { CookieConsentBanner, CookieSettingsButton } from "@/components/cookie-consent-banner";
import { PasswordProtection } from "@/components/password-protection";
import { SessionGuard } from "@/components/session-guard";
import { Toaster } from "sonner";
import cookiesData from "@/data/cookies.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Statische Metadata (dynamische SEO wird über individuelle Seiten gesteuert)
export const metadata: Metadata = {
  title: {
    default: "NICNOA&CO.online",
    template: "%s | NICNOA&CO.online",
  },
  description: "Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.nicnoa.online"),
  openGraph: {
    type: "website",
    siteName: "NICNOA&CO.online",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* CSS-based blocking: Hide ALL content until password-unlocked class is added */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Initial state: Everything hidden except password protection overlay */
              html:not(.password-unlocked) body {
                background: #020203 !important;
              }
              html:not(.password-unlocked) body > *:not([data-password-protection]) {
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
              /* Ensure password protection is always visible */
              [data-password-protection] {
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
              }
              /* Smooth transition when unlocking */
              html.password-unlocked body > * {
                transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
              }
            `,
          }}
        />
        {/* Password protection init script - must be in head for immediate execution */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (sessionStorage.getItem('passwordEntered') === 'true') {
                    document.documentElement.classList.add('password-unlocked');
                  }
                } catch(e) {
                  document.documentElement.classList.add('password-unlocked');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* SSR-kompatibles Blocking-Overlay - wird sofort gerendert */}
        <div 
          id="ssr-password-block"
          data-password-protection
          className="fixed inset-0 z-[9998] bg-[#020203] transition-opacity duration-300"
          style={{ opacity: 1 }}
          suppressHydrationWarning
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var block = document.getElementById('ssr-password-block');
                if (block && sessionStorage.getItem('passwordEntered') === 'true') {
                  block.style.opacity = '0';
                  block.style.pointerEvents = 'none';
                  setTimeout(function() { block.remove(); }, 300);
                }
              })();
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorProvider />
          <PostHogProvider>
            <SessionProvider>
              <CookieConsentProvider categories={cookiesData.categories}>
                <SessionGuard />
                <PasswordProtection />
                {children}
                <CookieConsentBanner />
                <CookieSettingsButton />
                <Toaster richColors position="top-right" />
              </CookieConsentProvider>
            </SessionProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
