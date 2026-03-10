"use client";

import { useState } from "react";
import Image from "next/image";

interface SchoolLogoProps {
  website: string;
  name: string;
  size?: number;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function SchoolLogo({ website, name, size = 40 }: SchoolLogoProps) {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(website);

  if (failed || !domain) {
    return (
      <div
        className="rounded-lg bg-surface0 flex items-center justify-center text-subtext0 font-bold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {getInitials(name)}
      </div>
    );
  }

  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const src = token
    ? `https://img.logo.dev/${domain}?token=${token}`
    : `https://img.logo.dev/${domain}`;

  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className="rounded-lg shrink-0 bg-white"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
