import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet, opBNB, opBNBTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

// BSC Testnet RPCs - using reliable bnbchain.org seed nodes
const bscTestnetWithCustomRpc = {
    ...bscTestnet,
    rpcUrls: {
        default: {
            http: [
                'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
                'https://data-seed-prebsc-2-s1.bnbchain.org:8545',
                'https://bsc-testnet.public.blastapi.io',
            ],
        },
    },
} as const;

export const config = getDefaultConfig({
    appName: 'SHLL',
    projectId: '1e7ed9b14b2c61a5e9c2273f5ed6d048',
    chains: [bscTestnetWithCustomRpc, bsc],
    transports: {
        [bscTestnetWithCustomRpc.id]: http('https://data-seed-prebsc-1-s1.bnbchain.org:8545', {
            batch: { wait: 0 }, // Disable batching
            retryCount: 3,
            retryDelay: 1000,
            timeout: 20_000,
        }),
    },
    ssr: true,
});

