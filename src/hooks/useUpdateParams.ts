import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { INSTANCE_PARAMS_ABI_TYPES, InstanceParams } from './usePolicy';

/**
 * Hook for updating mutable instance parameters via PolicyGuardV3.updateParams().
 * Only works if the policy's `allowParamsUpdate` is true.
 */
export function useUpdateParams() {
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
            toast.success('Instance parameters updated');
        }
    }, [isConfirmed]);

    useEffect(() => {
        if (writeError) {
            toast.error('Failed to update parameters', {
                description: writeError.message?.slice(0, 120),
            });
        }
    }, [writeError]);

    const updateParams = (instanceId: bigint, params: InstanceParams) => {
        const packed = encodeAbiParameters(
            parseAbiParameters(INSTANCE_PARAMS_ABI_TYPES),
            [
                params.slippageBps,
                params.tradeLimit,
                params.dailyLimit,
                params.tokenGroupId,
                params.dexGroupId,
                params.riskTier,
            ]
        );

        writeContract({
            address: CONTRACTS.PolicyGuardV3.address,
            abi: CONTRACTS.PolicyGuardV3.abi,
            functionName: 'updateParams',
            args: [instanceId, packed],
        });
    };

    return {
        updateParams,
        isLoading: isWritePending || isConfirming,
        isConfirmed,
        hash,
        error: writeError,
    };
}
