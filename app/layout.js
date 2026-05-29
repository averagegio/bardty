import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderNav from "./components/HeaderNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bardty — Live Shopping & Interactive Feed",
  description: "Shop live with creators and browse an interactive feed of shoppable videos and products.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeaderNav />

        <main className="mx-auto max-w-none px-0 sm:px-0 pt-0 pb-0 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
        <footer className="border-t border-black/[.08] dark:border-white/[.145] py-6 text-center text-xs text-foreground/70" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          © {new Date().getFullYear()} Bardty. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
