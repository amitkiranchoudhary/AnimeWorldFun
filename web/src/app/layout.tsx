import type { Metadata } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";
import SiteBackground from "@/components/SiteBackground";
import StrawHatCursor from "@/components/StrawHatCursor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientSky from "@/components/ambient/AmbientSky";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { SITE_URL } from "@/lib/site";

const bangers = Bangers({
  variable: "--font-bangers",
  weight: "400",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: "Anime World Fun",
    type: "website",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Anime World Fun — heroes from your favourite anime" }],
  },
  twitter: { card: "summary_large_image" },
  title: {
    default: "Anime World Fun — find, track & read about anime",
    template: "%s · Anime World Fun",
  },
  description:
    "Find every anime, see where to watch it and in which language (sub or dub), track what you've watched, and read fan blogs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bangers.variable} ${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* without JavaScript, scroll reveals would stay hidden — show everything */}
        <noscript>
          <style>{`.reveal,.split-piece{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <SiteBackground />
        <AmbientSky />
        <SmoothScroll />
        <StrawHatCursor />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <div className="film-grain" aria-hidden />
      </body>
    </html>
  );
}
