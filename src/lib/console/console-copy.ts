export interface ConsoleCopy {
    errorLoadAgent: string;
    goAgentDetail: string;
    openDocs: string;
    nextStepTitle: string;
    nextStepConnect: string;
    nextStepRent: string;
    nextStepPathConnect: string;
    nextStepPathRentPrefix: string;
    agentDetail: string;
    currentRole: string;
    roleLabels: {
        owner: string;
        renter: string;
        guest: string;
    };
    roleHintOwner: string;
    roleHintRenter: string;
    roleHintGuest: string;
    readOnlyMessage: string;
    executeDisabledByAutopilot: string;
    executeDisabledByModeExternal: string;
    executeDisabledByModePack: string;
    templateBoundaryHint: string;
    packInvalidPolicyHint: string;
    actionBuilderHiddenInvalidPack: string;
    actionBuilderHiddenNoTemplates: string;
    actionScopeHint: string;
    sectionLabels: {
        control: string;
        vault: string;
        history: string;
    };
    autopilotErrors: {
        tokenNotAllowedByRunner: string;
        insufficientGas: string;
        rpcTimeout: string;
        operatorMismatch: string;
        chainIdMismatch: string;
        unknownExpectedAddress: string;
        nfaAddressMismatch: (expected: string, current: string) => string;
    };
    status: {
        title: string;
        leaseLabels: {
            NOT_RENTED: string;
            RENTED_ACTIVE: string;
            RENTED_EXPIRED: string;
        };
        packLabels: {
            PACK_NONE: string;
            PACK_LOADING: string;
            PACK_VALID: string;
            PACK_INVALID: string;
        };
        modeLabels: {
            manual: string;
            managed: string;
            external: string;
        };
        token: string;
        leaseExpires: string;
        vaultUri: string;
        vaultHash: string;
        maxDeadline: string;
        maxPath: string;
        allowedTokens: string;
        allowedSpenders: string;
        safetyTags: {
            noPrivateKeys: string;
            noWithdrawByRunner: string;
            policyEnforced: string;
        };
    };
    autopilot: {
        title: string;
        nonce: string;
        onchainOperator: string;
        operatorExpires: string;
        notSet: string;
        operatorAddress: string;
        useDefaultRunner: string;
        operatorExpiresInput: string;
        hint: string;
        enabling: string;
        enable: string;
        disabling: string;
        disable: string;
        renterOnlyHint: string;
        runnerLoading: string;
        runnerOperator: string;
        runnerEnabled: string;
        runnerReason: string;
        zeroBalanceHint: string;
        modeManagedOnlyHint: string;
        blockedByPackHint: string;
        runnerModeLabels: {
            manual: string;
            managed: string;
            external: string;
        };
        runtimeStateLabels: {
            AUTO_OFF: string;
            AUTO_ON: string;
            AUTO_ENABLING: string;
            AUTO_EXPIRED: string;
        };
        enableStateLabels: {
            IDLE: string;
            SIGNING: string;
            SUBMITTING: string;
            ONCHAIN_PENDING: string;
            ONCHAIN_CONFIRMED: string;
            ERROR: string;
        };
        boolTrue: string;
        boolFalse: string;
        toast: {
            invalidOperatorAddress: string;
            selectOperatorExpiry: string;
            expiryFutureRequired: string;
            enabledSuccess: string;
            enableFailed: string;
            disabledSuccess: string;
            disableFailed: string;
            unknownError: string;
            txPrefix: string;
        };
    };
    builder: {
        title: string;
        readOnlyFallback: string;
        preflight: {
            issuesFound: (count: number) => string;
            blockedHint: string;
            simulateBlockedToast: string;
            checking: string;
        };
        policyHints: {
            targetNotAllowed: string;
            selectorNotAllowed: string;
            tokenNotAllowed: string;
            spenderNotAllowed: string;
            policyViolation: string;
            amountOutMinZero: string;
            slippageExceeds: string;
            quoteUnavailable: string;
        };
    };
    history: {
        loading: string;
        sourceIndexer: string;
        sourceRunner: string;
        degradedPrefix: string;
        degradedDefault: string;
        txUnavailable: string;
    };
    vault: {
        readOnlyHint: string;
        safeModeHint: string;
        depositDialogTitle: string;
        depositDialogDesc: string;
        accountLabel: string;
        tokenLabel: string;
        amountLabel: string;
        selectToken: string;
        nativeTag: string;
        approveStep: string;
        depositStep: string;
        depositNative: string;
    };
}

