"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { TestnetBanner } from "@/components/layout/testnet-banner";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

type AppShellProps = {
    children: React.ReactNode;
    fullWidth?: boolean;
    contentClassName?: string;
};

const SIDEBAR_KEY = "shll-sidebar-open";

export function AppShell({ children, fullWidth = false, contentClassName }: AppShellProps) {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive state
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                const saved = window.localStorage.getItem(SIDEBAR_KEY);
                if (saved === null) {
                    setIsSidebarOpen(true);
                } else {
                    setIsSidebarOpen(saved === "1");
                }
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return;
        window.localStorage.setItem(SIDEBAR_KEY, isSidebarOpen ? "1" : "0");
    }, [isMobile, isSidebarOpen]);

    return (
        <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-foreground)]">
            <TestnetBanner />

            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isMobile={isMobile}
            />

            <div className={cn(
                "flex flex-col flex-1 transition-all duration-300",
                !isMobile && (isSidebarOpen ? "pl-60" : "pl-[72px]")
            )}>
                <Header
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    isMobile={isMobile}
                />

                <main className="flex-1 p-4 md:p-6 xl:p-8">
                    <div
                        className={cn(
                            fullWidth ? "w-full" : "mx-auto max-w-7xl",
                            contentClassName
                        )}
                    >
                        {children}
                    </div>
                </main>

                <footer className="border-t border-[var(--color-border)] py-6 text-center text-sm text-[var(--color-muted-foreground)]">
                    {t.common.footer}
                </footer>
            </div>
        </div>
    );
}
