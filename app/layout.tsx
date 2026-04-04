import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Review Machine — AI Review Funnels for Local Businesses",
  description:
    "Generate high-converting Google review scripts with AI, share polished review pages, and manage multiple clients from one premium dashboard. Used by 500+ businesses.",
  keywords: [
    "Google reviews",
    "AI review generator",
    "review funnel",
    "local SEO",
    "review management",
    "Google Business Profile",
  ],
  icons: {
    icon: "/review-machine-logo.png",
  },
  openGraph: {
    title: "Review Machine — AI Review Funnels for Local Businesses",
    description:
      "Turn happy customers into 5-star reviews automatically with AI-powered review funnels.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-paper font-sans">{children}</body>
    </html>
  );
}
