"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { Shield, AlertTriangle } from "lucide-react";

const ADMIN_WALLET = getRuntimeEnv("NEXT_PUBLIC_ADMIN_WALLET", "").toLowerCase();

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { address, isConnected } = useAccount();

    if (!isConnected) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
                    <Shield className="mx-auto mb-4 h-12 w-12 text-amber-600" />
                    <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
                        Admin Access Required
                    </h2>
                    <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
                        Connect your wallet to access the admin panel.
                    </p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    if (!ADMIN_WALLET) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center max-w-md">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">Configuration Error</h2>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        <code className="bg-[var(--color-muted)]/50 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_ADMIN_WALLET</code> is not configured.
                    </p>
                </div>
            </div>
        );
    }

    if (address?.toLowerCase() !== ADMIN_WALLET) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center max-w-md">
                    <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
                    <p className="text-sm text-[var(--color-muted-foreground)] mb-1">
                        Connected wallet is not authorized.
                    </p>
                    <p className="font-mono text-xs text-red-400 break-all">
                        {address}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
