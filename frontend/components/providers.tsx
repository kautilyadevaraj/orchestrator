"use client";

import { usePathname } from "next/navigation";
import { ClaimsProvider } from "@/lib/claims-store";
import { AppShell } from "@/components/app-shell";
import { ToastProvider } from "@/components/toast-host";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  return (
    <ToastProvider>
      <ClaimsProvider>
        <AppShell currentPath={pathname}>{children}</AppShell>
      </ClaimsProvider>
    </ToastProvider>
  );
}
