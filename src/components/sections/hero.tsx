import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="space-y-6 py-4">
      <div className="space-y-4">
        <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Policy checks before agents act.
        </h1>
        <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Define deterministic rules for AI agents. Evaluate requests, log decisions, and verify
          everything on-chain. No AI in the loop, no ambiguity.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById("policies")?.scrollIntoView({ behavior: "smooth" })}
      >
        Get started
      </Button>
    </section>
  );
}
