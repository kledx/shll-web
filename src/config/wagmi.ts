import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

// Read chain config from environment (baked at build time)
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '97');
const customRpcUrl = process.env.NEXT_PUBLIC_RPC_URL || '';

// Select primary chain based on NEXT_PUBLIC_CHAIN_ID
const isMainnet = chainId === 56;

const primaryChain = isMainnet
    ? {
        ...bsc,
        ...(customRpcUrl ? {
            rpcUrls: {
                default: { http: [customRpcUrl] },
            },
        } : {}),
    } as const
    : {
        ...bscTestnet,
        rpcUrls: {
            default: {
                http: [
                    customRpcUrl || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
                    'https://data-seed-prebsc-2-s1.bnbchain.org:8545',
                    'https://bsc-testnet.public.blastapi.io',
                ],
            },
        },
    } as const;

const primaryTransportUrl = isMainnet
    ? (customRpcUrl || 'https://bsc-dataseed1.binance.org')
    : (customRpcUrl || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545');

export const config = getDefaultConfig({
    appName: 'SHLL',
    projectId: '1e7ed9b14b2c61a5e9c2273f5ed6d048',
    chains: isMainnet ? [primaryChain, bscTestnet] : [primaryChain, bsc],
    transports: {
        [primaryChain.id]: http(primaryTransportUrl, {
            batch: { wait: 0 },
            retryCount: 3,
            retryDelay: 1000,
            timeout: 20_000,
        }),
        ...(isMainnet
            ? { [bscTestnet.id]: http() }
            : { [bsc.id]: http() }),
    },
    ssr: true,
});

// Export chain info for use across the app
export const SUPPORTED_CHAIN_ID = primaryChain.id;
export const CHAIN_NAME = isMainnet ? 'BSC Mainnet' : 'BSC Testnet';
export const IS_MAINNET = isMainnet;
