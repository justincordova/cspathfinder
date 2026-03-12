"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ChatFilters as SchemaFilters } from "@/lib/data/schema";

export type ChatFilters = SchemaFilters;

export interface ChatContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  pendingFilters: ChatFilters | null;
  applyFilters: (filters: ChatFilters) => void;
  clearPendingFilters: () => void;
  schoolContext: string | null;
  setSchoolContext: (ctx: string | null) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}

export default function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<ChatFilters | null>(null);
  const [schoolContext, setSchoolContext] = useState<string | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const applyFilters = useCallback((filters: ChatFilters) => setPendingFilters(filters), []);
  const clearPendingFilters = useCallback(() => setPendingFilters(null), []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        pendingFilters,
        applyFilters,
        clearPendingFilters,
        schoolContext,
        setSchoolContext,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
