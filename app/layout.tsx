import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PEDS//FIELD｜孕婦・小兒・嬰兒・新生兒救護教學",
  description: "整合孕婦急症、小兒尺、生命徵象、APLS／PALS 與新生兒復甦的院前救護學習站。",
  openGraph: {
    title: "PEDS//FIELD 孕婦與兒少救護教學",
    description: "兩站整合版：孕婦急症、新生兒、嬰兒、兒童與互動小兒尺。",
    images: [{ url: "/og-v2.png", width: 1536, height: 1024, alt: "PEDS//FIELD 孕婦與兒少救護教學" }],
  },
  twitter: { card: "summary_large_image", title: "PEDS//FIELD 孕婦與兒少救護教學", description: "孕婦急症與兒少救護兩站整合版。", images: ["/og-v2.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
