"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RentForm } from "./rent-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRentToMint } from "@/hooks/useRentToMint";
import { Hex, parseEther } from "viem";
import { getConsoleCopy } from "@/lib/console/console-copy";
import { usePolicy, InstanceParams } from "@/hooks/usePolicy";
import { useCapabilityPack } from "@/hooks/useCapabilityPack";
import { useMemo, useState, useEffect, useCallback } from "react";
import { encodeInstanceParamsWithEncoding } from "@/lib/pack/instance-params";
import { useMyRentals } from "@/hooks/useMyRentals";
import { useAccount } from "wagmi";
import { OperatorAuthDialog } from "@/components/console/operator-auth-dialog";

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
    const { rentToMintAgent, isLoading: isRenting, isSuccess: isRentalSuccess, mintedTokenId, resetMint } = useRentToMint();
    const { t, language } = useTranslation();
    const { address } = useAccount();
    const router = useRouter();
    const ui = getConsoleCopy(language);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const tokenIdBigInt = useMemo(() => {
        try {
            return BigInt(tokenId);
        } catch {
            return undefined;
        }
    }, [tokenId]);
    const capabilityPack = useCapabilityPack(tokenIdBigInt, nfaAddress);
    const { rentals } = useMyRentals();

    // After rental confirms and we have the minted tokenId, show auth dialog
    useEffect(() => {
        if (isRentalSuccess && mintedTokenId !== null) {
            setShowAuthDialog(true);
        }
    }, [isRentalSuccess, mintedTokenId]);

    // Find user's instance minted from this template
    const myInstance = useMemo(() => {
        if (!isTemplateListing || tokenIdBigInt === undefined) return undefined;
        return rentals.find(
            (r) => r.isInstance && r.templateId === tokenIdBigInt && r.isActive
        ) ?? rentals.find(
            (r) => r.isInstance && r.templateId === tokenIdBigInt
        );
    }, [isTemplateListing, tokenIdBigInt, rentals]);
    const manifest = capabilityPack.manifest;
    const isV11Pack = manifest?.schemaVersion === "1.1";
    const policyRef = manifest?.policyRef;
    const instance = manifest?.instance;
    const hasPackInstanceEncoding =
        !!instance?.encoding?.abiTypes?.length &&
        !!instance?.encoding?.fieldOrder?.length;

    // V1.4 policy source priority: pack.policyRef -> fallback 1/1
    const policyId = isTemplateListing ? (policyRef?.policyId ?? 1) : undefined;
    const policyVersion = isTemplateListing ? (policyRef?.version ?? 1) : undefined;
    const { schema, encodeParams } = usePolicy(policyId, policyVersion);

    const initialInstanceParams = useMemo<Partial<InstanceParams> | undefined>(() => {
        const defaults = instance?.defaults;
        if (!defaults) return undefined;

        const out: Partial<InstanceParams> = {};
        if (typeof defaults.slippageBps === "number") out.slippageBps = defaults.slippageBps;
        if (typeof defaults.tokenGroupId === "number") out.tokenGroupId = defaults.tokenGroupId;
        if (typeof defaults.dexGroupId === "number") out.dexGroupId = defaults.dexGroupId;
        if (typeof defaults.riskTier === "number") out.riskTier = defaults.riskTier;

        try {
            if (typeof defaults.tradeLimit === "string" || typeof defaults.tradeLimit === "number") {
                out.tradeLimit = parseEther(String(defaults.tradeLimit));
            }
        } catch {
            // ignore malformed defaults
        }

        try {
            if (typeof defaults.dailyLimit === "string" || typeof defaults.dailyLimit === "number") {
                out.dailyLimit = parseEther(String(defaults.dailyLimit));
            }
        } catch {
            // ignore malformed defaults
        }

        return out;
    }, [instance?.defaults]);

    const enableInstanceParams = isTemplateListing && (isV11Pack || !!schema);

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

    const handleRent = async (days: number, params?: InstanceParams) => {
        if (!listingId) {
            console.error("No listing ID found");
            return;
        }

        if (params && hasPackInstanceEncoding && policyRef) {
            // V1.4 pack-driven parameterized rental
            const paramsPacked = encodeInstanceParamsWithEncoding(
                params as unknown as Record<string, unknown>,
                {
                    abiTypes: instance!.encoding!.abiTypes!,
                    fieldOrder: instance!.encoding!.fieldOrder!,
                    units: instance!.encoding!.units,
                },
            );
            await rentToMintAgent(listingId as Hex, days, pricePerDayRaw, {
                policyId: policyRef.policyId,
                version: policyRef.version,
                paramsPacked
            });
        } else if (params && schema && policyId !== undefined && policyVersion !== undefined) {
            // Legacy fallback: policy schema from chain + local fixed ABI encode
            const paramsPacked = encodeParams(params);
            await rentToMintAgent(listingId as Hex, days, pricePerDayRaw, {
                policyId,
                version: policyVersion,
                paramsPacked,
            });
        } else {
            // V1.3 Default Rental
            await rentToMintAgent(listingId as Hex, days, pricePerDayRaw, undefined, "0x01");
        }
    };

    const handleAuthComplete = useCallback((authorized: boolean) => {
        setShowAuthDialog(false);
        const tid = mintedTokenId?.toString() ?? tokenId;
        // Navigate to the new agent's console
        router.push(`/agent/${nfaAddress}/${tid}/console`);
        resetMint();
    }, [mintedTokenId, tokenId, nfaAddress, router, resetMint]);

    return (
        <>
            <Tabs defaultValue="rent" className="w-full">
                <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl border border-[var(--color-border)] bg-white/72 p-1">
                    <TabsTrigger value="rent">{t.agent.detail.tabs.rent}</TabsTrigger>
                    <TabsTrigger value="console" disabled={!isRenter && !isOwner && !isTemplateListing}>
                        {t.agent.detail.tabs.console}
                        {!isRenter && !isOwner && !isTemplateListing && <Lock className="ml-1 h-3 w-3 opacity-50" />}
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
                            schema={schema}
                            enableInstanceParams={enableInstanceParams}
                            initialParams={initialInstanceParams}
                        />
                    ) : isRenter ? (
                        <Card className="border-emerald-200 bg-emerald-50/60">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base text-emerald-700">
                                    <span className="text-lg">✅</span>
                                    {language === "zh" ? "你已租赁此 Agent" : "You are renting this Agent"}
                                </CardTitle>
                                <CardDescription className="text-emerald-600/80">
                                    {language === "zh"
                                        ? "前往控制台发送指令、查看执行记录和管理 Vault。"
                                        : "Go to the console to send instructions, view history, and manage your vault."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/agent/${nfaAddress}/${tokenId}/console`}>
                                    <Button className="w-full gap-2">
                                        {language === "zh" ? "进入控制台" : "Open Console"}
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : isTemplateListing && myInstance ? (
                        <Card className="border-sky-200 bg-sky-50/60">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base text-sky-700">
                                    <span className="text-lg">🤖</span>
                                    {language === "zh"
                                        ? `你已拥有此 Agent 的副本 #${myInstance.tokenId.toString()}`
                                        : `You own Agent #${myInstance.tokenId.toString()} from this template`}
                                </CardTitle>
                                <CardDescription className="text-sky-600/80">
                                    {language === "zh"
                                        ? "前往控制台管理你的 Agent。"
                                        : "Go to the console to manage your Agent."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/agent/${nfaAddress}/${myInstance.tokenId.toString()}/console`}>
                                    <Button className="w-full gap-2">
                                        {language === "zh" ? "进入我的 Agent 控制台" : "Open My Agent Console"}
                                        {" "}(#{myInstance.tokenId.toString()})
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
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
                            <CardDescription className="text-[var(--color-muted-foreground)]">
                                {(isRenter || isOwner)
                                    ? t.agent.console.desc
                                    : isTemplateListing
                                        ? myInstance
                                            ? (language === "zh"
                                                ? `您已拥有此 Agent 的副本 #${myInstance.tokenId.toString()}，点击下方按钮直接进入控制台。`
                                                : `You have Agent #${myInstance.tokenId.toString()} from this listing. Click below to open its console.`)
                                            : (language === "zh"
                                                ? "租赁后会为您创建专属 Agent，请前往「我的」页面查看。"
                                                : "Renting creates your own Agent. Check your Dashboard after renting.")
                                        : (language === "zh"
                                            ? "只有当前租户或所有者才能访问控制台。"
                                            : "Only the active renter or owner can access the console.")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                {(isRenter || isOwner) ? (
                                    <>
                                        <p className="text-sm text-[var(--color-muted-foreground)]">
                                            {t.agent.console.view.replace("{role}", roleLabel)}
                                        </p>
                                        <Link href={`/agent/${nfaAddress}/${tokenId}/console`}>
                                            <Button className="w-full gap-2">
                                                {t.agent.console.open} <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </>
                                ) : isTemplateListing ? (
                                    myInstance ? (
                                        <Link href={`/agent/${nfaAddress}/${myInstance.tokenId.toString()}/console`}>
                                            <Button className="w-full gap-2">
                                                {language === "zh" ? "进入我的 Agent 控制台" : "Open My Agent Console"}
                                                {" "}(#{myInstance.tokenId.toString()})
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href="/me">
                                            <Button variant="outline" className="w-full gap-2">
                                                {language === "zh" ? "前往我的 Agent" : "Go to My Agents"} <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Post-rental authorization dialog */}
            {mintedTokenId !== null && (
                <OperatorAuthDialog
                    open={showAuthDialog}
                    onOpenChange={setShowAuthDialog}
                    tokenId={mintedTokenId.toString()}
                    nfaAddress={nfaAddress}
                    renter={address ?? ""}
                    onComplete={handleAuthComplete}
                />
            )}
        </>
    );
}
