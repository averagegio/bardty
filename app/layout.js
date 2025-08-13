import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation */}
        {/* Using a client component for interactivity, safe to include here */}
        <header className="sticky top-0 z-40 w-full border-b border-black/[.08] dark:border-white/[.145] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Image src="/bardtylogo.jpg" alt="Bardty logo" width={28} height={28} className="rounded-sm" />
              <span className="font-semibold text-lg tracking-tight">bardty</span>
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a className="hover:underline" href="/feed">Feed</a>
              <a className="hover:underline" href="/live">Live</a>
              <a className="hover:underline" href="/cart">Cart</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
        <footer className="border-t border-black/[.08] dark:border-white/[.145] py-6 text-center text-xs text-foreground/70">
          © {new Date().getFullYear()} Bardty. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
