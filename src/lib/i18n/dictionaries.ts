export type Dictionary = typeof en;

export const en = {
    common: {
        nav: {
            market: "Market",
            me: "Me",
            docs: "Docs",
        },
        footer: "© 2026 SHLL Protocol. Decentralized AI Agent Rental on BNB Chain.",
        connectWallet: "Connect Wallet",
        testnet: "Testnet Beta",
        language: "Language",
        switchChain: "Switch Chain",
    },
    marketplace: {
        title: "Marketplace",
        subtitle: "Rent autonomous AI agents safely secured by on-chain policies.",
        noAgents: "No agents available for rent.",
        wrongChain: "Agents are deployed on BSC Testnet. Please switch your wallet network to view and rent agents.",
    },
    agent: {
        card: {
            rented: "Rented",
            rentNow: "Rent Now",
            viewDetails: "View Details",
            minDays: "min {days}d",
            day: "/ day",
            swapPack: "Swap Pack",
            repayPack: "Repay Pack",
        },
        detail: {
            tabs: {
                overview: "Overview",
                history: "History & Records",
                rent: "Rent / Extend",
                console: "Console",
            },
            status: {
                active: "Active",
                inactive: "Inactive",
                minLease: "Min Lease: {days} days",
                policyActive: "Policy Active",
                owner: "Owner",
            },
            notFound: "Agent not found.",
            loading: "Loading...",
        },
        rent: {
            title: "Rent Agent",
            minLease: "Minimum lease period is {days} days",
            duration: "Duration (Days)",
            totalCost: "Total Cost",
            connect: "Connect Wallet to Rent",
            approve: "Approve {token}",
            confirm: "Confirm Rental",
        },
        vault: {
            title: "Vault Balance",
            desc: "Assets held by the Agent Account.",
            deposit: "Deposit",
            withdraw: "Withdraw",
            assets: {
                native: "Native",
                erc20: "ERC20",
                noAssets: "No assets found.",
            },
            dialog: {
                title: "Withdraw Assets",
                desc: "Transfer funds from the Agent Account to your wallet.",
                assetLabel: "Asset",
                amountLabel: "Amount",
                toLabel: "To",
                confirm: "Confirm Withdraw",
                select: "Select asset",
            }
        },
        console: {
            title: "Agent Console",
            desc: "Execute trades and manage your agent.",
            view: "{role} View - Access the terminal to control this agent.",
            open: "Open Console",
            page: {
                title: "Agent Console",
                subtitle: "Interact with external protocols via your agent.",
                agentId: "Agent ID",
                unknown: "Unknown Account",
                connectWallet: "Please connect your wallet to access the console.",
                noAccess: "You must be the owner or active renter of this agent to use the console.",
            },
            builder: {
                title: "Transaction Builder",
                subtitle: "Construct a raw transaction using templates or manually.",
                account: "Agent Account",
                tabs: {
                    swap: "Swap",
                    repay: "Repay",
                    raw: "Raw"
                },
                manual: "Manual input mode active. Edit fields below directly.",
                preview: "Preview Transaction",
                valid: "Valid",
                invalid: "Invalid",
                target: "Target Address",
                value: "Value (Wei)",
                data: "Calldata (Hex)",
                simulate: "Simulate Call",
                execute: "Execute On-Chain",
                simulation: {
                    success: "Simulation Success",
                    reverted: "Simulation Reverted",
                    return: "Return"
                }
            },
            templates: {
                swap: {
                    tokenIn: "Token In",
                    tokenOut: "Token Out",
                    amountIn: "Amount In",
                    slippage: "Slippage Tolerance",
                    generate: "Generate Swap Action"
                },
                repay: {
                    amount: "Repay Amount (USDT)",
                    borrower: "Repaying loan for borrower: {address}",
                    generate: "Generate Repay Action"
                }
            },
            history: {
                title: "Transaction History",
                empty: "No transactions executed yet.",
                block: "Block #"
            }
        },
        policy: {
            title: "Policy Guard Rules",
            swap: "Swap Limits",
            maxAmountIn: "Max Amount In",
            maxPathLength: "Max Path Length",
            hops: "hops",
            time: "Time Constraints",
            deadline: "Deadline Window",
            spend: "Spend Limits",
            maxApprove: "Max Approve",
            maxRepay: "Max Repay",
            whitelist: "Whitelisted Tokens",
            unlimited: "Unlimited",
        }
    },
    docs: {
        title: "Documentation & Guides",
        subtitle: "Learn how to use SHLL and understand its core architecture.",
        tabs: {
            guide: "User Guide",
            architecture: "Litepaper (v1.1)"
        },
        guide: {
            intro: "Welcome to SHLL. This guide will walk you through the process of renting and managing an autonomous AI Agent.",
            steps: [
                {
                    title: "1. Connect & Fund",
                    desc: "Connect your wallet (Rabbit, MetaMask, etc.) to **BNB Testnet**. You will need tBNB for gas and Testnet USDT for trading strategies.",
                    action: "Get BNB Faucet",
                    url: "https://www.bnbchain.org/en/testnet-faucet"
                },
                {
                    title: "2. Browse & Rent",
                    desc: "Explore the **Marketplace** to find an Agent that fits your trading style. Pay the daily rental fee to mint the usage rights (UserOf).",
                    action: "Go to Market",
                    url: "/"
                },
                {
                    title: "3. Agent Console",
                    desc: "Once rented, go to the **Console** tab in the Agent Detail page. This is your command center to execute trades via the Agent.",
                    action: "View My Agents",
                    url: "/me"
                },
                {
                    title: "4. Manage Assets",
                    desc: "Agents have their own **Vault**. You can deposit more funds for larger trades, or withdraw your profits at any time.",
                    action: "Learn about PolicyGuard",
                    url: "#architecture"
                }
            ]
        },
        thread: [
            {
                id: 1,
                title: "Introduction",
                content: [
                    "🚀 Introducing **SHLL**: The Decentralized Rental Protocol for Autonomous AI Agents.",
                    "We're building the infrastructure where AI Agents become economic actors. Rent intelligence, execute on-chain, and earn yield — all secured by code, not trust.",
                    "A deep dive into our core architecture. 🧵👇"
                ]
            },
            {
                id: 2,
                title: "The Problem",
                content: [
                    "🤔 **How do you trust an AI with your money?**",
                    "- If you give a private key to an AI, it can drain your wallet.",
                    "- If you run an AI for others, how do they know you won't rug them?",
                    "> We need a system where an Agent can **execute** transactions but **cannot** steal funds.",
                    "Enter the SHLL 4-Contract Architecture."
                ]
            },
            {
                id: 3,
                title: "Core Architecture",
                content: [
                    "🏛️ SHLL uses four specialized contracts working in unison:",
                    "1️⃣ **AgentNFA**\nThe Brain & Identity",
                    "2️⃣ **AgentAccount**\nThe Vault",
                    "3️⃣ **PolicyGuard**\nThe Sheriff",
                    "4️⃣ **ListingManager**\nThe Market"
                ]
            },
            {
                id: 4,
                title: "AgentNFA",
                content: [
                    "🧠 **The Brain & Identity**",
                    "`ERC-721 + ERC-4907 + BAP-578`",
                    "This is the Agent's on-chain identity. It's an NFT, but smarter.",
                    "- Unlocks the 'rental' capability (ERC-4907)",
                    "- Holds the Agent's reputation & metadata",
                    "- Routes all execution requests",
                    "You rent the NFA to control the Agent."
                ]
            },
            {
                id: 5,
                title: "AgentAccount",
                content: [
                    "💰 **The Vault**",
                    "Every AgentNFA deploys its own **isolated smart contract wallet**.",
                    "- Holds the funds (BNB, USDT, etc.)",
                    "- ONLY accepts execution commands from its specific NFA",
                    "- Renter never touches the private key; they just send instructions",
                    "✅ Funds are SAFU in the contract, not an EOA."
                ]
            },
            {
                id: 6,
                title: "PolicyGuard",
                content: [
                    "🛡️ **The Sheriff**",
                    "The most critical component. Before *any* transaction is executed, the AgentNFA forces a check with PolicyGuard.",
                    "✅ Is this DeFi interaction allowed? (Whitelist)",
                    "✅ Is the slippage safe?",
                    "✅ **Is the fund destination the AgentAccount itself?** (Anti-Rug)",
                    "If `validate()` returns false, the transaction REVERTS."
                ]
            },
            {
                id: 7,
                title: "ListingManager",
                content: [
                    "🏪 **The Market**",
                    "The trustless marketplace for renting intelligence.",
                    "- Owners stake their NFAs to list them",
                    "- Renters pay fees to acquire control rights (UserOf)",
                    "- Handles anti-rerent protection (Grace Period) to protect active strategies"
                ]
            },
            {
                id: 8,
                title: "Execution Flow",
                content: [
                    "🔄 **Safety by Design**",
                    "When a Renter wants the Agent to Arbitrage:",
                    "1. Renter calls `AgentNFA.execute(swapAction)`",
                    "2. NFA checks: 'Is this the current Renter?' ✅",
                    "3. NFA calls `PolicyGuard.validate(swapAction)` 🛡️",
                    "4. Guard checks: 'Is the output going back to the Vault?' ✅",
                    "5. NFA calls `AgentAccount.executeCall()` ⚡",
                    "6. Vault performs the Swap on PancakeSwap",
                    "7. Profit returns to the Vault"
                ]
            },
            {
                id: 9,
                title: "Security Invariants",
                content: [
                    "🔐 **Code is Law**",
                    "**No Bypass**: AgentAccount only listens to AgentNFA. AgentNFA always checks PolicyGuard.",
                    "**No Extraction**: Renters cannot transfer assets to their own wallet (Anti-Rug).",
                    "**Isolation**: One Agent hack does not affect others."
                ]
            },
            {
                id: 10,
                title: "The Vision",
                content: [
                    "🌐 **A New Economy**",
                    "🖥️ **Compute Providers**: Monetize GPUs & Models",
                    "📈 **Strategists**: Monetize Alpha without coding bots",
                    "🤖 **AI Agents**: Verify track record on-chain",
                    "> 'Rent a Hedge Fund Manager for 1 hour.'"
                ]
            },
            {
                id: 11,
                title: "Live on Testnet",
                content: [
                    "🧪 **Try it now**",
                    "The protocol is deployed and live on BSC Testnet.",
                    "Launch App"
                ]
            }
        ]
    }
};

