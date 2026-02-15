"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Users, Activity, BarChart3, ShieldCheck } from "lucide-react";

export function StatsSection() {
    const { t } = useTranslation();

    const stats = [
        {
            label: t.home.stats.activeAgents,
            value: "128",
            icon: Users,
            color: "text-blue-500",
        },
        {
            label: t.home.stats.totalExecutions,
            value: "15.2K",
            icon: Activity,
            color: "text-green-500",
        },
        {
            label: t.home.stats.successRate,
            value: "99.8%",
            icon: ShieldCheck,
            color: "text-purple-500",
        },
        {
            label: t.home.stats.totalValue,
            value: "$2.4M",
            icon: BarChart3,
            color: "text-orange-500",
        },
    ];

    return (
        <section className="py-12 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className={`mb-4 rounded-full bg-white p-3 shadow-md dark:bg-slate-800 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="text-3xl font-bold tracking-tighter text-[var(--color-foreground)]">
                                {stat.value}
                            </div>
                            <div className="text-sm font-medium text-[var(--color-muted-foreground)]">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
