import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; 
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Topbar from "@/src/components/Topbar";
import LoginModal from "@/src/components/Modals/LoginModal";
import RegisterModal from "@/src/components/Modals/RegisterModal";
import NotifModal from "@/src/components/Modals/NotifModal";
import PlayModal from "@/src/components/Modals/PlayModal";
import AuthProvider from "@/src/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ft-chess",
  description: "Créé avec Next.js",
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

  return (
    <html lang={locale} className="bg-green-800">
      <body className="h-full text-white">
        {}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <RegisterModal />
            <LoginModal />
            <NotifModal />
            <PlayModal />
            <Topbar />
            <div>{children}</div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}