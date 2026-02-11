import type { Metadata } from "next";
import { Providers } from "./providers";
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
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
