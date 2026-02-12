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
