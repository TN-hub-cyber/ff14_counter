import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "英語禁止配信カウンター",
  description:
    "配信者ごとの英語（カタカナ語）回数をカウントし、リスナーの合計回数予想を管理する配信用ツール。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
