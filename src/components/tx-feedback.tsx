"use client";

import { Badge } from "@/components/ui/badge";
import { explorerTxUrl } from "@/lib/contracts";
import { Loader2, Check, X } from "lucide-react";

export function TxFeedback({
  txHash,
  isPending,
  isConfirming,
  isSuccess,
  isError,
  error,
}: {
  txHash?: string;
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  error?: Error | null;
}) {
  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Waiting for signature...
      </span>
    );
  }

  if (isConfirming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Confirming on-chain...
      </span>
    );
  }

  if (isSuccess && txHash) {
    const url = explorerTxUrl(txHash);
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <Check className="h-3 w-3 text-green-500" />
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-muted-foreground hover:text-foreground underline">
            {txHash.slice(0, 10)}...{txHash.slice(-6)}
          </a>
        ) : (
          <span className="font-mono text-muted-foreground">
            {txHash.slice(0, 10)}...{txHash.slice(-6)}
          </span>
        )}
        <button
          onClick={() => navigator.clipboard.writeText(txHash)}
          className="text-muted-foreground hover:text-foreground"
          title="Copy hash"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </span>
    );
  }

  if (isError && error) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
        <X className="h-3 w-3" />
        {error.message?.slice(0, 60) || "Transaction failed"}
      </span>
    );
  }

  return null;
}
