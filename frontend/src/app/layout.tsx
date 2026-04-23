// src/app/layout.tsx
import type { Metadata } from "next";
import { EB_Garamond, Cinzel, IM_Fell_English } from "next/font/google";
import "./globals.css";
import { RealtimeGatewayBridge } from "./RealtimeGatewayBridge";

const ebGaramond = EB_Garamond({ 
  subsets: ["latin", "vietnamese"],
  variable: "--font-eb-garamond",
});

const cinzel = Cinzel({ 
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const imFellEnglish = IM_Fell_English({ 
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-im-fell-english",
});

export const metadata: Metadata = {
  title: "Werewolf Nightfall",
  description: "Dark Fantasy Werewolf Game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${ebGaramond.variable} ${cinzel.variable} ${imFellEnglish.variable} font-sans antialiased`}>
        <RealtimeGatewayBridge />
        {children}
      </body>
    </html>
  );
}