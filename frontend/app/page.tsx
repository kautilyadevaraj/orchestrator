import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileStack, LayoutList, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const actions = [
  {
    href: "/submit",
    title: "Submit one claim",
    desc: "Structured form with validation, optional image URL or upload.",
    icon: Send,
  },
  {
    href: "/submit/batch",
    title: "Batch JSON",
    desc: "Upload an array of claims, preview validation, run a mock batch.",
    icon: FileStack,
  },
  {
    href: "/results",
    title: "Results dashboard",
    desc: "Filter, sort, and open per-claim explainability.",
    icon: LayoutList,
  },
] as const;

export default function HomePage() {
  return (
    <div className="hero-bg relative left-1/2 right-1/2 w-screen -mx-[50vw]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="relative overflow-hidden pb-10 pt-12 sm:pb-14 sm:pt-14">
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/80">
              INSURANCE OPS CONSOLE
            </p>
            <h1 className="mt-5 font-display text-[2.42rem] font-normal leading-[1.04] tracking-[-0.03em] text-ink sm:text-[4.05rem]">
              The claim workflow you can{" "}
              <span className="font-display italic font-semibold">
                <span className="trust-gradient bg-clip-text text-transparent">
                  Trust
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-[17px]">
              Submit claims, batch intake, and review explainability with a
              crisp, deterministic pipeline preview — designed for clarity.
            </p>
            <div className="mt-7 flex justify-center">
              <Button
                asChild
                className="h-11 rounded-full px-10 text-sm font-medium"
              >
                <Link href="/submit">Start a claim</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto mt-10 max-w-4xl px-2 sm:mt-12">
            <div className="relative rounded-2xl bg-transparent shadow-[0_30px_120px_-70px_rgba(0,0,0,0.7)]">
              <Image
                src="/images/hero-shot.png"
                alt="Orcha product preview"
                width={1224}
                height={687}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </section>

        <section className="pb-12 sm:pb-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              The proven surface for claim decisions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              A minimal workflow: submit → validate → review. Built to feel
              familiar, fast, and dependable.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map(({ href, title, desc, icon: Icon }, idx) => (
              <Card
                key={href}
                className="group flex flex-col bg-surface-elevated/95"
                style={{
                  animation: "fade-in 420ms cubic-bezier(0.22,1,0.36,1) both",
                  animationDelay: `${80 + idx * 50}ms`,
                }}
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-200 ease-enter group-hover:scale-[1.03]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Button variant="ghost" className="gap-1 px-0" asChild>
                    <Link href={href}>
                      Open
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-enter group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
