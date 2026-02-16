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
    // V1.5 fields
    allowExplorerMode: boolean;
    explorerMaxTradeLimit: bigint;
    explorerMaxDailyLimit: bigint;
    allowParamsUpdate: boolean;
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

// V2.0: reads from PolicyGuardV3 (merged contract)
export function usePolicy(policyId?: number, version?: number) {
    const { data: schema, isLoading, error } = useReadContract({
        address: CONTRACTS.PolicyGuardV3.address,
        abi: CONTRACTS.PolicyGuardV3.abi,
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
