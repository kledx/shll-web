import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet, opBNB, opBNBTestnet } from 'wagmi/chains';

const bscTestnetWithCustomRpc = {
    ...bscTestnet,
    rpcUrls: {
        default: { http: ['https://bsc-testnet-rpc.publicnode.com'] },
    },
} as const;

export const config = getDefaultConfig({
    appName: 'shll',
    projectId: 'YOUR_PROJECT_ID',
    chains: [bscTestnetWithCustomRpc, opBNB, opBNBTestnet, bsc],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
