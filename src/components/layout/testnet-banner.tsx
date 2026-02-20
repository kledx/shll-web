import { AlertTriangle, Rocket } from "lucide-react";
import { CHAIN_NAME, IS_MAINNET } from "@/config/wagmi";

export function TestnetBanner() {
    if (IS_MAINNET) {
        // Mainnet: public beta announcement
        return (
            <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
                <Rocket className="w-4 h-4" />
                <span>
                    🎉 <strong>BSC Mainnet Public Beta</strong> — SHLL Protocol is live! Agents operate with real assets. Please use with caution.
                </span>
            </div>
        );
    }

    // Testnet: warning banner
    return (
        <div className="w-full bg-amber-400 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>
                You are using the <strong>{CHAIN_NAME}</strong> environment. Agents and assets are for testing purposes only.
            </span>
        </div>
    );
}
