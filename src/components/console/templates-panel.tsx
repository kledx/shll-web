"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Banknote, Terminal } from "lucide-react";
import { Address } from "viem";
import { useTranslation } from "@/hooks/useTranslation";
import { SwapTemplate } from "./swap-template";
import { RepayTemplate } from "./repay-template";
import { Action, TemplateKey } from "./action-types";

interface TemplatesPanelProps {
    effectiveTemplates: TemplateKey[];
    defaultTemplate: TemplateKey;
    agentAccount?: Address;
    renterAddress?: string;
    onActionGenerated: (action: Action) => void;
}

export function TemplatesPanel({
    effectiveTemplates,
    defaultTemplate,
    agentAccount,
    renterAddress,
    onActionGenerated,
}: TemplatesPanelProps) {
    const { t } = useTranslation();

    return (
        <Tabs defaultValue={defaultTemplate} className="w-full">
            <TabsList
                className="grid w-full mb-4"
                style={{ gridTemplateColumns: `repeat(${effectiveTemplates.length}, minmax(0, 1fr))` }}
            >
                {effectiveTemplates.includes("swap") && (
                    <TabsTrigger value="swap" className="gap-2">
                        <ArrowRightLeft className="w-4 h-4" /> {t.agent.console.builder.tabs.swap}
                    </TabsTrigger>
                )}
                {effectiveTemplates.includes("repay") && (
                    <TabsTrigger value="repay" className="gap-2">
                        <Banknote className="w-4 h-4" /> {t.agent.console.builder.tabs.repay}
                    </TabsTrigger>
                )}
                {effectiveTemplates.includes("raw") && (
                    <TabsTrigger value="raw" className="gap-2">
                        <Terminal className="w-4 h-4" /> {t.agent.console.builder.tabs.raw}
                    </TabsTrigger>
                )}
            </TabsList>

            {effectiveTemplates.includes("swap") && (
                <TabsContent value="swap">
                    <SwapTemplate onActionGenerated={onActionGenerated} agentAccount={agentAccount} />
                </TabsContent>
            )}

            {effectiveTemplates.includes("repay") && (
                <TabsContent value="repay">
                    <RepayTemplate onActionGenerated={onActionGenerated} renterAddress={renterAddress} />
                </TabsContent>
            )}

            {effectiveTemplates.includes("raw") && (
                <TabsContent value="raw">
                    <div className="p-4 border rounded-lg bg-[var(--color-paper)]/50 text-sm text-muted-foreground text-center">
                        {t.agent.console.builder.manual}
                    </div>
                </TabsContent>
            )}
        </Tabs>
    );
}
