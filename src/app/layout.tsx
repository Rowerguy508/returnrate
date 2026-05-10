import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReturnRate | Know Before You Buy",
  description: "Check return policies and shipping quality before you shop. Find stores that stand behind their products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}