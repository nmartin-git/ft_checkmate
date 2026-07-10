import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/src/app/globals.css"; 
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Topbar from "@/src/components/Topbar";
import PlayModal from "@/src/components/Modals/PlayModal";
import LoginModal from "@/src/components/Modals/LoginModal";
import RegisterModal from "@/src/components/Modals/RegisterModal";
import NotifModal from "@/src/components/Modals/NotifModal";
import AuthProvider from "@/src/components/AuthProvider";
import Footer from "@/src/components/Footer";

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
  <html lang={locale} className="bg-[#262522]">
    <body className="min-h-screen flex flex-col text-white">
      {}
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthProvider>
          <RegisterModal />
          <LoginModal />
          <NotifModal />
          <PlayModal />
          <Topbar />
          <PlayModal />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </NextIntlClientProvider>
    </body>
  </html>
);
}