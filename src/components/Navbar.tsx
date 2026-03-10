import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="border-b border-surface0 bg-mantle">
      <div className="max-w-[960px] mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue">
          CSPathFinder
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
