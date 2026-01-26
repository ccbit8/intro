import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Background from "./_components/background";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // 关键优化：确保字体加载期间文本可见
});

const myFont = localFont({
  src: "./public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://caelus.cc"),
  title: "Intro",
  description: "A Intro page about cc",
  openGraph: {
    title: "Intro",
    description: "A Intro page about cc",
    images: "/og-image.png",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      
        <body className={`${inter.className} ${myFont.variable}`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Background>{children}</Background>
            <Toaster />
          </ThemeProvider>
        </body>
      
    </html>
  );
}
