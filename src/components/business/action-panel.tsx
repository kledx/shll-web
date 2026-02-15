"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RentForm } from "./rent-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRentToMint } from "@/hooks/useRentToMint";
import { Hex } from "viem";
import { getConsoleCopy } from "@/lib/console/console-copy";

interface ActionPanelProps {
    nfaAddress: string;
    tokenId: string;
    isActive: boolean;
    isListed: boolean;
    isTemplateListing: boolean;
    isOwner: boolean;
    isRenter: boolean;
    pricePerDay: string;
    pricePerDayRaw: bigint;
    minDays: number;
    listingId: string;
}

export function ActionPanel({ nfaAddress, tokenId, isActive, isListed, isTemplateListing, isOwner, isRenter, pricePerDay, pricePerDayRaw, minDays, listingId }: ActionPanelProps) {
    const { rentToMintAgent, isLoading: isRenting } = useRentToMint();
    const { t, language } = useTranslation();
    const ui = getConsoleCopy(language);
    const canRent = isActive && isListed && isTemplateListing && !isOwner && !isRenter;
    const roleLabel = isOwner
        ? ui.roleLabels.owner
        : isRenter
            ? ui.roleLabels.renter
            : ui.roleLabels.guest;
    const rentUnavailableReason = isRenter
        ? (language === "zh" ? "你当前是该 Agent 的有效租户。" : "You are the active renter of this agent.")
        : isOwner
            ? (language === "zh" ? "所有者钱包不能租用自己的 Agent。" : "Owner wallet cannot rent this agent.")
            : !isTemplateListing
                ? (
                    language === "zh"
                        ? "经典租赁流程已废弃，仅支持多租户模板实例。"
                        : "Classic rental is deprecated. Only multi-tenant template listings are supported."
                )
                : isListed
                    ? (language === "zh" ? "该挂牌当前不可租用。" : "This listing is not currently rentable.")
                    : (language === "zh" ? "该 Agent 当前未挂牌出租。" : "This agent is not listed for rent.");

    const handleRent = async (days: number) => {
        if (!listingId) {
            console.error("No listing ID found");
            return;
        }
        // initParams must be non-empty for rentToMint.
        await rentToMintAgent(listingId as Hex, days, pricePerDayRaw, "0x01");
    };

    return (
        <Tabs defaultValue="rent" className="w-full">
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl border border-[var(--color-border)] bg-white/72 p-1">
                <TabsTrigger value="rent">{t.agent.detail.tabs.rent}</TabsTrigger>
                <TabsTrigger value="console" disabled={!isRenter && !isOwner}>
                    {t.agent.detail.tabs.console}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="rent" className="mt-4">
                {canRent ? (
                    <RentForm
                        pricePerDay={pricePerDay}
                        minDays={minDays}
                        paymentToken="BNB"
                        onRent={handleRent}
                        isRenting={isRenting}
                    />
                ) : (
                    <Card className="border-dashed border-[var(--color-border)] bg-white/70">
                        <CardHeader>
                            <CardTitle className="text-base text-[var(--color-foreground)]">{t.agent.detail.tabs.rent}</CardTitle>
                            <CardDescription className="text-[var(--color-muted-foreground)]">
                                {rentUnavailableReason}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="console" className="mt-4">
                <Card className="border-dashed border-[var(--color-border)] bg-white/70">
                    <CardHeader>
                        <CardTitle className="text-base text-[var(--color-foreground)]">{t.agent.console.title}</CardTitle>
                        <CardDescription className="text-[var(--color-muted-foreground)]">{t.agent.console.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                                {t.agent.console.view.replace("{role}", roleLabel)}
                            </p>
                            <Link href={`/agent/${nfaAddress}/${tokenId}/console`}>
                                <Button className="w-full gap-2">
                                    {t.agent.console.open} <ExternalLink className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
