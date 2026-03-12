"use client";

import { useState } from "react";

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={copied ? "Link copied to clipboard" : "Copy link to clipboard"}
      className="px-4 py-2 bg-surface0 text-text rounded-lg hover:bg-surface1 transition-colors text-sm font-medium"
    >
      <span aria-live="polite" aria-atomic="true">
        {copied ? "Copied!" : "Copy link"}
      </span>
    </button>
  );
}
