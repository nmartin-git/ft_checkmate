
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // TRÈS IMPORTANT pour que Tailwind fonctionne
import Topbar from "@/src/components/Topbar";
import LoginModal from "@/src/components/Modals/LoginModal";
import RegisterModal from "@/src/components/Modals/RegisterModal";
import NotifModal from "@/src/components/Modals/NotifModal";
import AuthProvider from "@/src/components/AuthProvider";

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
    <html lang="fr" className= "bg-green-800">
      <body className="h-full text-white">
        <div >
          <AuthProvider>
            <RegisterModal/>
            <LoginModal/>
            <NotifModal/>
            <Topbar />
            <div>
              {children}
            </div>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}