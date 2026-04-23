// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { RealtimeGatewayBridge } from "./RealtimeGatewayBridge";

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
      <body className="font-sans antialiased">
        <RealtimeGatewayBridge />
        {children}
      </body>
    </html>
  );
}