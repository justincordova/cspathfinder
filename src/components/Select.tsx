"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  "aria-label"?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    // next tick so the enter animation triggers after mount
    requestAnimationFrame(() => setVisible(true));
  }

  function closeMenu() {
    setVisible(false);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }

  function toggle() {
    open ? closeMenu() : openMenu();
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder;

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeMenu();
    if (e.key === "Enter" || e.key === " ") toggle();
  }

  return (
    <div ref={ref} className="relative" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={toggle}
        onKeyDown={handleKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 px-4 py-2 pr-3 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
          "bg-mantle border-surface0 text-text hover:border-subtext0 hover:bg-surface0",
          "focus:outline-none focus:ring-2 focus:ring-blue",
          open && "border-subtext0 bg-surface0"
        )}
      >
        <span className={cn(!selected && "text-subtext0")}>{label}</span>
        <svg
          className={cn(
            "w-4 h-4 text-subtext0 transition-transform duration-200 shrink-0",
            open && visible && "rotate-180"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          style={{
            transition: "opacity 180ms ease, transform 180ms ease",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scaleY(1)" : "translateY(-6px) scaleY(0.95)",
            transformOrigin: "top",
          }}
          className="absolute z-50 mt-1 min-w-full max-h-64 overflow-y-auto rounded-lg border border-surface1 bg-mantle shadow-lg py-1"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                closeMenu();
              }}
              className={cn(
                "px-4 py-2 text-sm cursor-pointer transition-colors duration-100",
                opt.value === value
                  ? "bg-surface1 text-blue font-medium"
                  : "text-text hover:bg-surface0"
              )}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
