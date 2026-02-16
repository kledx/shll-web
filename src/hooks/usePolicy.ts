import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { useMemo } from 'react';

export interface ParamSchema {
    maxSlippageBps: number;
    maxTradeLimit: bigint;
    maxDailyLimit: bigint;
    allowedTokenGroups: readonly number[];
    allowedDexGroups: readonly number[];
    receiverMustBeVault: boolean;
    forbidInfiniteApprove: boolean;
}

export interface InstanceParams {
    slippageBps: number;
    tradeLimit: bigint;
    dailyLimit: bigint;
    tokenGroupId: number;
    dexGroupId: number;
    riskTier: number;
}

export const INSTANCE_PARAMS_ABI_TYPES = "uint16, uint96, uint96, uint32, uint32, uint8";

export function usePolicy(policyId?: number, version?: number) {
    const { data: schema, isLoading, error } = useReadContract({
        address: CONTRACTS.PolicyRegistry.address,
        abi: CONTRACTS.PolicyRegistry.abi,
        functionName: 'getSchema',
        args: policyId !== undefined && version !== undefined ? [policyId, version] : undefined,
        query: {
            enabled: policyId !== undefined && version !== undefined,
        },
    });

    const encodeParams = useMemo(() => {
        return (params: InstanceParams) => {
            return encodeAbiParameters(
                parseAbiParameters(INSTANCE_PARAMS_ABI_TYPES),
                [
                    params.slippageBps,
                    params.tradeLimit,
                    params.dailyLimit,
                    params.tokenGroupId,
                    params.dexGroupId,
                    params.riskTier
                ]
            );
        };
    }, []);

    return {
        schema: schema as ParamSchema | undefined,
        isLoading,
        error,
        encodeParams,
    };
}
