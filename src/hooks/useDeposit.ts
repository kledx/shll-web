import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Address, parseUnits, erc20Abi } from "viem";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type DepositStep = "idle" | "approving" | "depositing";

export function useDeposit() {
    const {
        data: hash,
        writeContract,
        isPending: isWritePending,
        error: writeError,
        reset,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
    } = useWaitForTransactionReceipt({ hash });

    const [step, setStep] = useState<DepositStep>("idle");

    // Toast feedback
    useEffect(() => {
        if (hash && step === "approving") {
            toast.info("Approval submitted", {
                description: `Tx: ${hash.slice(0, 10)}...`,
            });
        } else if (hash && step === "depositing") {
            toast.info("Deposit submitted", {
                description: `Tx: ${hash.slice(0, 10)}...`,
            });
        }
    }, [hash, step]);

    useEffect(() => {
        if (isConfirmed && step === "depositing") {
            toast.success("Deposit confirmed!");
            setStep("idle");
        }
    }, [isConfirmed, step]);

    useEffect(() => {
        if (writeError) {
            toast.error(step === "approving" ? "Approval failed" : "Deposit failed", {
                description: writeError.message?.slice(0, 120),
            });
            setStep("idle");
        }
    }, [writeError, step]);

    // Deposit native BNB via AgentNFA.fundAgent(tokenId)
    const depositNative = (tokenId: string, amountStr: string) => {
        reset();
        setStep("depositing");
        const value = parseUnits(amountStr, 18);
        writeContract({
            address: CONTRACTS.AgentNFA.address,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: "fundAgent",
            args: [BigInt(tokenId)],
            value,
        });
    };

    // Deposit ERC-20 token: Step 1 - approve AgentAccount to spend tokens
    const approveToken = (tokenAddress: Address, agentAccount: Address, amountStr: string, decimals: number) => {
        reset();
        setStep("approving");
        const amount = parseUnits(amountStr, decimals);
        writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [agentAccount, amount],
        });
    };

    // Deposit ERC-20 token: Step 2 - call depositToken on AgentAccount
    const depositToken = (agentAccount: Address, tokenAddress: Address, amountStr: string, decimals: number) => {
        reset();
        setStep("depositing");
        const amount = parseUnits(amountStr, decimals);
        writeContract({
            address: agentAccount,
            abi: CONTRACTS.AgentAccount.abi,
            functionName: "depositToken",
            args: [tokenAddress, amount],
        });
    };

    return {
        depositNative,
        approveToken,
        depositToken,
        step,
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError,
    };
}
