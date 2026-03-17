"use client";

import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useState, useEffect } from "react";

export function WalletGate({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: string;
}) {
  const { isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (isConnected) return <>{children}</>;

  return (
    <div className="rounded-lg border border-dashed p-8 text-center space-y-3">
      <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">Wallet required</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          {description || "Connect an Ethereum wallet to access on-chain features."}
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => connect({ connector: injected() })}
        disabled={isPending}
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </Button>
    </div>
  );
}
