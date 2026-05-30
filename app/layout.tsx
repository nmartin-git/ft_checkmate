
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // TRÈS IMPORTANT pour que Tailwind fonctionne
import Topbar from "@/components/Topbar";
import LoginModal from "@/components/Modals/LoginModal";
import RegisterModal from "@/components/Modals/RegisterModal";
import NotifModal from "@/components/Modals/NotifModal";

// Configuration des polices par défaut de Next.js
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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full bg-green-900 text-white">
        <div >
          <div>
            <RegisterModal/>
            <LoginModal/>
            <NotifModal/>
            <Topbar />
            <div>
              {children}
            </div>

          </div>
        </div>
      </body>
    </html>
  );
}