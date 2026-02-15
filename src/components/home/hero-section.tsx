"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export function HeroSection() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl"
                    >
                        <h1 className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                            {t.home.hero.title}
                        </h1>
                        <p className="mt-6 text-lg text-[var(--color-muted-foreground)] md:text-xl">
                            {t.home.hero.subtitle}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-8 flex flex-col gap-4 sm:flex-row"
                    >
                        <Link href="/market">
                            <Button size="lg" className="h-12 px-8 text-base">
                                {t.home.hero.cta}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/docs">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                {t.home.hero.secondaryCta}
                                <BookOpen className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute inset-0 z-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
            <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
            <div className="absolute -right-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
        </section>
    );
}
