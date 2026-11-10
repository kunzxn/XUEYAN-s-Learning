import {SessionProvider} from "@/lib/session";
import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Sans_SC, Noto_Serif_SC, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSansSc = Noto_Sans_SC({
  variable: "--font-zh",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const notoSerifSc = Noto_Serif_SC({
  variable: "--font-zh-serif",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "XUEYAN | Học tiếng Trung",
  description: "XUEYAN — học tiếng Trung qua chữ Hán, Pinyin, từ vựng HSK và thực hành ghi nhớ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${notoSansSc.variable} ${notoSerifSc.variable} ${sourceSerif.variable}`}>
      <body><SessionProvider>{children}</SessionProvider></body>
    </html>
  );
}
