import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import MountedProvider from "@/providers/mounted.provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
const nunito = Nunito({ subsets: ["latin"] });
// language
import { getLangDir } from "rtl-detect";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import DirectionProvider from "@/providers/direction-provider";
import AuthProvider from "@/providers/auth.provider";

export const metadata: Metadata = {
  title: "Eduprima Space - Professional Education Management Dashboard",
  description: "Modern education management dashboard built with Next.js, TypeScript, and Tailwind CSS. Features analytics, student management, course management and more.",
  keywords: ["education dashboard", "react", "next.js", "typescript", "tailwind css", "analytics", "student management", "course management"],
  authors: [{ name: "Eduprima Team" }],
  creator: "Eduprima",
  publisher: "Eduprima",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://dashcode-app.vercel.app'),
  openGraph: {
    title: "Eduprima Space - Professional Education Management Dashboard",
    description: "Modern education management dashboard built with Next.js, TypeScript, and Tailwind CSS",
    type: "website",
    locale: "en_US",
    siteName: "Eduprima Space",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduprima Space - Professional Education Management Dashboard",
    description: "Modern education management dashboard built with Next.js, TypeScript, and Tailwind CSS",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eduprima Space",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Eduprima Space",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#000000",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const direction = getLangDir(locale);
  return (
    <html lang={locale} dir={direction}>
      <body className={`${nunito.className} dashcode-app `}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <MountedProvider>
                <DirectionProvider direction={direction}>
                  {children}
                </DirectionProvider>
              </MountedProvider>
              <Toaster />
              <SonnerToaster />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
