'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { bsc, bscTestnet } from '@reown/appkit/networks';
import { config, wagmiAdapter, projectId, IS_MAINNET } from '@/config/wagmi';
import { Toaster } from 'sonner';

// Initialize AppKit (must be called outside React components)
const appKit = createAppKit({
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
    },
    themeMode: 'light',
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config as Config}>
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
