"use client";

import { cn } from "@/utils/cn";
import { useChatContext } from "@/components/ChatProvider";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useChatContext();
  const marginClass = isOpen ? "md:mr-[420px]" : "";

  return (
    <div className={cn("transition-[margin-right] duration-500 ease-out", marginClass)}>
      {children}
    </div>
  );
}
