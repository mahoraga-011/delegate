"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-5xl items-center px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Delegate<span className="text-muted-foreground">.</span>
        </Link>
        <div className="ml-8 hidden items-center gap-1 sm:flex">
          <button onClick={() => scrollTo("features")} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </button>
          <button onClick={() => scrollTo("for-agents")} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            For Agents
          </button>
          <Link href="/dashboard" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button size="sm">Launch App</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
