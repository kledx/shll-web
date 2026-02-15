"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, Variants } from "framer-motion";
import {
    Store,
    User,
    BookOpen,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobile: boolean;
}

type NavItem = {
    name: string;
    href: string;
    icon: typeof Store;
    isActive: (path: string) => boolean;
};

export function Sidebar({ isOpen, setIsOpen, isMobile }: SidebarProps) {
    const pathname = usePathname();
    const { t } = useTranslation();

    const navItems: NavItem[] = [
        {
            name: t.common.nav.market,
            href: "/market",
            icon: Store,
            // Market nav owns market list and agent detail/console flows.
            isActive: (path) =>
                path === "/" || path === "/market" || path.startsWith("/agent/"),
        },
        {
            name: t.common.nav.me,
            href: "/me",
            icon: User,
            isActive: (path) => path === "/me" || path.startsWith("/me/"),
        },
        {
            name: t.common.nav.docs,
            href: "/docs",
            icon: BookOpen,
            isActive: (path) => path === "/docs" || path.startsWith("/docs/"),
        },
    ];

    const desktopVariants: Variants = {
        open: { width: "240px", transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { width: "72px", transition: { type: "spring", stiffness: 300, damping: 30 } },
    };

    const mobileVariants: Variants = {
        open: { x: 0 },
        closed: { x: "-100%" }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={isOpen ? "open" : "closed"}
                animate={isOpen ? "open" : "closed"}
                variants={isMobile ? mobileVariants : desktopVariants}
                className={cn(
                    "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-paper)] shadow-[var(--shadow-soft)]",
                    isMobile ? "w-64" : ""
                )}
            >
                {/* Logo Section */}
                <div className={cn("flex h-16 items-center px-4", isOpen ? "justify-start" : "justify-center")}>
                    <Link href="/" className="flex items-center gap-2 overflow-hidden">
                        <Image src="/logo.svg" alt="SHLL Logo" width={32} height={32} className="h-8 w-8 min-w-8" />
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-serif text-xl font-bold tracking-tight text-[var(--color-primary)] whitespace-nowrap"
                            >
                                SHLL
                            </motion.span>
                        )}
                    </Link>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 space-y-2 px-2 py-4">
                    {navItems.map((item) => {
                        const isActive = item.isActive(pathname);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-[var(--color-secondary)]",
                                    isActive
                                        ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]"
                                        : "text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]",
                                    !isOpen && "justify-center"
                                )}
                                title={!isOpen ? item.name : undefined}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-[var(--color-primary)]")} />
                                {isOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Collapse Toggle */}
                {!isMobile && (
                    <div className="border-t border-[var(--color-border)] p-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
                        >
                            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </div>
                )}
            </motion.aside>

            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
