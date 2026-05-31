import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NGワード配信カウンター",
  description:
    "配信者ごとのNGワード回数をカウントし、リスナーの予想を管理する配信用ツール。",
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
