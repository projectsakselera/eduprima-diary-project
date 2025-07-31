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
  title: "Eduprima Diary - A Journey of Building Civilization Together",
  description: "Where every step in education becomes a meaningful story. Chronicle your mission to elevate humanity through wisdom, dedication, and noble purpose.",
  keywords: ["education diary", "civilization building", "education journey", "mission chronicle", "wisdom sharing", "noble purpose", "staff development", "meaningful education"],
  authors: [{ name: "Eduprima Team" }],
  creator: "Eduprima",
  publisher: "Eduprima",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://dashcode-app.vercel.app'),
  openGraph: {
    title: "Eduprima Diary - A Journey of Building Civilization Together",
    description: "Where every step in education becomes a meaningful story. Chronicle your mission to elevate humanity.",
    type: "website",
    locale: "en_US",
    siteName: "Eduprima Diary",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduprima Diary - A Journey of Building Civilization Together",
    description: "Where every step in education becomes a meaningful story. Chronicle your mission to elevate humanity.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eduprima Diary",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Eduprima Diary",
    "msapplication-TileColor": "#1e293b",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#1e293b",
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
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={`${nunito.className} dashcode-app `} suppressHydrationWarning>
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
