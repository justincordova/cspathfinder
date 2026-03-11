"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto max-w-[800px] mt-4 rounded-lg border border-surface0 bg-mantle px-8 shadow-sm">
      <div className="h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue">
          CSPathFinder
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/resources"
            className={`text-sm font-medium transition-colors ${
              pathname === "/resources" ? "text-blue" : "text-text hover:text-subtext0"
            }`}
          >
            Resources
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
