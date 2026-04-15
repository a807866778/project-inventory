import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "项目进存销管理系统",
  description: "通讯施工团队物料管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
