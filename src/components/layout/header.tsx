"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Menu, Globe } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
    isMobile: boolean;
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
    const { t, language, setLanguage } = useTranslation();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'zh' : 'en');
    };

    return (
        <header className="sticky top-0 z-30 w-full border-b border-[var(--color-border)] bg-[var(--color-paper)]/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={onMenuClick}>
                            <Menu className="h-5 w-5 text-[var(--color-muted-foreground)]" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleLanguage}
                        className="rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
                        title={t.common.language}
                    >
                        <Globe className="h-4 w-4" />
                        <span className="sr-only">{t.common.language}</span>
                    </Button>

                    {/* AppKit wallet button — renders as a web component */}
                    <appkit-button size="sm" />
                </div>
            </div>
        </header>
    );
}
