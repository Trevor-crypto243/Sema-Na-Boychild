import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Sema Na Boychild | Mentoring the Boy-Child",
  description: "Sema Na Boychild is an NGO dedicated to mentoring, guiding, and empowering young men in Kenya through school visits, seminars, and mentorship programs.",
  keywords: ["mentorship", "boy-child", "Kenya", "NGO", "youth empowerment", "education"],
  openGraph: {
    title: "Sema Na Boychild",
    description: "Every boy deserves a voice. Mentoring the boy-child in Kenya.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans antialiased scroll-smooth", inter.variable)}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
