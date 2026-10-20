import type { Metadata } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";
import SiteBackground from "@/components/SiteBackground";
import StrawHatCursor from "@/components/StrawHatCursor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        <SiteBackground />
        <StrawHatCursor />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
