/**
 * Guardrails Panel — V3.0+ only.
 * Renders SafetyConfigWizard (composable policy model).
 */
"use client";

import { SafetyConfigWizard } from "./safety-config-wizard";

interface GuardrailsPanelProps {
    tokenId: string;
    policyId?: number;
    version?: number;
    isInteractive?: boolean;
    language?: "en" | "zh";
}

export function GuardrailsPanel({
    tokenId,
    language = "en",
}: GuardrailsPanelProps) {
    return <SafetyConfigWizard tokenId={tokenId} language={language} />;
}
