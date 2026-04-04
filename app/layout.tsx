import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Review Machine",
  description:
    "Create Google Business Profile review funnels with public review pages, AI-generated scripts, and multi-client management.",
  icons: {
    icon: "/review-machine-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
