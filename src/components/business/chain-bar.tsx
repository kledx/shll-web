"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Network } from "lucide-react";

export function ChainBar() {
    const { chain } = useAccount();
    const { chains, switchChain } = useSwitchChain();

    if (!chain) return null;

    return (
        <div className="flex items-center gap-2 mb-6 p-2 bg-[var(--color-paper)] border border-[var(--color-burgundy)]/10 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100/50 text-green-700 rounded text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {chain.name}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                        Switch Chain <ChevronDown className="h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {chains.map((c) => (
                        <DropdownMenuItem
                            key={c.id}
                            onClick={() => switchChain({ chainId: c.id })}
                            className="font-sans"
                        >
                            {c.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
