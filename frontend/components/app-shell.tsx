import Link from "next/link";
import { FileStack, Home, LayoutList, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/submit", label: "Submit claim", icon: Send },
  { href: "/submit/batch", label: "Batch JSON", icon: FileStack },
  { href: "/results", label: "Results", icon: LayoutList },
];

export function AppShell({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/75 backdrop-blur-md transition-[opacity,transform] duration-200 ease-enter">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight text-ink transition-[opacity,transform] duration-200 ease-enter hover:opacity-90"
          >
            <BrandLogo className="h-6 text-ink transition-transform duration-200 ease-enter group-hover:rotate-[-1deg] group-hover:scale-[1.01]" />
          </Link>
          <nav
            className="flex flex-wrap items-center justify-end gap-1 sm:gap-2"
            aria-label="Primary"
          >
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? currentPath === "/"
                  : currentPath === href ||
                    (href !== "/" && currentPath.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-[transform,opacity,background-color,color,box-shadow] duration-200 ease-enter sm:text-sm",
                    active
                      ? "bg-surface-elevated text-ink shadow-sm"
                      : "text-ink-muted hover:bg-surface-elevated/70 hover:text-ink"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-border/70 bg-surface/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs">
            © {new Date().getFullYear()} Orcha. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <Link href="/submit" className="hover:text-ink">
              Submit claim
            </Link>
            <Link href="/submit/batch" className="hover:text-ink">
              Batch JSON
            </Link>
            <Link href="/results" className="hover:text-ink">
              Results
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
