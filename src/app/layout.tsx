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

const chineseFont = localFont({
  src: "./public/fonts/XiangJiaoKuanMaoShuaLingGanTi-2.ttf",
  variable: "--font-cny-zh",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://caelus.cc"),
  title: "个人简介",
  description: "A Intro page about cc",
  openGraph: {
    title: "个人简介",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var root=document.documentElement;var storedLang=localStorage.getItem("home-language");var lang=storedLang==="zh"||storedLang==="en"?storedLang:"en";root.classList.toggle("lang-en",lang==="en");root.classList.toggle("lang-zh",lang==="zh");root.setAttribute("lang",lang==="zh"?"zh-CN":"en");var storedTheme=localStorage.getItem("home-cny-theme-enabled");var cnyEnabled=storedTheme===null?true:storedTheme==="1";root.classList.toggle("home-cny-theme",cnyEnabled);}catch(e){}})();`,
          }}
        />
      </head>
      
        <body className={`${inter.className} ${myFont.variable} ${chineseFont.variable}`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Background>{children}</Background>
            <Toaster />
          </ThemeProvider>
        </body>
      
    </html>
  );
}
