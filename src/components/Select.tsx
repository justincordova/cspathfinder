"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
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
  const id = useId();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
    // Set highlighted index to currently selected option
    const idx = options.findIndex((o) => o.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
    // next tick so the enter animation triggers after mount
    requestAnimationFrame(() => setVisible(true));
  }, [clearCloseTimer, options, value]);

  const closeMenu = useCallback(() => {
    setVisible(false);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }, []);

  const toggle = useCallback(() => {
    if (openRef.current) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [closeMenu, openMenu]);

  // Clean up close timer on unmount
  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    const items = listRef.current?.querySelectorAll('[role="option"]');
    items?.[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, highlightedIndex]);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder;

  const selectOption = useCallback(
    (optValue: string) => {
      onChange(optValue);
      closeMenu();
    },
    [onChange, closeMenu]
  );

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      closeMenu();
      return;
    }

    // Prevent double-fire: button natively fires click on Enter/Space
    if (e.key === "Enter" || e.key === " ") {
      if (open) {
        // Select the highlighted option
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          selectOption(options[highlightedIndex].value);
        }
      }
      // When closed, let the native button click handle the toggle
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        openMenu();
      } else {
        setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) {
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      }
      return;
    }

    if (e.key === "Home" && open) {
      e.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (e.key === "End" && open) {
      e.preventDefault();
      setHighlightedIndex(options.length - 1);
      return;
    }
  }

  const listboxId = `${id}-listbox`;
  const activeDescendantId =
    open && highlightedIndex >= 0 ? `${id}-opt-${highlightedIndex}` : undefined;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        onKeyDown={handleKey}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-activedescendant={activeDescendantId}
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
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          style={{
            transition: "opacity 180ms ease, transform 180ms ease",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scaleY(1)" : "translateY(-6px) scaleY(0.95)",
            transformOrigin: "top",
          }}
          className="absolute z-50 mt-1 min-w-full max-h-64 overflow-y-auto rounded-lg border border-surface1 bg-mantle shadow-lg py-1"
        >
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              id={`${id}-opt-${idx}`}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => selectOption(opt.value)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={cn(
                "px-4 py-2 text-sm cursor-pointer transition-colors duration-100",
                opt.value === value
                  ? "bg-surface1 text-blue font-medium"
                  : idx === highlightedIndex
                    ? "bg-surface0 text-text"
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