export const zh: Dictionary = {
    common: {
        nav: {
            market: "市场",
            me: "我的",
            docs: "文档",
        },
        footer: "© 2026 SHLL 协议. BSC 链上去中心化 AI Agent 租赁.",
        connectWallet: "连接钱包",
        testnet: "测试网 Beta",
        language: "语言",
        switchChain: "切换网络",
    },
    marketplace: {
        title: "市场",
        subtitle: "租赁由链上策略保护的自主 AI Agent。",
        noAgents: "暂无可租赁的 Agent。",
        wrongChain: "Agent 部署在 BSC Testnet 上，请将钱包切换到 BSC Testnet 网络以查看和租赁 Agent。",
    },
    agent: {
        card: {
            rented: "已租出",
            rentNow: "立即租赁",
            viewDetails: "查看详情",
            minDays: "最少 {days} 天",
            day: "/ 天",
            swapPack: "交易包",
            repayPack: "还款包",
        },
        detail: {
            tabs: {
                overview: "概览",
                history: "历史记录",
                rent: "租赁 / 续租",
                console: "控制台",
            },
            status: {
                active: "活跃",
                inactive: "非活跃",
                minLease: "最少租期: {days} 天",
                policyActive: "风控运行中",
                owner: "所有者",
            },
            notFound: "未找到 Agent。",
            loading: "加载中...",
        },
        rent: {
            title: "租赁 Agent",
            minLease: "最少租赁期限为 {days} 天",
            duration: "租期 (天)",
            totalCost: "总费用",
            connect: "连接钱包以租赁",
            approve: "授权 {token}",
            confirm: "确认租赁",
        },
        vault: {
            title: "金库余额",
            desc: "Agent 账户持有的资产。",
            deposit: "充值",
            withdraw: "提取",
            assets: {
                native: "原生代币",
                erc20: "ERC20",
                noAssets: "未发现资产。",
            },
            dialog: {
                title: "提取资产",
                desc: "将资金从 Agent 账户提取到您的钱包。",
                assetLabel: "资产",
                amountLabel: "数量",
                toLabel: "接收地址",
                confirm: "确认提取",
                select: "选择资产",
            }
        },
        console: {
            title: "Agent 控制台",
            desc: "执行交易并管理您的 Agent。",
            view: "{role} 视图 -不仅可以查看，还可以控制此 Agent。",
            open: "打开控制台",
            page: {
                title: "Agent 控制台",
                subtitle: "通过你的 Agent 与外部协议进行交互。",
                agentId: "Agent ID",
                unknown: "未知账户",
                connectWallet: "请连接钱包以访问控制台。",
                noAccess: "您必须是此 Agent 的所有者或当前租户才能使用控制台。",
            },
            builder: {
                title: "交易构建器",
                subtitle: "使用模板或手动构建原始交易。",
                account: "Agent 账户",
                tabs: {
                    swap: "兑换 (Swap)",
                    repay: "还款 (Repay)",
                    raw: "原始 (Raw)"
                },
                manual: "手动输入模式已激活。请直接编辑下方字段。",
                preview: "交易预览",
                valid: "有效",
                invalid: "无效",
                target: "目标地址",
                value: "金额 (Wei)",
                data: "调用数据 (Hex)",
                simulate: "模拟调用",
                execute: "链上执行",
                simulation: {
                    success: "模拟成功",
                    reverted: "模拟回滚",
                    return: "返回结果"
                }
            },
            templates: {
                swap: {
                    tokenIn: "支付代币",
                    tokenOut: "获得代币",
                    amountIn: "支付数量",
                    slippage: "滑点容忍度",
                    generate: "生成兑换动作"
                },
                repay: {
                    amount: "还款数量 (USDT)",
                    borrower: "正在为借款人还款: {address}",
                    generate: "生成还款动作"
                }
            },
            history: {
                title: "交易历史",
                empty: "暂无执行记录。",
                block: "区块 #"
            }
        },
        policy: {
            title: "风控卫士规则",
            swap: "交易限制",
            maxAmountIn: "最大输入金额",
            maxPathLength: "最大路径长度",
            hops: "跳",
            time: "时间限制",
            deadline: "交易截止时间窗口",
            spend: "支出限制",
            maxApprove: "最大授权",
            maxRepay: "最大还款",
            whitelist: "代币白名单",
            unlimited: "无限制",
        }
    },
    docs: {
        title: "文档与指南",
        subtitle: "学习如何使用 SHLL 并深入了解其核心架构。",
        tabs: {
            guide: "新手指南",
            architecture: "白皮书 (v1.1)"
        },
        guide: {
            intro: "欢迎来到 SHLL。本指南将带您了解租赁和管理自主 AI Agent 的全过程。",
            steps: [
                {
                    title: "1. 连接与资金",
                    desc: "将您的钱包 (Rabbit, MetaMask 等) 连接到 **BNB Testnet**。您需要 tBNB 作为 Gas 费，以及测试网 USDT 用于交易策略。",
                    action: "领取 BNB 水龙头",
                    url: "https://www.bnbchain.org/en/testnet-faucet"
                },
                {
                    title: "2. 浏览与租赁",
                    desc: "在 **市场** 中寻找适合您交易风格的 Agent。支付每日租金以铸造使用权 (UserOf)。",
                    action: "前往市场",
                    url: "/"
                },
                {
                    title: "3. Agent 控制台",
                    desc: "租赁成功后，进入 Agent 详情页的 **控制台 (Console)** 标签。这是您通过 Agent 执行交易的指挥中心。",
                    action: "查看我的 Agent",
                    url: "/me"
                },
                {
                    title: "4. 资产管理",
                    desc: "每个 Agent 都有独立的 **金库 (Vault)**。您可以存入更多资金以进行大额交易，或随时提取您的利润。",
                    action: "了解风控卫士",
                    url: "#architecture"
                }
            ]
        },
        thread: [
            {
                id: 1,
                title: "简介 (Introduction)",
                content: [
                    "🚀 隆重介绍 **SHLL**: 去中心化 AI Agent 租赁协议。",
                    "我们要构建让 AI Agent 成为真正经济主体的基础设施。租赁智能、链上执行、赚取收益 —— 所有这些都由代码保障，无需信任。",
                    "从核心架构为你深度解析。 🧵👇"
                ]
            },
            {
                id: 2,
                title: "核心问题 (The Problem)",
                content: [
                    "🤔 **你敢把钱交给 AI 吗？**",
                    "- 如果你把私钥给 AI，它可能卷走资产。",
                    "- 如果你帮别人跑 AI，他们怎么知道你不会 Rug 掉资金？",
                    "> 我们需要一个系统，让 Agent 能够 **执行** 交易，但 **无法** 窃取资金。",
                    "这就是 SHLL 四合约架构。"
                ]
            },
            {
                id: 3,
                title: "核心架构 (Core Architecture)",
                content: [
                    "🏛️ SHLL 使用四个协同工作的专用合约：",
                    "1️⃣ **AgentNFA**\n大脑与身份",
                    "2️⃣ **AgentAccount**\n隔离金库",
                    "3️⃣ **PolicyGuard**\n风控卫士",
                    "4️⃣ **ListingManager**\n交易市场"
                ]
            },
            {
                id: 4,
                title: "AgentNFA",
                content: [
                    "🧠 **大脑与身份**",
                    "`ERC-721 + ERC-4907 + BAP-578`",
                    "这是 Agent 的链上身份。它是 NFT，但更智能。",
                    "- 解锁 '租赁' 能力 (ERC-4907)",
                    "- 持有 Agent 的声誉和元数据",
                    "- 路由所有的执行请求",
                    "你通过租赁 NFA 来控制 Agent。"
                ]
            },
            {
                id: 5,
                title: "AgentAccount",
                content: [
                    "💰 **隔离金库**",
                    "每个 AgentNFA 都会部署一个属于自己的 **隔离智能合约钱包**。",
                    "- 持有资金 (BNB, USDT 等)",
                    "- 仅接受来自其绑定 NFA 的执行指令",
                    "- 租赁者 (Renter) 永远接触不到私钥；他们只发送指令",
                    "✅ 资金躺在合约里，SAFU。"
                ]
            },
            {
                id: 6,
                title: "PolicyGuard",
                content: [
                    "🛡️ **风控卫士**",
                    "最关键的组件。在执行 *任何* 交易之前，AgentNFA 都会强制经过 PolicyGuard 检查。",
                    "✅ 这是允许的 DeFi 交互吗？(白名单)",
                    "✅ 滑点是否安全 / 路径是否合规？",
                    "✅ **资金是否回流到了 AgentAccount 本身？** (防 Rug)",
                    "如果 `validate()` 返回 false，交易直接 REVERT。"
                ]
            },
            {
                id: 7,
                title: "ListingManager",
                content: [
                    "🏪 **交易市场**",
                    "租赁智能的去信任化市场。",
                    "- Owner 质押 NFA 进行上架",
                    "- Renter 支付租金获取控制权 (UserOf)",
                    "- 处理防抢租保护 (Grace Period)，保护正在运行的策略"
                ]
            },
            {
                id: 8,
                title: "执行流程 (Execution Flow)",
                content: [
                    "🔄 **设计即安全**",
                    "当 Renter 想要让 Agent 进行套利时：",
                    "1. Renter 调用 `AgentNFA.execute(swapAction)`",
                    "2. NFA 检查：'这是当前的 Renter 吗？' ✅",
                    "3. NFA 调用 `PolicyGuard.validate(swapAction)` 🛡️",
                    "4. Guard 检查：'产出是否回到金库？' ✅",
                    "5. NFA 调用 `AgentAccount.executeCall()` ⚡",
                    "6. 金库在 PancakeSwap 执行 Swap",
                    "7. 利润回流金库"
                ]
            },
            {
                id: 9,
                title: "安全不变量 (Invariants)",
                content: [
                    "🔐 **代码即法律**",
                    "**不可绕过**: AgentAccount 只听 NFA 的。NFA 永远检查 PolicyGuard。",
                    "**不可提款**: Renter 可以执行复杂逻辑，但不能把资产转到自己钱包 (除非提取利润)。",
                    "**完全隔离**: 一个 Agent 被黑不会影响其他 Agent。"
                ]
            },
            {
                id: 10,
                title: "愿景 (The Vision)",
                content: [
                    "🌐 **开启新经济**",
                    "🖥️ **算力提供者**: 变现他们的 GPU / AI 模型",
                    "📈 **策略师**: 变现 Alpha，而无需写机器人代码",
                    "🤖 **AI Agents**: 在链上验证自己的历史战绩",
                    "> '租借对冲基金经理一小时。'"
                ]
            },
            {
                id: 11,
                title: "测试网已上线 (Live now)",
                content: [
                    "🧪 **立即体验**",
                    "SHLL 协议已部署在 BSC Testnet 并开放运行。",
                    "Launch App"
                ]
            }
        ]
    }
};
