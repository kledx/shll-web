import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet, opBNB, opBNBTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

const bscTestnetWithCustomRpc = {
    ...bscTestnet,
    rpcUrls: {
        default: {
            http: [
                'https://bnb-testnet.g.alchemy.com/v2/CVaHvQCguUQe5C-mRLHWe5qzcCmPkA1T',
                'https://data-seed-prebsc-1-s1.binance.org:8545'
            ],
        },
    },
} as const;

export const config = getDefaultConfig({
    appName: 'SHLL',
    projectId: '1e7ed9b14b2c61a5e9c2273f5ed6d048',
    chains: [bscTestnetWithCustomRpc],
    transports: {
        [bscTestnetWithCustomRpc.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545', {
            batch: { wait: 0 }, // Disable batching
            retryCount: 3,
            retryDelay: 1000,
            timeout: 20_000,
        }),
    },
    ssr: true,
});

