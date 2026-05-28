import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "마따이 ⚖️ 커플 갈등 해결소",
  description: "커플 싸움을 공정하게 판결해드립니다",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
