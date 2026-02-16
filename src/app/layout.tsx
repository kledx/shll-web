import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "./providers";
import { LanguageProvider } from "@/components/providers/language-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHLL - AI Agent Marketplace",
  description: "Rent, deploy, and manage AI Agents on-chain. A decentralized marketplace for AI Agent NFAs with secure policy-guarded execution.",
  openGraph: {
    title: "SHLL - AI Agent Marketplace",
    description: "Rent, deploy, and manage AI Agents on-chain. Decentralized AI Agent NFA marketplace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeEnv = {
    NEXT_PUBLIC_AGENT_NFA: process.env.NEXT_PUBLIC_AGENT_NFA || "",
    NEXT_PUBLIC_LISTING_MANAGER: process.env.NEXT_PUBLIC_LISTING_MANAGER || "",
    NEXT_PUBLIC_DEPLOY_BLOCK: process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "",
    NEXT_PUBLIC_RUNNER_OPERATOR: process.env.NEXT_PUBLIC_RUNNER_OPERATOR || "",
    NEXT_PUBLIC_EXPLORER_TX_BASE_URL: process.env.NEXT_PUBLIC_EXPLORER_TX_BASE_URL || "",
    NEXT_PUBLIC_EXTRA_TOKENS: process.env.NEXT_PUBLIC_EXTRA_TOKENS || "",
  };
  const runtimeEnvScript = `window.__SHLL_RUNTIME_ENV__ = ${JSON.stringify(runtimeEnv).replace(/</g, "\\u003c")};`;

  return (
    <html lang="en">
      <body className="antialiased">
        <Script id="shll-runtime-env" strategy="beforeInteractive">
          {runtimeEnvScript}
        </Script>
        <Providers>
          <LanguageProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
