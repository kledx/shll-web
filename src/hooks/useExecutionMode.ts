import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Execution modes in PolicyGuardV3:
 *   0 = STRICT  — full enforcement (default)
 *   1 = MANUAL  — owner/renter-only bypass of token groups
 *   2 = EXPLORER — relaxed limits for exploration
 */
export const EXECUTION_MODES = ['STRICT', 'MANUAL', 'EXPLORER'] as const;
export type ExecutionModeName = typeof EXECUTION_MODES[number];

export function useExecutionMode(tokenId?: bigint) {
    // Read current mode
    const { data: modeRaw, isLoading: isReading, refetch } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: CONTRACTS.PolicyGuardV3.abi,
        functionName: 'executionMode',
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: { enabled: tokenId !== undefined },
    });

    // Write
    const {
        data: hash,
        writeContract,
        isPending: isWritePending,
        error: writeError,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            toast.success('Execution mode updated');
            void refetch();
        }
    }, [isConfirmed, refetch]);

    useEffect(() => {
        if (writeError) {
            toast.error('Failed to update execution mode', {
                description: writeError.message?.slice(0, 120),
            });
        }
    }, [writeError]);

    const mode = typeof modeRaw === 'number' ? modeRaw : undefined;
    const modeName: ExecutionModeName | undefined =
        mode !== undefined && mode < EXECUTION_MODES.length
            ? EXECUTION_MODES[mode]
            : undefined;

    const setMode = (newMode: number) => {
        if (tokenId === undefined) return;
        writeContract({
            address: CONTRACTS.PolicyGuardV3.address,
            abi: CONTRACTS.PolicyGuardV3.abi,
            functionName: 'setExecutionMode',
            args: [tokenId, newMode],
        });
    };

    return {
        mode,
        modeName,
        isReading,
        setMode,
        isWriting: isWritePending || isConfirming,
        isConfirmed,
        hash,
        error: writeError,
    };
}
