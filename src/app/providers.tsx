'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config, type State } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { bsc, bscTestnet } from '@reown/appkit/networks';
import { config, wagmiAdapter, projectId, IS_MAINNET } from '@/config/wagmi';
import { Toaster } from 'sonner';

// Guard against duplicate registration in dev mode (HMR / Strict Mode)
let appKitInstance: ReturnType<typeof createAppKit> | null = null;

function getOrCreateAppKit() {
    if (appKitInstance) return appKitInstance;
    appKitInstance = createAppKit({
        adapters: [wagmiAdapter],
        projectId,
        networks: IS_MAINNET ? [bsc, bscTestnet] : [bscTestnet, bsc],
        defaultNetwork: IS_MAINNET ? bsc : bscTestnet,
        metadata: {
            name: 'SHLL Protocol',
            description: 'AI Agent Security Protocol on BNB Chain',
            url: 'https://shll.run',
            icons: ['https://shll.run/icon.png'],
        },
        features: {
            analytics: false,
            swaps: false,
            onramp: false,
            email: false,
            socials: false,
        },
        themeMode: 'light',
    });
    return appKitInstance;
}

// Initialize once at module level
getOrCreateAppKit();

const queryClient = new QueryClient();

export function Providers({ children, initialState }: { children: React.ReactNode; initialState?: State }) {
    return (
        <WagmiProvider config={config as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster
                    position="bottom-right"
                    richColors
                    toastOptions={{
                        style: {
                            fontFamily: "'Inter', sans-serif",
                        },
                    }}
                />
            </QueryClientProvider>
        </WagmiProvider>
    );
}
