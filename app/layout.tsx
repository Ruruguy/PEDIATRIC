import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PEDS//FIELD｜小兒・嬰兒・新生兒救護教學",
  description: "專注小兒、嬰兒與新生兒的院前急救、救護流程、技術操作與情境教學。",
  openGraph: {
    title: "PEDS//FIELD 兒少救護教學",
    description: "先看見孩子的不一樣。專注新生兒、嬰兒與兒童的院前救護訓練。",
    images: [{ url: "/og-v2.png", width: 1536, height: 1024, alt: "PEDS//FIELD 兒少救護教學" }],
  },
  twitter: { card: "summary_large_image", title: "PEDS//FIELD 兒少救護教學", description: "先看見孩子的不一樣。", images: ["/og-v2.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
