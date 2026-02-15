"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Shield, Key, FileCode } from "lucide-react";

export function WhySection() {
    const { t } = useTranslation();

    const items = [
        {
            icon: Key,
            title: t.home.why.items[0].title,
            desc: t.home.why.items[0].desc,
        },
        {
            icon: Shield,
            title: t.home.why.items[1].title,
            desc: t.home.why.items[1].desc,
        },
        {
            icon: FileCode,
            title: t.home.why.items[2].title,
            desc: t.home.why.items[2].desc,
        },
    ];

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
                        {t.home.why.title}
                    </h2>
                    <p className="mt-4 text-lg text-[var(--color-muted-foreground)]">
                        {t.home.why.subtitle}
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="mb-6 rounded-full bg-[var(--color-secondary)] p-4 text-[var(--color-primary)]">
                                <item.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-foreground)]">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-[var(--color-muted-foreground)]">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
