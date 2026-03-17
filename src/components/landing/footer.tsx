import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-sm font-bold tracking-tight">
          Delegate<span className="text-muted-foreground">.</span>
        </span>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <a href="/skill.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">skill.md</a>
          <a href="https://github.com/mahoraga-011/delegate" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
