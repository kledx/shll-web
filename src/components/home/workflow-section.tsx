"use client";

import { motion, Variants } from "framer-motion";
import { Store, ShieldCheck, Cpu, Landmark, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";

export function WorkflowSection() {
    const { language } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    const steps = [
        {
            icon: Store,
            title: language === "zh" ? "发现与租赁" : "Discover & Rent",
            desc: language === "zh"
                ? "在去中心化市场中寻找最适合您策略的 AI Agent 构建（NFAs）。"
                : "Find the perfect AI Agent build (NFA) for your strategy in our decentralized marketplace.",
        },
        {
            icon: ShieldCheck,
            title: language === "zh" ? "配置安全风控" : "Configure Guardrails",
            desc: language === "zh"
                ? "在 PolicyGuard 智能合约中设定预算、允许的代币和最大限额。只有符合安全验证的交易才会上链。"
                : "Set budgets, allowed tokens, and max slippage in the PolicyGuard smart contract. Only safe trades execute.",
        },
        {
            icon: Cpu,
            title: language === "zh" ? "自主执行推理" : "Autonomous Execution",
            desc: language === "zh"
                ? "授予签名许可后，SHLL Runner 会在 TEE 环境安全地为您 24/7 推理并代理操作 DeFi 协议。"
                : "Grant signed permission, and the SHLL Runner safely drives DeFi protocols on your behalf 24/7.",
        },
        {
            icon: Landmark,
            title: language === "zh" ? "链上金库结算" : "On-chain Settlement",
            desc: language === "zh"
                ? "在专属的 Agent Vault 账户中安全接收自动化操作产生的收益。资产始终由您掌控。"
                : "Receive yields and settlements directly in your dedicated on-chain Agent Vault. You control your assets.",
        },
    ];

    // Auto loop animations
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % steps.length);
        }, 3000); // Shift every 3s
        return () => clearInterval(interval);
    }, [steps.length]);

    // Animation variants
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.3,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, type: "spring", bounce: 0.4 }
        }
    };

    return (
        <section className="py-20 md:py-28 bg-[var(--color-secondary)]/10 border-y border-[var(--color-border)] overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[var(--color-sky)]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 md:mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-4xl font-serif"
                    >
                        {language === "zh" ? "SHLL 是如何运行的" : "How SHLL Works"}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-4 text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto"
                    >
                        {language === "zh"
                            ? "只需四步，从租赁到自动化创收，全流程去中心化且安全透明。"
                            : "Four simple steps from renting an agent to automated yield generation. Secure, transparent, and decentralized."}
                    </motion.p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Animated Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-1 bg-[var(--color-border)]/50 rounded-full z-0 overflow-hidden">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-sky)] to-[var(--color-primary)]"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
                        />
                    </div>

                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-6 relative z-10"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {steps.map((step, index) => {
                            const isActive = index === activeIndex;
                            const isPast = index <= activeIndex;

                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="flex flex-col items-center relative group"
                                >
                                    {/* Mobile/Tablet Arrow Connector */}
                                    {index !== steps.length - 1 && (
                                        <div className="block lg:hidden absolute -bottom-10 text-[var(--color-border)] z-0">
                                            <ArrowRight className="h-6 w-6 rotate-90" />
                                        </div>
                                    )}

                                    {/* Icon Orbit / Node */}
                                    <div
                                        className={`relative flex items-center justify-center w-[90px] h-[90px] rounded-full border-4 bg-white transition-all duration-700 cursor-pointer z-10 ${isActive
                                            ? "border-[var(--color-primary)] shadow-[0_0_30px_rgba(122,31,55,0.3)] scale-110"
                                            : isPast
                                                ? "border-[var(--color-primary)]/40 hover:border-[var(--color-primary)]/60"
                                                : "border-[#e1d3c0] hover:border-[#cfbca3]"
                                            }`}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <step.icon
                                            className={`h-8 w-8 transition-colors duration-500 ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]"
                                                }`}
                                        />

                                        {/* Active Pulse Ring */}
                                        {isActive && (
                                            <motion.div
                                                className="absolute inset-[-8px] rounded-full border-2 border-[var(--color-primary)]/40 z-0 pointer-events-none"
                                                animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                            />
                                        )}
                                    </div>

                                    {/* Content Card */}
                                    <div
                                        className={`mt-8 text-center transition-all duration-500 group-hover:-translate-y-1 cursor-pointer`}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold mb-4 transition-colors duration-500 ${isActive ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"}`}>
                                            {index + 1}
                                        </div>
                                        <h3 className={`text-xl font-bold mb-3 transition-colors ${isActive ? "text-[var(--color-foreground)]" : "text-[var(--color-foreground)]/70"}`}>
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed max-w-[280px] mx-auto">
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
