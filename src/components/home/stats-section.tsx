"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Users, Activity, ShieldCheck, Globe } from "lucide-react";
import { CHAIN_NAME } from "@/config/wagmi";
import { useListings } from "@/hooks/useListings";

export function StatsSection() {
    const { t } = useTranslation();
    const { data: listings } = useListings();

    // Derive stats from real indexer data
    const activeAgents = listings?.length ?? 0;
    const rentedAgents = listings?.filter((l) => l.rented)?.length ?? 0;

    const stats = [
        {
            label: t.home.stats.activeAgents,
            value: String(activeAgents),
            icon: Users,
            color: "text-blue-500",
        },
        {
            label: t.home.stats.totalExecutions,
            value: String(rentedAgents),
            icon: Activity,
            color: "text-green-500",
        },
        {
            label: t.home.stats.successRate,
            value: "99.9%",
            icon: ShieldCheck,
            color: "text-purple-500",
        },
        {
            label: "Network",
            value: CHAIN_NAME,
            icon: Globe,
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
