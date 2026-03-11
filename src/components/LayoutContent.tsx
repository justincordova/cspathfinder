"use client";

import { cn } from "@/utils/cn";
import { useChatContext } from "@/components/ChatProvider";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useChatContext();
  const marginClass = isOpen ? "md:mr-[420px]" : "";

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
