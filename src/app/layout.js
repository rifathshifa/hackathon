import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EquipX — Where Every Equipment Has a Journey",
  description: "Futuristic equipment booking, holographic tracking, verification, and return management.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100 cyber-grid relative overflow-x-hidden">
        {/* Ambient Aurora Atmosphere */}
        <div className="aurora-bg" aria-hidden="true">
          <div className="aurora-blob-1" />
          <div className="aurora-blob-2" />
          <div className="aurora-blob-3" />
        </div>
        <AuthProvider>
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
