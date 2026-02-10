import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet, opBNB, opBNBTestnet } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'shll',
    projectId: 'YOUR_PROJECT_ID',
    chains: [opBNB, opBNBTestnet, bsc, bscTestnet],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
