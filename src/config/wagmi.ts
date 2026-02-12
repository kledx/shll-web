import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet, opBNB, opBNBTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

const bscTestnetWithCustomRpc = {
    ...bscTestnet,
    rpcUrls: {
        default: {
            http: [
                'https://bsc-testnet.publicnode.com',
                'https://data-seed-prebsc-1-s1.binance.org:8545',
                'https://data-seed-prebsc-2-s1.binance.org:8545',
            ],
        },
    },
} as const;

export const config = getDefaultConfig({
    appName: 'SHLL',
    projectId: '1e7ed9b14b2c61a5e9c2273f5ed6d048',
    chains: [bscTestnetWithCustomRpc, bsc],
    transports: {
        [bscTestnetWithCustomRpc.id]: http('https://bsc-testnet.publicnode.com', {
            batch: { wait: 0 }, // Disable batching
            retryCount: 3,
            retryDelay: 1000,
            timeout: 20_000,
        }),
    },
    ssr: true,
});

