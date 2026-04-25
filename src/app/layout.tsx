import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SessionWrapper from "@/components/SessionWrapper";
import { LanguageProvider } from "@/components/LanguageContext";

export const metadata: Metadata = {
  title: "AI Murojaat Tizimi | Compliance Response System",
  description: "Tashqi murojaatlarga (prokuratura, soliq organlari, Markaziy bank) SI orqali qonunchilikka muvofiq javob tayyorlash tizimi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body suppressHydrationWarning>
        <SessionWrapper>
          <LanguageProvider>
            <div className="app-layout">
              <Sidebar />
              <div className="main-content">
                {children}
              </div>
            </div>
          </LanguageProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
