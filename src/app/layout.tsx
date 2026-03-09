import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { cn } from "@/utils/cn";
import "./globals.css";

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: "Next.js Bun Starter",
    template: "%s | Next.js Bun Starter",
  },
  description: "Production-ready Next.js starter with Bun, TypeScript, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(geistMono.variable, "bg-background font-mono antialiased")}>{children}</body>
    </html>
  );
}
