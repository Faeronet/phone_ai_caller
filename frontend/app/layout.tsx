import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { Roboto, Great_Vibes } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto"
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-great-vibes"
});

export const metadata: Metadata = {
  title: "Phone AI Caller",
  description: "Демо AI-обзвонщика: после заказа звонит клиенту и подтверждает покупку.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`dark ${roboto.variable} ${greatVibes.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <ToastProvider>
          <SiteHeader />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}

