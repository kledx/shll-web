"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Rocket, X, Search, Wallet, Zap } from "lucide-react";

interface ConsoleGuideProps {
    guide: {
        title: string;
        dismiss: string;
        step1Title: string;
        step1Desc: string;
        step2Title: string;
        step2Desc: string;
        step3Title: string;
        step3Desc: string;
    };
    tokenId: string;
}

const STORAGE_KEY = "shll-console-guide-dismissed";

// Icon components for each step
const STEP_ICONS: ReactNode[] = [
    <Search key="s" className="h-5 w-5 text-indigo-600" />,
    <Wallet key="w" className="h-5 w-5 text-emerald-600" />,
    <Zap key="z" className="h-5 w-5 text-amber-600" />,
];

/**
 * Quick Guide banner for first-time console users.
 * Shows 3-step flow with lucide icons, dismissible with localStorage persistence.
 */
export function ConsoleGuide({ guide, tokenId }: ConsoleGuideProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Show only if not previously dismissed
        try {
            const dismissed = localStorage.getItem(STORAGE_KEY);
            if (!dismissed) setVisible(true);
        } catch {
            setVisible(true);
        }
    }, []);

    const dismiss = () => {
        setVisible(false);
        try { localStorage.setItem(STORAGE_KEY, "1"); } catch { }
    };

    if (!visible) return null;

    const steps = [
        { title: guide.step1Title, desc: guide.step1Desc, icon: STEP_ICONS[0] },
        { title: guide.step2Title, desc: guide.step2Desc, icon: STEP_ICONS[1] },
        { title: guide.step3Title, desc: guide.step3Desc, icon: STEP_ICONS[2] },
    ];

    return (
        <div className="relative rounded-xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50/80 via-white/90 to-violet-50/80 p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-800">{guide.title}</span>
                </div>
                <button
                    onClick={dismiss}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-indigo-500 hover:bg-indigo-100 transition-colors"
                >
                    {guide.dismiss}
                    <X className="h-3 w-3" />
                </button>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {steps.map((step, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg border border-white/60 bg-white/70 px-3 py-2.5"
                    >
                        <div className="mt-0.5 flex-shrink-0">{step.icon}</div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-800">{step.title}</div>
                            <div className="text-sm text-slate-500 mt-0.5 leading-relaxed">{step.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
