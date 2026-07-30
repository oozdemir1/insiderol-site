import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./global.css";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/sections/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://insiderol.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Insiderol | Anonim Maaş ve Şirket Yorumları",
    template: "%s | Insiderol",
  },
  description:
    "Türkiye'deki şirketler için anonim maaş, çalışan yorumu ve mülakat deneyimi platformu. Gerçek çalışan verileriyle bilinçli kariyer kararları al.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Insiderol",
    title: "Insiderol | Anonim Maaş ve Şirket Yorumları",
    description:
      "Türkiye'deki şirketler için anonim maaş, çalışan yorumu ve mülakat deneyimi platformu.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Insiderol | Anonim Maaş ve Şirket Yorumları",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Insiderol | Anonim Maaş ve Şirket Yorumları",
    description:
      "Türkiye'deki şirketler için anonim maaş, çalışan yorumu ve mülakat deneyimi platformu.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1b2421",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-black text-white">
        <NavbarServer />

        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}