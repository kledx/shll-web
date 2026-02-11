import { AlertTriangle } from "lucide-react";

export function TestnetBanner() {
    return (
        <div className="w-full bg-amber-400 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>
                You are using the <strong>BSC Testnet</strong> environment. Agents and assets are for testing purposes only.
            </span>
        </div>
    );
}
