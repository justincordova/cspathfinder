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
      className="px-4 py-2 bg-surface0 text-text rounded-lg hover:bg-surface1 transition-colors text-sm font-medium"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
