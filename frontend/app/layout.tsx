import type { Metadata } from "next";
import { Fraunces, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Claim Orchestrator",
  description:
    "Guided insurance claim intake and explainability dashboard (frontend demo).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${fraunces.variable}`}>
      <body className="font-sans min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
