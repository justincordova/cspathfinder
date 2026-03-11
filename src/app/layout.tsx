import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { cn } from "@/utils/cn";
import Navbar from "@/components/Navbar";
import ChatProvider from "@/components/ChatProvider";
import ChatButton from "@/components/ChatButton";
import ChatDrawer from "@/components/ChatDrawer";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import { useChatContext } from "@/components/ChatProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const themeScript = `
(function() {
  try { var t = localStorage.getItem('theme'); } catch(e) {}
  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'mocha' : 'latte';
  if (t === 'mocha') document.documentElement.setAttribute('data-theme', 'mocha');
})();
`;

export const metadata: Metadata = {
  title: {
    default: "CSPathFinder",
    template: "%s | CSPathFinder",
  },
  description: "Find and compare top Computer Science programs across US colleges.",
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useChatContext();
  const marginClass = isOpen ? "md:mr-[420px] lg:mr-[420px]" : "";

  return (
    <main
      className={cn(
        "max-w-[960px] mx-auto px-8 transition-all duration-300 ease-in-out",
        marginClass
      )}
    >
      {children}
    </main>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={cn(
          inter.variable,
          geistMono.variable,
          "bg-base text-text font-sans antialiased"
        )}
      >
        <SkipLink />
        <ErrorBoundary>
          <ChatProvider>
            <Navbar />
            <LayoutContent>{children}</LayoutContent>
            <ChatButton />
            <ChatDrawer />
          </ChatProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
