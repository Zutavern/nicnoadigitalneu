import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { PasswordProtection } from "@/components/password-protection";
import { Inter } from "next/font/google";
import { SupabaseProvider } from '@/components/providers/supabase-provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NICNOA & CO. DIGITAL",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${inter.className}`}
      >
        <SupabaseProvider>
          <PasswordProtection />
          {children}
          <Footer />
          <CookieBanner />
        </SupabaseProvider>
      </body>
    </html>
  );
}
