import { cookieStorage, createStorage } from 'wagmi';
import { bsc, bscTestnet } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Read chain config from environment (baked at build time)
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '97');
const customRpcUrl = process.env.NEXT_PUBLIC_RPC_URL || '';

// Select primary chain based on NEXT_PUBLIC_CHAIN_ID
export const IS_MAINNET = chainId === 56;
export const CHAIN_NAME = IS_MAINNET ? 'BSC Mainnet' : 'BSC Testnet';

// WalletConnect project ID — get from https://cloud.reown.com/
export const projectId = '1e7ed9b14b2c61a5e9c2273f5ed6d048';

// Supported networks
const networks = IS_MAINNET ? [bsc, bscTestnet] : [bscTestnet, bsc];

export const SUPPORTED_CHAIN_ID = IS_MAINNET ? bsc.id : bscTestnet.id;

// Metadata for the DApp
const metadata = {
    name: 'SHLL Protocol',
    description: 'AI Agent Security Protocol on BNB Chain',
    url: 'https://shll.run',
    icons: ['https://shll.run/icon.png'],
};

// Wagmi adapter for AppKit
export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({ storage: cookieStorage }),
    ssr: true,
    projectId,
    networks,
});

// Export config for WagmiProvider
export const config = wagmiAdapter.wagmiConfig;
