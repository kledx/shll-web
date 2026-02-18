/**
 * Guardrails Panel — version-aware wrapper.
 *
 * Detects contract version via the NEXT_PUBLIC_POLICYGUARD_VERSION env var:
 * - "v4" | "v3.0" → renders SafetyConfigWizard (composable plugin model)
 * - anything else  → renders legacy PolicySettingsPanel (V1.x execution modes)
 *
 * This allows a seamless upgrade path: flip the env var when deploying V3.0 contracts.
 */
"use client";

import { PolicySettingsPanel } from "./policy-settings-panel";
import { SafetyConfigWizard } from "./safety-config-wizard";

/** Read-once from build-time env */
const POLICY_VERSION = (process.env.NEXT_PUBLIC_POLICYGUARD_VERSION ?? "").toLowerCase();
const IS_V3 = POLICY_VERSION === "v4" || POLICY_VERSION === "v3" || POLICY_VERSION === "v3.0";

interface GuardrailsPanelProps {
    tokenId: string;
    policyId?: number;
    version?: number;
    isInteractive?: boolean;
    language?: "en" | "zh";
}

export function GuardrailsPanel({
    tokenId,
    policyId,
    version,
    isInteractive = false,
    language = "en",
}: GuardrailsPanelProps) {
    if (IS_V3) {
        return <SafetyConfigWizard tokenId={tokenId} language={language} />;
    }

    return (
        <PolicySettingsPanel
            tokenId={tokenId}
            policyId={policyId}
            version={version}
            isInteractive={isInteractive}
            language={language}
        />
    );
}
