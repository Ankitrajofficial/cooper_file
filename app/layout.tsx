import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cooperfile.com"),
  title: "Cooperfile — AI Review Funnels for Local Businesses",
  description:
    "Help local businesses collect more Google reviews with one-click curated review pages designed to improve trust, local SEO, and Google profile visibility.",
  keywords: [
    "Google reviews",
    "AI review generator",
    "review funnel",
    "local SEO",
    "review management",
    "Google Business Profile",
  ],
  icons: {
    icon: "/cooperfile-logo.svg",
  },
  openGraph: {
    title: "Cooperfile — AI Review Funnels for Local Businesses",
    description:
      "Turn happy customers into curated Google reviews that strengthen local SEO and Google profile visibility.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-paper font-sans">{children}</body>
    </html>
  );
}
