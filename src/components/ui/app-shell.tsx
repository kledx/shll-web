"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image"; // Added Import
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { TestnetBanner } from "@/components/layout/testnet-banner";
import { useTranslation } from "@/hooks/useTranslation";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { t, language, setLanguage } = useTranslation();

    const navItems = [
        { name: t.common.nav.market, href: "/" },
        { name: t.common.nav.me, href: "/me" },
        { name: t.common.nav.docs, href: "/docs" },
    ];

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'zh' : 'en');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[var(--color-paper)] text-[var(--color-dark-text)]">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-[var(--color-burgundy)]/10 bg-[var(--color-paper)]/80 backdrop-blur-md">
                <TestnetBanner />
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-[var(--color-burgundy)]">
                            <Image src="/logo.svg" alt="SHLL Logo" width={32} height={32} className="w-8 h-8" />
                            <span>SHLL</span>
                        </Link>

                        <nav className="flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "text-base font-medium",
                                            pathname === item.href
                                                ? "bg-[var(--color-burgundy)]/5 text-[var(--color-burgundy)]"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {item.name}
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://x.com/shllrun"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="ghost"
                                className="text-sm font-medium text-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/5"
                                aria-label="Open SHLL official X"
                            >
                                <XLogoIcon />
                            </Button>
                        </a>
                        <a
                            href="https://github.com/kledx/shll"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="ghost"
                                className="text-sm font-medium text-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/5"
                                aria-label="Open SHLL GitHub repository"
                            >
                                <GitHubLogoIcon />
                            </Button>
                        </a>
                        <Button
                            variant="ghost"
                            onClick={toggleLanguage}
                            className="text-sm font-medium text-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/5"
                        >
                            {language === 'en' ? 'EN' : '中文'}
                        </Button>
                        <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--color-burgundy)]/10 py-6 text-center text-sm text-muted-foreground">
                <p>{t.common.footer}</p>
            </footer>
        </div>
    );
}

function XLogoIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden="true"
            fill="currentColor"
        >
            <path d="M18.901 1H22.5l-7.862 8.987L24 23h-7.406l-5.8-7.584L4.17 23H.57l8.41-9.616L0 1h7.594l5.243 6.919L18.901 1Zm-1.297 19.796h2.056L6.476 3.088H4.27l13.334 17.708Z" />
        </svg>
    );
}

function GitHubLogoIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden="true"
            fill="currentColor"
        >
            <path d="M12 .5a12 12 0 0 0-3.792 23.39c.6.11.819-.26.819-.577v-2.02c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.833 2.806 1.303 3.49.996.108-.776.42-1.304.763-1.603-2.665-.304-5.466-1.333-5.466-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.536-1.527.118-3.183 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 6.006 0c2.29-1.552 3.297-1.23 3.297-1.23.655 1.656.243 2.88.12 3.183.77.84 1.235 1.911 1.235 3.222 0 4.61-2.806 5.623-5.48 5.92.432.372.817 1.103.817 2.222v3.293c0 .32.216.694.825.576A12 12 0 0 0 12 .5Z" />
        </svg>
    );
}