const enCopy: ConsoleCopy = {
    errorLoadAgent: "Failed to load agent on-chain data.",
    goAgentDetail: "Go to Agent Detail",
    openDocs: "Open Docs",
    nextStepTitle: "What to do next",
    nextStepConnect: "Connect wallet first, then reopen this console.",
    nextStepRent: "Rent or extend first on Agent Detail, then come back to Console.",
    nextStepPathConnect: "/me -> connect wallet -> back to console",
    nextStepPathRentPrefix: "Path: ",
    agentDetail: "Agent Detail",
    currentRole: "Current Role",
    roleLabels: {
        owner: "Owner",
        renter: "Active Renter",
        guest: "No Access",
    },
    roleHintOwner: "You can inspect history and disable autopilot, but only active renter can sign enable permit.",
    roleHintRenter: "You can simulate, execute, and enable autopilot with signature.",
    roleHintGuest: "Switch to owner/renter wallet or rent this agent first.",
    readOnlyMessage: "Read-only mode. Simulation and execution require active renter with valid lease.",
    executeDisabledByAutopilot: "Autopilot is ON: only Simulate is allowed and manual Execute is disabled.",
    executeDisabledByModeExternal: "External mode disables manual Execute by default. Enable it explicitly in capability pack.",
    executeDisabledByModePack: "Manual Execute is disabled by capability pack policy.",
    templateBoundaryHint: "Templates define executable action boundaries only. Every execution is still enforced by PolicyGuard.",
    packInvalidPolicyHint: "Capability pack hash validation failed. Autopilot is disabled by policy.",
    actionBuilderHiddenInvalidPack: "Capability pack validation failed. Transaction builder is hidden.",
    actionBuilderHiddenNoTemplates: "No supported console templates in capability pack.",
    actionScopeHint: "Action templates define this agent's allowed action/permission boundary. They do not bypass controls. Every on-chain execution is still enforced by PolicyGuard.",
    sectionLabels: {
        control: "Control",
        vault: "Vault",
        history: "History",
    },
    autopilotErrors: {
        tokenNotAllowedByRunner: "Runner has not allowed this agent. Add the tokenId to runner `ALLOWED_TOKEN_IDS`.",
        insufficientGas: "Runner operator has insufficient gas. Fund the runner operator address and retry.",
        rpcTimeout: "RPC request timed out. Switch to a more stable RPC endpoint and retry.",
        operatorMismatch: "Permit operator does not match runner operator address. Use the current runner operator.",
        chainIdMismatch: "Chain ID mismatch. Ensure frontend, runner, and wallet are on the same network.",
        unknownExpectedAddress: "unknown address",
        nfaAddressMismatch: (expected: string, current: string) =>
            `AgentNFA address mismatch. Runner expects ${expected}, current page uses ${current}.`,
    },
    status: {
        title: "Status Overview",
        leaseLabels: {
            NOT_RENTED: "Not Rented",
            RENTED_ACTIVE: "Lease Active",
            RENTED_EXPIRED: "Lease Expired",
        },
        packLabels: {
            PACK_NONE: "PACK NONE",
            PACK_LOADING: "PACK LOADING",
            PACK_VALID: "PACK VALID",
            PACK_INVALID: "PACK INVALID",
        },
        modeLabels: {
            manual: "MANUAL",
            managed: "MANAGED",
            external: "EXTERNAL",
        },
        token: "Token",
        leaseExpires: "Lease Expires",
        vaultUri: "Vault URI",
        vaultHash: "Vault Hash",
        maxDeadline: "Max Deadline",
        maxPath: "Max Path",
        allowedTokens: "Allowed Tokens",
        allowedSpenders: "Allowed Spenders",
        safetyTags: {
            noPrivateKeys: "No private keys",
            noWithdrawByRunner: "No withdrawals by runner",
            policyEnforced: "Policy enforced",
        },
    },
    autopilot: {
        title: "Autopilot",
        nonce: "Nonce",
        onchainOperator: "On-chain operator",
        operatorExpires: "Operator expires",
        notSet: "not set",
        operatorAddress: "Operator Address",
        useDefaultRunner: "Use default runner operator",
        operatorExpiresInput: "Operator Expires",
        hint: "Tip: operator should be the runner address. Expiry should not exceed your rental period.",
        enabling: "Enabling...",
        enable: "Enable Autopilot (Sign)",
        disabling: "Disabling...",
        disable: "Disable Autopilot",
        renterOnlyHint: "Only active renter can sign operator permit.",
        runnerLoading: "Loading runner status...",
        runnerOperator: "Runner Operator",
        runnerEnabled: "Runner Enabled",
        runnerReason: "Last Reason",
        zeroBalanceHint: "Agent account balance is zero. Autopilot cannot execute yet. Deposit funds in the Vault panel first.",
        modeManagedOnlyHint: "Current mode does not support autopilot enable.",
        blockedByPackHint: "Capability pack validation failed. Autopilot enable is blocked.",
        runnerModeLabels: {
            manual: "MANUAL",
            managed: "MANAGED",
            external: "EXTERNAL",
        },
        runtimeStateLabels: {
            AUTO_OFF: "AUTO OFF",
            AUTO_ON: "AUTO ON",
            AUTO_ENABLING: "AUTO ENABLING",
            AUTO_EXPIRED: "AUTO EXPIRED",
        },
        enableStateLabels: {
            IDLE: "IDLE",
            SIGNING: "SIGNING",
            SUBMITTING: "SUBMITTING",
            ONCHAIN_PENDING: "ONCHAIN PENDING",
            ONCHAIN_CONFIRMED: "ONCHAIN CONFIRMED",
            ERROR: "ERROR",
        },
        boolTrue: "true",
        boolFalse: "false",
        toast: {
            invalidOperatorAddress: "Invalid operator address",
            selectOperatorExpiry: "Please select operator expiry",
            expiryFutureRequired: "Operator expiry must be in the future",
            enabledSuccess: "Autopilot enabled",
            enableFailed: "Enable autopilot failed",
            disabledSuccess: "Autopilot disabled",
            disableFailed: "Disable autopilot failed",
            unknownError: "Unknown error",
            txPrefix: "Tx",
        },
    },
    history: {
        loading: "Loading...",
        sourceIndexer: "Indexer",
        sourceRunner: "Runner",
        degradedPrefix: "Activity degraded:",
        degradedDefault: "Indexer unavailable, using runner fallback.",
        txUnavailable: "n/a",
    },
    vault: {
        readOnlyHint: "Read-only mode. Deposit/withdraw actions are disabled.",
        safeModeHint: "Safe mode: withdraw action is hidden.",
        depositDialogTitle: "Deposit to Agent Vault",
        depositDialogDesc: "Send tokens to the Agent's isolated account.",
        accountLabel: "Account",
        tokenLabel: "Token",
        amountLabel: "Amount",
        selectToken: "Select token",
        nativeTag: "(Native)",
        approveStep: "1. Approve",
        depositStep: "2. Deposit",
        depositNative: "Deposit BNB",
    },
    builder: {
        title: "Action Builder",
        readOnlyFallback: "Console is currently in read-only mode.",
        preflight: {
            issuesFound: (count: number) => `Preflight found ${count} policy issue(s)`,
            blockedHint: "Please adjust template, tokens, or parameters before simulation.",
            simulateBlockedToast: "Current parameters are blocked by policy. Please adjust and try again.",
            checking: "Checking policy preflight...",
        },
        policyHints: {
            targetNotAllowed: "Current policy does not allow this target. Please try another template or pair.",
            selectorNotAllowed: "Current policy does not allow this action type. Try a different operation.",
            tokenNotAllowed: "Current policy does not allow this token pair. Please choose different tokens.",
            spenderNotAllowed: "Current policy does not allow this approval route. Try a different action.",
            policyViolation: "Policy validation did not pass. Please adjust parameters and try again.",
            amountOutMinZero: "Slippage guard triggered: minimum output cannot be zero.",
            slippageExceeds: "Slippage exceeds policy limit. Please adjust trade parameters.",
            quoteUnavailable: "Quote unavailable right now. Please retry or change the pair.",
        },
    },
};

