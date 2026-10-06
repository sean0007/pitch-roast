"use client";

import { useState } from "react";

export function ShareBar({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt("Copy this link", url);
          }
        }}
        className="rounded-full bg-flame px-5 py-2.5 text-sm font-bold text-black hover:bg-flame/90"
      >
        {copied ? "Link copied" : "Copy share link"}
      </button>
      <a href={intent} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-foreground hover:border-flame/60">
        Share on X
      </a>
    </div>
  );
}
