import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook for reading/writing token permission bitmap via PolicyGuardV3.
 * Bits define which token-level permissions are granted.
 */
export function useTokenPermissions(tokenId?: bigint) {
    // Read current permission bitmap
    const { data: permBitmap, isLoading: isReading, refetch } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: CONTRACTS.PolicyGuardV3.abi,
        functionName: 'tokenPermissions',
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: { enabled: tokenId !== undefined },
    });

    // Grant
    const {
        data: grantHash,
        writeContract: grantWrite,
        isPending: isGrantPending,
        error: grantError,
    } = useWriteContract();

    const { isLoading: isGrantConfirming, isSuccess: isGrantConfirmed } =
        useWaitForTransactionReceipt({ hash: grantHash });

    // Revoke
    const {
        data: revokeHash,
        writeContract: revokeWrite,
        isPending: isRevokePending,
        error: revokeError,
    } = useWriteContract();

    const { isLoading: isRevokeConfirming, isSuccess: isRevokeConfirmed } =
        useWaitForTransactionReceipt({ hash: revokeHash });

    useEffect(() => {
        if (isGrantConfirmed) {
            toast.success('Permission granted');
            void refetch();
        }
    }, [isGrantConfirmed, refetch]);

    useEffect(() => {
        if (isRevokeConfirmed) {
            toast.success('Permission revoked');
            void refetch();
        }
    }, [isRevokeConfirmed, refetch]);

    useEffect(() => {
        if (grantError) {
            toast.error('Failed to grant permission', {
                description: grantError.message?.slice(0, 120),
            });
        }
    }, [grantError]);

    useEffect(() => {
        if (revokeError) {
            toast.error('Failed to revoke permission', {
                description: revokeError.message?.slice(0, 120),
            });
        }
    }, [revokeError]);

    const grantPermission = (bits: bigint) => {
        if (tokenId === undefined) return;
        grantWrite({
            address: CONTRACTS.PolicyGuardV3.address,
            abi: CONTRACTS.PolicyGuardV3.abi,
            functionName: 'grantTokenPermission',
            args: [tokenId, bits],
        });
    };

    const revokePermission = (bits: bigint) => {
        if (tokenId === undefined) return;
        revokeWrite({
            address: CONTRACTS.PolicyGuardV3.address,
            abi: CONTRACTS.PolicyGuardV3.abi,
            functionName: 'revokeTokenPermission',
            args: [tokenId, bits],
        });
    };

    const hasBit = (bit: number): boolean => {
        if (typeof permBitmap !== 'bigint') return false;
        return (permBitmap & (BigInt(1) << BigInt(bit))) !== BigInt(0);
    };

    return {
        permBitmap: typeof permBitmap === 'bigint' ? permBitmap : undefined,
        hasBit,
        isReading,
        grantPermission,
        revokePermission,
        isWriting: isGrantPending || isGrantConfirming || isRevokePending || isRevokeConfirming,
    };
}