const zhOverrides: Partial<ConsoleCopy> = {
    errorLoadAgent: "\u52a0\u8f7d Agent \u94fe\u4e0a\u6570\u636e\u5931\u8d25\u3002",
    goAgentDetail: "\u8fd4\u56de Agent \u8be6\u60c5",
    openDocs: "\u6253\u5f00\u6587\u6863",
    nextStepTitle: "\u4e0b\u4e00\u6b65\u5efa\u8bae",
    nextStepConnect: "\u8bf7\u5148\u8fde\u63a5\u94b1\u5305\uff0c\u7136\u540e\u91cd\u65b0\u8fdb\u5165\u63a7\u5236\u53f0\u3002",
    nextStepRent: "\u8bf7\u5148\u5728 Agent \u8be6\u60c5\u9875\u5b8c\u6210\u79df\u7528\u6216\u7eed\u79df\uff0c\u518d\u8fd4\u56de\u63a7\u5236\u53f0\u3002",
    nextStepPathConnect: "/me -> \u8fde\u63a5\u94b1\u5305 -> \u8fd4\u56de\u63a7\u5236\u53f0",
    nextStepPathRentPrefix: "\u8def\u5f84: ",
    agentDetail: "Agent \u8be6\u60c5",
    currentRole: "\u5f53\u524d\u89d2\u8272",
    roleLabels: {
        owner: "\u6240\u6709\u8005",
        renter: "\u5f53\u524d\u79df\u6237",
        guest: "\u65e0\u6743\u9650",
    },
    roleHintOwner: "\u53ef\u67e5\u770b\u5386\u53f2\u5e76\u5173\u95ed Autopilot\uff0c\u4f46\u53ea\u6709\u5f53\u524d\u79df\u6237\u53ef\u7b7e\u540d\u5f00\u542f\u3002",
    roleHintRenter: "\u53ef\u6a21\u62df\u3001\u6267\u884c\uff0c\u5e76\u901a\u8fc7\u7b7e\u540d\u5f00\u542f Autopilot\u3002",
    roleHintGuest: "\u8bf7\u5207\u6362\u4e3a\u6240\u6709\u8005/\u79df\u6237\u94b1\u5305\uff0c\u6216\u5148\u5b8c\u6210\u79df\u7528\u3002",
    readOnlyMessage: "\u5f53\u524d\u4e3a\u53ea\u8bfb\u6a21\u5f0f\u3002\u53ea\u6709\u5f53\u524d\u79df\u6237\u4e14\u79df\u671f\u6709\u6548\u65f6\u53ef\u6a21\u62df/\u6267\u884c\u4ea4\u6613\u3002",
    executeDisabledByAutopilot: "Autopilot \u5df2\u5f00\u542f\uff1a\u5f53\u524d\u4ec5\u5141\u8bb8 Simulate\uff0c\u624b\u52a8 Execute \u5df2\u7981\u7528\u3002",
    executeDisabledByModeExternal: "\u5916\u90e8\u6a21\u5f0f\u9ed8\u8ba4\u7981\u7528\u624b\u52a8 Execute\uff0c\u8bf7\u5728 capability pack \u4e2d\u663e\u5f0f\u5f00\u542f\u3002",
    executeDisabledByModePack: "\u5f53\u524d capability pack \u5df2\u7981\u7528\u624b\u52a8 Execute\u3002",
    templateBoundaryHint: "\u6a21\u677f\u7528\u4e8e\u5b9a\u4e49\u53ef\u6267\u884c\u52a8\u4f5c\u8fb9\u754c\uff0c\u4e0d\u4ee3\u8868\u53ef\u7ed5\u8fc7\u98ce\u63a7\u3002\u6bcf\u6b21\u6267\u884c\u4ecd\u4f1a\u88ab PolicyGuard \u6821\u9a8c\u3002",
    packInvalidPolicyHint: "\u80fd\u529b\u5305\u6821\u9a8c\u5931\u8d25\uff0c\u6839\u636e\u7b56\u7565 Autopilot \u5df2\u7981\u7528\u3002",
    actionBuilderHiddenInvalidPack: "\u80fd\u529b\u5305\u6821\u9a8c\u5931\u8d25\uff0c\u4ea4\u6613\u6784\u5efa\u5668\u5df2\u9690\u85cf\u3002",
    actionBuilderHiddenNoTemplates: "\u80fd\u529b\u5305\u672a\u58f0\u660e\u53ef\u7528\u6a21\u677f\u3002",
    actionScopeHint: "\u52a8\u4f5c\u6a21\u677f\u7528\u4e8e\u58f0\u660e\u5f53\u524d Agent \u7684\u53ef\u6267\u884c\u52a8\u4f5c/\u6743\u9650\u8fb9\u754c\uff0c\u5e76\u4e0d\u653e\u6743\u3002\u6240\u6709\u94fe\u4e0a\u6267\u884c\u4ecd\u4f1a\u88ab PolicyGuard \u4e8c\u6b21\u6821\u9a8c\u3002",
    sectionLabels: {
        control: "\u63a7\u5236",
        vault: "\u91d1\u5e93",
        history: "\u5386\u53f2",
    },
    autopilotErrors: {
        tokenNotAllowedByRunner: "Runner \u672a\u653e\u884c\u8be5 Agent\u3002\u8bf7\u5728 runner \u914d\u7f6e ALLOWED_TOKEN_IDS \u4e2d\u52a0\u5165\u5f53\u524d tokenId\u3002",
        insufficientGas: "Runner \u64cd\u4f5c\u5730\u5740 gas \u4e0d\u8db3\u3002\u8bf7\u7ed9 Runner Operator \u5730\u5740\u5145\u503c\u6d4b\u8bd5 BNB \u540e\u91cd\u8bd5\u3002",
        rpcTimeout: "RPC \u8bf7\u6c42\u8d85\u65f6\u3002\u8bf7\u5207\u6362\u5230\u66f4\u7a33\u5b9a\u7684 RPC \u8282\u70b9\u540e\u91cd\u8bd5\u3002",
        operatorMismatch: "Permit \u4e2d\u7684 operator \u4e0e Runner \u5b9e\u9645\u5730\u5740\u4e0d\u4e00\u81f4\uff0c\u8bf7\u4f7f\u7528 Runner \u5f53\u524d\u5730\u5740\u3002",
        chainIdMismatch: "\u94fe ID \u4e0d\u5339\u914d\uff0c\u8bf7\u786e\u8ba4\u524d\u7aef\u3001Runner\u3001\u94b1\u5305\u90fd\u5728\u540c\u4e00\u7f51\u7edc\u3002",
        unknownExpectedAddress: "\u672a\u77e5\u5730\u5740",
        nfaAddressMismatch: (expected: string, current: string) =>
            `AgentNFA \u5730\u5740\u4e0d\u5339\u914d\u3002Runner \u671f\u671b ${expected}\uff0c\u5f53\u524d\u9875\u9762\u4e3a ${current}\u3002`,
    },
    status: {
        title: "\u72b6\u6001\u6982\u89c8",
        leaseLabels: {
            NOT_RENTED: "\u672a\u79df\u7528",
            RENTED_ACTIVE: "\u79df\u671f\u751f\u6548\u4e2d",
            RENTED_EXPIRED: "\u79df\u671f\u5df2\u8fc7\u671f",
        },
        packLabels: {
            PACK_NONE: "\u672a\u914d\u7f6e\u80fd\u529b\u5305",
            PACK_LOADING: "\u80fd\u529b\u5305\u52a0\u8f7d\u4e2d",
            PACK_VALID: "\u80fd\u529b\u5305\u6709\u6548",
            PACK_INVALID: "\u80fd\u529b\u5305\u65e0\u6548",
        },
        modeLabels: {
            manual: "\u624b\u52a8",
            managed: "\u6258\u7ba1",
            external: "\u5916\u90e8",
        },
        token: "Token",
        leaseExpires: "\u79df\u671f\u5230\u671f",
        vaultUri: "Vault URI",
        vaultHash: "Vault Hash",
        maxDeadline: "\u6700\u5927\u622a\u6b62\u7a97\u53e3",
        maxPath: "\u6700\u5927\u8def\u5f84\u957f\u5ea6",
        allowedTokens: "\u5141\u8bb8 Token \u6570",
        allowedSpenders: "\u5141\u8bb8 Spender \u6570",
        safetyTags: {
            noPrivateKeys: "\u65e0\u79c1\u94a5\u66b4\u9732",
            noWithdrawByRunner: "Runner \u4e0d\u53ef\u63d0\u73b0",
            policyEnforced: "\u7b56\u7565\u5f3a\u7ea6\u675f",
        },
    },
    autopilot: {
        title: "Autopilot",
        nonce: "Nonce",
        onchainOperator: "\u94fe\u4e0a Operator",
        operatorExpires: "Operator \u8fc7\u671f\u65f6\u95f4",
        notSet: "\u672a\u8bbe\u7f6e",
        operatorAddress: "Operator \u5730\u5740",
        useDefaultRunner: "\u4f7f\u7528\u9ed8\u8ba4 Runner \u5730\u5740",
        operatorExpiresInput: "Operator \u8fc7\u671f\u65f6\u95f4",
        hint: "\u63d0\u793a\uff1aoperator \u5e94\u586b\u5199 Runner \u5730\u5740\uff0c\u8fc7\u671f\u65f6\u95f4\u4e0d\u8981\u8d85\u8fc7\u79df\u671f\u3002",
        enabling: "\u542f\u7528\u4e2d...",
        enable: "\u542f\u7528 Autopilot\uff08\u7b7e\u540d\uff09",
        disabling: "\u5173\u95ed\u4e2d...",
        disable: "\u5173\u95ed Autopilot",
        renterOnlyHint: "\u4ec5\u5f53\u524d\u79df\u6237\u53ef\u7b7e\u540d Operator Permit\u3002",
        runnerLoading: "Runner \u72b6\u6001\u52a0\u8f7d\u4e2d...",
        runnerOperator: "Runner Operator",
        runnerEnabled: "Runner \u5df2\u542f\u7528",
        runnerReason: "\u6700\u8fd1\u539f\u56e0",
        zeroBalanceHint: "Agent \u8d26\u6237\u4f59\u989d\u4e3a 0\uff0cAutopilot \u6682\u65e0\u6cd5\u6267\u884c\u3002\u8bf7\u5148\u5728 Vault \u9762\u677f\u5165\u91d1\u3002",
        modeManagedOnlyHint: "\u5f53\u524d\u6a21\u5f0f\u4e0d\u652f\u6301\u542f\u7528 Autopilot\u3002",
        blockedByPackHint: "\u80fd\u529b\u5305\u6821\u9a8c\u5931\u8d25\uff0c\u5df2\u963b\u6b62 Autopilot \u542f\u7528\u3002",
        runnerModeLabels: {
            manual: "\u624b\u52a8",
            managed: "\u6258\u7ba1",
            external: "\u5916\u90e8",
        },
        runtimeStateLabels: {
            AUTO_OFF: "\u672a\u542f\u7528",
            AUTO_ON: "\u8fd0\u884c\u4e2d",
            AUTO_ENABLING: "\u542f\u7528\u4e2d",
            AUTO_EXPIRED: "\u5df2\u8fc7\u671f",
        },
        enableStateLabels: {
            IDLE: "\u7a7a\u95f2",
            SIGNING: "\u7b7e\u540d\u4e2d",
            SUBMITTING: "\u63d0\u4ea4\u4e2d",
            ONCHAIN_PENDING: "\u94fe\u4e0a\u786e\u8ba4\u4e2d",
            ONCHAIN_CONFIRMED: "\u94fe\u4e0a\u5df2\u786e\u8ba4",
            ERROR: "\u9519\u8bef",
        },
        boolTrue: "\u662f",
        boolFalse: "\u5426",
        toast: {
            invalidOperatorAddress: "Operator \u5730\u5740\u683c\u5f0f\u65e0\u6548",
            selectOperatorExpiry: "\u8bf7\u9009\u62e9 Operator \u8fc7\u671f\u65f6\u95f4",
            expiryFutureRequired: "Operator \u8fc7\u671f\u65f6\u95f4\u5fc5\u987b\u665a\u4e8e\u5f53\u524d\u65f6\u95f4",
            enabledSuccess: "Autopilot \u5df2\u542f\u7528",
            enableFailed: "\u542f\u7528 Autopilot \u5931\u8d25",
            disabledSuccess: "Autopilot \u5df2\u5173\u95ed",
            disableFailed: "\u5173\u95ed Autopilot \u5931\u8d25",
            unknownError: "\u672a\u77e5\u9519\u8bef",
            txPrefix: "\u4ea4\u6613",
        },
    },
    history: {
        loading: "\u52a0\u8f7d\u4e2d...",
        sourceIndexer: "\u7d22\u5f15\u5668",
        sourceRunner: "Runner",
        degradedPrefix: "Activity \u964d\u7ea7:",
        degradedDefault: "Indexer \u4e0d\u53ef\u7528\uff0c\u5df2\u4f7f\u7528 runner \u56de\u9000\u6570\u636e\u6e90\u3002",
        txUnavailable: "\u6682\u65e0",
    },
    vault: {
        readOnlyHint: "\u53ea\u8bfb\u6a21\u5f0f\uff0c\u5df2\u7981\u7528\u5165\u91d1/\u63d0\u73b0\u64cd\u4f5c\u3002",
        safeModeHint: "\u5b89\u5168\u6a21\u5f0f\uff1a\u63d0\u73b0\u529f\u80fd\u5df2\u9690\u85cf\u3002",
        depositDialogTitle: "\u5411 Agent Vault \u5165\u91d1",
        depositDialogDesc: "\u5411 Agent \u9694\u79bb\u8d26\u6237\u8f6c\u5165\u8d44\u4ea7\u3002",
        accountLabel: "\u8d26\u6237",
        tokenLabel: "\u4ee3\u5e01",
        amountLabel: "\u6570\u91cf",
        selectToken: "\u9009\u62e9\u4ee3\u5e01",
        nativeTag: "\uff08\u539f\u751f\uff09",
        approveStep: "1. \u6388\u6743",
        depositStep: "2. \u5165\u91d1",
        depositNative: "\u5165\u91d1 BNB",
    },
    builder: {
        title: "\u52a8\u4f5c\u6784\u5efa\u5668",
        readOnlyFallback: "\u63a7\u5236\u53f0\u5f53\u524d\u5904\u4e8e\u53ea\u8bfb\u6a21\u5f0f\u3002",
        preflight: {
            issuesFound: (count: number) => `\u5df2\u53d1\u73b0 ${count} \u9879\u7b56\u7565\u9650\u5236`,
            blockedHint: "\u8bf7\u5148\u8c03\u6574\u6a21\u677f\u3001\u4ee3\u5e01\u6216\u53c2\u6570\uff0c\u518d\u8fdb\u884c\u6a21\u62df\u3002",
            simulateBlockedToast: "\u5f53\u524d\u53c2\u6570\u4e0d\u6ee1\u8db3\u7b56\u7565\u9650\u5236\uff0c\u8bf7\u5148\u6309\u63d0\u793a\u8c03\u6574\u3002",
            checking: "\u6b63\u5728\u68c0\u67e5\u7b56\u7565\u9650\u5236...",
        },
        policyHints: {
            targetNotAllowed: "\u5f53\u524d\u7b56\u7565\u4e0d\u652f\u6301\u8fd9\u4e2a\u76ee\u6807\uff0c\u8bf7\u6362\u4e00\u4e2a\u6a21\u677f\u6216\u4ea4\u6613\u5bf9\u3002",
            selectorNotAllowed: "\u5f53\u524d\u7b56\u7565\u4e0d\u652f\u6301\u8be5\u52a8\u4f5c\u7c7b\u578b\uff0c\u8bf7\u5c1d\u8bd5\u5176\u4ed6\u64cd\u4f5c\u3002",
            tokenNotAllowed: "\u5f53\u524d\u7b56\u7565\u4e0d\u5141\u8bb8\u8be5\u4ee3\u5e01\u7ec4\u5408\uff0c\u8bf7\u66f4\u6362\u4ee3\u5e01\u3002",
            spenderNotAllowed: "\u5f53\u524d\u7b56\u7565\u4e0d\u652f\u6301\u8be5\u6388\u6743\u8def\u5f84\uff0c\u8bf7\u66f4\u6362\u64cd\u4f5c\u540e\u91cd\u8bd5\u3002",
            policyViolation: "\u5f53\u524d\u7b56\u7565\u6821\u9a8c\u672a\u901a\u8fc7\uff0c\u8bf7\u8c03\u6574\u53c2\u6570\u540e\u91cd\u8bd5\u3002",
            amountOutMinZero: "\u6ed1\u70b9\u4fdd\u62a4\u89e6\u53d1\uff1a\u6700\u5c0f\u8f93\u51fa\u4e0d\u80fd\u4e3a 0\u3002",
            slippageExceeds: "\u6ed1\u70b9\u8d85\u8fc7\u7b56\u7565\u9650\u5236\uff0c\u8bf7\u8c03\u6574\u4ea4\u6613\u53c2\u6570\u3002",
            quoteUnavailable: "\u6682\u65f6\u65e0\u6cd5\u83b7\u53d6\u62a5\u4ef7\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u6216\u66f4\u6362\u4ea4\u6613\u5bf9\u3002",
        },
    },
};

export function getConsoleCopy(language: string): ConsoleCopy {
    if (language !== "zh") {
        return enCopy;
    }

    return {
        ...enCopy,
        ...zhOverrides,
        status: {
            ...enCopy.status,
            ...(zhOverrides.status || {}),
        },
        autopilot: {
            ...enCopy.autopilot,
            ...(zhOverrides.autopilot || {}),
        },
        history: {
            ...enCopy.history,
            ...(zhOverrides.history || {}),
        },
        vault: {
            ...enCopy.vault,
            ...(zhOverrides.vault || {}),
        },
        builder: {
            ...enCopy.builder,
            ...(zhOverrides.builder || {}),
        },
    };
}
