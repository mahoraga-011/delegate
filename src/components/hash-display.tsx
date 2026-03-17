"use client";

import { explorerTxUrl } from "@/lib/contracts";

export function HashDisplay({
  hash,
  link,
}: {
  hash: string;
  link?: boolean;
}) {
  const short = hash.length > 16 ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : hash;
  const url = link ? explorerTxUrl(hash) : null;

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">
          {short}
        </a>
      ) : (
        <span>{short}</span>
      )}
      <button
        onClick={() => navigator.clipboard.writeText(hash)}
        className="text-muted-foreground hover:text-foreground"
        title="Copy"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
    </span>
  );
}
