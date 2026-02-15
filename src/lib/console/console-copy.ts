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
    templateBoundaryHint: string;
    packInvalidPolicyHint: string;
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

export function getConsoleCopy(language: string): ConsoleCopy {
    if (language === "zh") {
        return {
            errorLoadAgent: "加载 Agent 链上数据失败。",
            goAgentDetail: "返回 Agent 详情",
            openDocs: "打开文档",
            nextStepTitle: "下一步建议",
            nextStepConnect: "先连接钱包，再重新进入控制台。",
            nextStepRent: "请先在 Agent 详情页完成租用/续租，再返回控制台。",
            nextStepPathConnect: "/me -> 连接钱包 -> 返回控制台",
            nextStepPathRentPrefix: "路径: ",
            agentDetail: "Agent 详情",
            currentRole: "当前角色",
            roleLabels: {
                owner: "所有者",
                renter: "当前租户",
                guest: "无权限",
            },
            roleHintOwner: "你可以查看记录和关闭 Autopilot，但只有当前租户可以签名开启。",
            roleHintRenter: "你可以模拟、执行，并通过签名开启 Autopilot。",
            roleHintGuest: "请切换到所有者/租户钱包，或先完成租用。",
            readOnlyMessage: "当前为只读模式。仅当前租户且租期有效时可执行模拟/交易。",
            executeDisabledByAutopilot: "Autopilot 已开启：当前仅允许 Simulate，手动 Execute 已禁用。",
            templateBoundaryHint: "模板用于定义可执行动作边界，不代表可绕过风控。每次执行都仍会被 PolicyGuard 校验。",
            packInvalidPolicyHint: "能力包哈希校验失败。根据 PRD 规则，Autopilot 已禁用。",
            status: {
                title: "状态概览",
                leaseLabels: {
                    NOT_RENTED: "未租赁",
                    RENTED_ACTIVE: "租赁生效中",
                    RENTED_EXPIRED: "租赁已过期",
                },
                packLabels: {
                    PACK_NONE: "未配置能力包",
                    PACK_LOADING: "能力包加载中",
                    PACK_VALID: "能力包有效",
                    PACK_INVALID: "能力包无效",
                },
                modeLabels: {
                    manual: "手动",
                    managed: "托管",
                    external: "外部",
                },
                token: "Token",
                leaseExpires: "租约到期",
                vaultUri: "Vault URI",
                vaultHash: "Vault Hash",
                maxDeadline: "最大截止窗口",
                maxPath: "最大路径长度",
                allowedTokens: "允许 Token 数",
                allowedSpenders: "允许 Spender 数",
                safetyTags: {
                    noPrivateKeys: "无私钥暴露",
                    noWithdrawByRunner: "Runner 不可提现",
                    policyEnforced: "策略强约束",
                },
            },
            autopilot: {
                title: "Autopilot",
                nonce: "Nonce",
                onchainOperator: "链上 Operator",
                operatorExpires: "Operator 过期时间",
                notSet: "未设置",
                operatorAddress: "Operator 地址",
                useDefaultRunner: "使用默认 Runner 地址",
                operatorExpiresInput: "Operator 过期时间",
                hint: "提示: operator 应填写 Runner 地址，过期时间不要超过租期。",
                enabling: "启用中...",
                enable: "启用 Autopilot (签名)",
                disabling: "关闭中...",
                disable: "关闭 Autopilot",
                renterOnlyHint: "仅当前租户可签名 Operator Permit。",
                runnerLoading: "Runner 状态加载中...",
                runnerOperator: "Runner Operator",
                runnerEnabled: "Runner 已启用",
                runnerReason: "最近原因",
                zeroBalanceHint: "Agent 账户余额为 0，Autopilot 暂无法执行。请先在本页金库面板完成入金。",
                modeManagedOnlyHint: "当前模式不支持启用 Autopilot。",
                blockedByPackHint: "能力包校验失败，已阻止托管启用。",
                runnerModeLabels: {
                    manual: "手动",
                    managed: "托管",
                    external: "外部",
                },
                runtimeStateLabels: {
                    AUTO_OFF: "未启用",
                    AUTO_ON: "运行中",
                    AUTO_ENABLING: "启用中",
                    AUTO_EXPIRED: "已过期",
                },
                enableStateLabels: {
                    IDLE: "空闲",
                    SIGNING: "签名中",
                    SUBMITTING: "提交中",
                    ONCHAIN_PENDING: "链上确认中",
                    ONCHAIN_CONFIRMED: "链上已确认",
                    ERROR: "错误",
                },
                boolTrue: "是",
                boolFalse: "否",
                toast: {
                    invalidOperatorAddress: "Operator 地址格式无效",
                    selectOperatorExpiry: "请选择 Operator 过期时间",
                    expiryFutureRequired: "Operator 过期时间必须晚于当前时间",
                    enabledSuccess: "Autopilot 已启用",
                    enableFailed: "启用 Autopilot 失败",
                    disabledSuccess: "Autopilot 已关闭",
                    disableFailed: "关闭 Autopilot 失败",
                    unknownError: "未知错误",
                    txPrefix: "交易",
                },
            },
            history: {
                loading: "加载中...",
                sourceIndexer: "索引器",
                sourceRunner: "Runner",
                degradedPrefix: "Activity 降级:",
                degradedDefault: "Indexer 不可用，已使用 runner 回退源。",
                txUnavailable: "暂无",
            },
            vault: {
                readOnlyHint: "当前为只读模式，暂不支持入金/提现。",
                safeModeHint: "安全模式：已隐藏提现功能。",
                depositDialogTitle: "向 Agent Vault 入金",
                depositDialogDesc: "向 Agent 隔离账户转入资产。",
                accountLabel: "账户",
                tokenLabel: "代币",
                amountLabel: "数量",
                selectToken: "选择代币",
                nativeTag: "(原生)",
                approveStep: "1. 授权",
                depositStep: "2. 入金",
                depositNative: "入金 BNB",
            },
        };
    }

    return {
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
        templateBoundaryHint: "Templates define executable action boundaries only. Every execution is still enforced by PolicyGuard.",
        packInvalidPolicyHint: "Capability pack hash validation failed. Autopilot is disabled by policy.",
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
    };
}
