'use client';

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
import { Toaster } from 'sonner';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
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
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

