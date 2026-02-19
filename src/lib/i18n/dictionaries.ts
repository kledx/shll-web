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
        native: "Native",
    },
    home: {
        hero: {
            title: "Rent Autonomous AI Agents",
            subtitle: "The first decentralized marketplace for renting and executing policy-guarded AI agents on BSC.",
            cta: "Explore Marketplace",
            secondaryCta: "Read Docs",
        },
        stats: {
            activeAgents: "Active Agents",
            totalExecutions: "Total Executions",
            successRate: "Success Rate",
            totalValue: "TVL",
        },
        featured: {
            title: "Featured Agents",
            subtitle: "Top performing agents available for immediate rent.",
        },
        why: {
            title: "Why SHLL?",
            subtitle: "Built for trustless automation.",
            items: [
                { title: "Non-Custodial", desc: "Your funds stay in your agent's vault. No private key sharing." },
                { title: "Policy Guarded", desc: "On-chain policies enforce execution limits and allowlists." },
                { title: "Verifiable", desc: "All actions and logical branches are verifiable on-chain." }
            ]
        }
    },
    marketplace: {
        title: "Marketplace",
        subtitle: "Rent autonomous AI agents safely secured by on-chain policies.",
        noAgents: "No agents available for rent.",
        noResults: "No agents match your search.",
        wrongChain: "Agents are deployed on BSC Testnet. Please switch your wallet network to view and rent agents.",
        searchPlaceholder: "Search by name, ID or owner...",
        filterAll: "All",
        filterAvailable: "Available",
        filterRented: "Rented",
        sort: {
            label: "Sort by",
            newest: "Newest",
            oldest: "Oldest",
            priceAsc: "Price: Low to High",
            priceDesc: "Price: High to Low",
        },
        filters: {
            title: "Filters",
            status: "Status",
            price: "Price Range",
            capabilities: "Capabilities",
            clear: "Clear All",
        }
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
            template: "Multi-tenant Agent",
            mintInstance: "Rent Agent",
        },
        detail: {
            tabs: {
                overview: "Overview",
                history: "History & Records",
                rent: "Rent / Extend",
                console: "Console",
                faq: "FAQ",
            },
            status: {
                active: "Active",
                inactive: "Inactive",
                minLease: "Min Lease: {days} days",
                notListed: "Not Listed",
                policyActive: "Policy Active",
                owner: "Owner",
            },
            notFound: "Agent not found.",
            loading: "Loading...",
            risk: {
                title: "Risk Analysis",
                allowlist: "Allowlist Only",
                allowlistDesc: "Interactions restricted to verified contracts.",
                spendLimit: "Spend Limit",
                spendLimitDesc: "Max spend per transaction is capped.",
                nonCustodial: "Non-Custodial",
                nonCustodialDesc: "Assets held in agent vault, not by runner.",
                trustScore: "Trust Score",
                viewPolicy: "View Policy",
            },
        },
        rent: {
            title: "Rent Agent",
            minLease: "Minimum lease period is {days} days",
            duration: "Duration (Days)",
            totalCost: "Total Cost",
            connect: "Connect Wallet to Rent",
            approve: "Approve {token}",
            confirm: "Confirm Rental",
            toasts: {
                walletNotConnected: "Wallet not connected",
                rentToMintSubmitted: "Rent-to-Mint transaction submitted",
                rentToMintFailed: "Rent-to-Mint transaction failed",
                rentToMintSimulationFailed: "Rent-to-Mint simulation failed",
                instanceMintedSuccess: "Instance minted! You are now the owner & renter.",
                insufficientBalanceTitle: "Insufficient BNB balance",
                insufficientBalancePrecheck:
                    "Rent requires at least {rentBnb} BNB, plus gas. Current balance: {balanceBnb} BNB.",
                insufficientBalanceSimulation:
                    "This rent needs {rentBnb} BNB for value, plus gas. Please fund your testnet BNB balance and try again.",
            },
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
                    generate: "Generate Swap Action",
                    insufficientBalance: "Insufficient {token} Balance",
                    stepApprove: "Step 1: Approve {token}",
                    approveNotice: "You must approve the Router to spend your {token} before swapping.",
                    txNotice: "This is transaction 1 of 2. After approval confirms, click again to Swap.",
                    bnbNotice: "Uses swapExactETHForTokens — swaps native BNB from the vault directly.",
                    unsupportedPair: "Unsupported pair: input and output resolve to the same underlying token."
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
    dashboard: {
        page: {
            title: "My Dashboard",
            subtitle: "Manage your owned agents and rent-to-mint assets.",
        },
        tabs: {
            owned: "My Agents",
            instances: "Rented Agents",
            active: "Active Rentals",
            history: "Instance History",
        },
        empty: {
            owned: "You don't own any agents yet.",
            instances: "You don't have any rented agents yet.",
            active: "No active rentals found.",
            history: "No expired instances found.",
        },
        card: {
            agentLabel: "Agent",
            ownerBadge: "OWNER",
            statusExpired: "Expired",
            statusActive: "Active",
            ownThisAgent: "You own this agent",
            expiredOn: "Expired on {date}",
            expiresIn: "Expires in {days} days",
            deposit: "Deposit",
            manage: "Manage",
            depositDialog: {
                title: "Deposit to Agent #{tokenId}",
                desc: "Send tokens to the Agent's vault.",
                account: "Account",
                token: "Token",
                selectToken: "Select token",
                amount: "Amount",
                approve: "1. Approve",
                depositStep: "2. Deposit",
                depositNative: "Deposit {symbol}",
                nativeTag: "(Native)",
            },
        },
    },
    docs: {
        title: "Docs & Onboarding",
        subtitle: "Start fast, understand runtime boundaries, and operate safely.",
        tabs: {
            quickstart: "Quick Start",
            runtime: "Runtime",
            security: "Security",
            faq: "FAQ"
        },
        quickstart: {
            intro: "New to SHLL? Follow this path once and you can run an AI agent safely end-to-end with on-chain policy enforcement.",
            prerequisitesTitle: "Before you start",
            prerequisites: [
                "Use BSC Testnet and keep some tBNB for gas.",
                "Prepare test assets used by your strategy (for example test USDT).",
                "Use the same wallet address for renting and console operations."
            ],
            steps: [
                {
                    title: "1. Connect wallet and switch chain",
                    desc: "Connect wallet from the top-right button, then switch to BSC Testnet if prompted.",
                    action: "Go to Marketplace",
                    url: "/market"
                },
                {
                    title: "2. Rent-to-Mint an agent",
                    desc: "Pick an agent template from the marketplace and rent it. SHLL mints a new on-chain instance — you own the NFT, the AI operates within your policy guardrails.",
                    action: "Open My Dashboard",
                    url: "/me"
                },
                {
                    title: "3. Configure and launch from Console",
                    desc: "Open the agent Console from My Dashboard. Configure your safety limits (they cannot exceed the template ceiling), deposit funds into the vault, and enable autopilot.",
                    action: "Open My Dashboard",
                    url: "/me"
                },
                {
                    title: "4. Monitor with full transparency",
                    desc: "Watch the AI reasoning log in real time. Every decision, every trade, every policy check is recorded on-chain and displayed in the Console history.",
                    action: "Read Security Model",
                    url: "#security"
                }
            ],
            pathsTitle: "Recommended paths",
            paths: [
                "Marketplace: /market — browse and rent agent templates",
                "My Dashboard: /me — manage owned and rented agents",
                "Agent Detail: /agent/{nfa}/{tokenId} — overview, vault, history",
                "Agent Console: /agent/{nfa}/{tokenId}/console — configure, execute, monitor"
            ]
        },
        runtime: {
            intro: "SHLL separates identity, policy, execution, and automation into distinct layers with explicit boundaries.",
            actorsTitle: "Who does what",
            actors: [
                {
                    name: "Owner / Creator",
                    responsibility: "Mints agent templates, defines policy ceilings and capability packs, lists on marketplace, and receives rent.",
                    boundary: "Cannot execute renter session actions unless owner is also the active renter."
                },
                {
                    name: "Renter",
                    responsibility: "Rents an agent via Rent-to-Mint, configures safety limits within ceilings, deposits funds, and controls autopilot.",
                    boundary: "Cannot bypass policy checks, exceed ceilings, or extract vault assets to arbitrary addresses."
                },
                {
                    name: "Runner (AI Agent)",
                    responsibility: "Off-chain service that autonomously monitors markets, reasons with LLM, and submits execution requests via tool calling.",
                    boundary: "Runs with operator keys but is fully constrained by on-chain PolicyGuard — even if compromised, cannot bypass policy."
                }
            ],
            conceptsTitle: "Core concepts",
            concepts: [
                {
                    name: "Autonomous AI Agent",
                    desc: "Every SHLL agent is an autonomous AI — it observes markets, reasons about your strategy, and acts via tool calling. All decisions are self-directed within policy guardrails.",
                    detail: "The AI brain receives market context, vault state, and your instructions, then independently decides what action to take and when."
                },
                {
                    name: "Composable Policy",
                    desc: "PolicyGuardV4 is a router that delegates validation to specialized policy contracts like DefiGuardPolicy.",
                    detail: "Each policy contract enforces a specific domain (DeFi, NFT, etc.) with its own validation rules. New domains can be added without modifying the core."
                },
                {
                    name: "Ceiling vs User Config",
                    desc: "Template owners set hard ceilings. Renters configure their own limits that cannot exceed those ceilings.",
                    detail: "This two-layer design ensures renters are always within safe bounds set by the creator, even if they misconfigure."
                }
            ],
            actionFieldsTitle: "How LLM agents make decisions",
            actionFields: [
                "LLM agent receives market data, vault balance, and strategy instructions as context.",
                "It reasons through the situation and selects a tool (swap, wait, wrap, done).",
                "The selected tool builds the on-chain action payload automatically.",
                "Simulation runs before submission — if it would fail, the action is not sent.",
                "PolicyGuard validates the action on-chain even after simulation passes."
            ],
            mappingTitle: "Adaptive Scheduler",
            mapping: [
                "1) Each agent token has its own check interval, dynamically suggested by the LLM.",
                "2) Single-use tasks (e.g. 'buy 100 USDT of WBNB') complete and auto-disable autopilot.",
                "3) Monitoring tasks (e.g. 'buy when price drops 5%') set longer intervals between checks.",
                "4) The scheduler respects a minimum interval (minIntervalMs) as a safeguard.",
                "5) Agent status is displayed in the Console: 'Task completed', 'Next check in Xm', etc."
            ],
            flowTitle: "Execution lifecycle",
            flow: [
                "1) Scheduler triggers the agent brain for a specific tokenId.",
                "2) LLM agent receives market context, vault state, and strategy instructions.",
                "3) LLM reasons and calls a tool (e.g. swap) with specific parameters.",
                "4) Runner builds Action{target, value, data} from the tool call.",
                "5) Simulation runs off-chain — if it reverts, execution stops and logs the reason.",
                "6) AgentNFA verifies caller role and lease validity.",
                "7) PolicyGuardV4 routes to DefiGuardPolicy for five-layer validation.",
                "8) AgentAccount executes the call only when all policies pass.",
                "9) Result is indexed for Console history, AI reasoning log, and diagnostics."
            ],
            multiTenantTitle: "Single runner, multiple agents",
            multiTenant: [
                "One runner instance can manage many agents by ALLOWED_TOKEN_IDS filtering.",
                "Per-token execution state is isolated in storage (locks, health, strategy, interval).",
                "Each agent's AI brain is resolved per token — execution logic and strategy context are fully isolated.",
                "This reduces deployment count while keeping on-chain fund isolation unchanged."
            ],
            failureTitle: "Troubleshooting",
            failures: [
                "Check wallet role: current wallet must match active renter for the token.",
                "Check operator authorization on-chain for your operator address.",
                "Check runner health endpoint and AI reasoning log for error details.",
                "Check vault balance: ensure sufficient funds for the intended trade.",
                "Check policy configuration: your limits may be blocking the action."
            ]
        },
        security: {
            intro: "SHLL is an AI Agent Security Protocol — the AI decides what to do, PolicyGuard decides whether it is allowed, the smart contract executes or reverts.",
            promise: "SHLL does not promise profit. We promise clear permissions, isolated funds, controllable execution, and auditable behavior. Trust is replaced by cryptographic enforcement.",
            diagramsTitle: "Security visual overview",
            diagramsDesc: "Two diagrams summarize the non-bypassable execution path and the layered isolation design.",
            executionDiagramTitle: "Execution flow diagram",
            executionDiagramAlt: "SHLL security execution flow diagram",
            architectureDiagramTitle: "Layered architecture diagram",
            architectureDiagramAlt: "SHLL layered security architecture diagram",
            problemsTitle: "What security problems SHLL solves",
            problems: [
                "Private-key custody risk: users should not hand over EOA private keys to bots or platforms.",
                "Unconstrained execution: AI agents must not have unrestricted arbitrary contract call capability.",
                "Opaque decision-making: users need to see what the AI decided, why, and whether policy approved or rejected it."
            ],
            actorsTitle: "Participants and permission boundaries",
            actors: [
                "Owner: mints agent template, sets policy ceilings and capability packs, receives rent revenue.",
                "Renter: rents via Rent-to-Mint, configures limits within ceilings, owns the instance NFT during lease.",
                "PolicyGuard: on-chain firewall that validates every action against five security layers.",
                "Runner/Operator: automation trigger with AI reasoning, not a privileged fund custodian."
            ],
            architectureTitle: "PolicyGuardV4 — Five security layers",
            architecture: [
                {
                    title: "1) Spending Limits",
                    points: [
                        "Maximum amount per single transaction.",
                        "Maximum cumulative amount per day (24h rolling window).",
                        "Maximum slippage tolerance enforced at the contract level."
                    ]
                },
                {
                    title: "2) Token Whitelist",
                    points: [
                        "Agent can only trade pre-approved tokens.",
                        "No rug pull tokens, no random memecoins.",
                        "Both input and output tokens must be on the whitelist."
                    ]
                },
                {
                    title: "3) DEX Whitelist",
                    points: [
                        "Trades are restricted to approved DEX routers only.",
                        "No interaction with malicious or unverified contracts.",
                        "Function selectors are also validated per router."
                    ]
                },
                {
                    title: "4) Cooldown",
                    points: [
                        "Minimum time enforced between consecutive actions.",
                        "Prevents rapid-fire trading during flash crashes or exploits.",
                        "Configurable per template by the owner."
                    ]
                },
                {
                    title: "5) Receiver Guard",
                    points: [
                        "Swap output and fund transfers can only go to the agent's own vault.",
                        "The agent cannot drain funds to an unknown wallet.",
                        "Withdraw destination is restricted to the renter's own address."
                    ]
                }
            ],
            bapTitle: "Contract architecture layers",
            bap: [
                "AgentNFA: ERC-721 + ERC-4907 identity layer — manages ownership, rental rights, and lifecycle controls (pause/terminate).",
                "AgentAccount: isolated vault per tokenId — accepts execution only from bound AgentNFA, one agent one vault.",
                "PolicyGuardV4: composable policy router — delegates to domain-specific policies like DefiGuardPolicy.",
                "ListingManager: marketplace layer — handles listing, Rent-to-Mint, extension, and ERC-4907 userOf assignment."
            ],
            invariantTitle: "Non-bypassable invariant",
            invariant: "All execution must follow: AgentNFA → PolicyGuardV4.validate → DefiGuardPolicy.check → AgentAccount.executeCall. No shortcut exists.",
            executionTitle: "Execution path (with AI reasoning)",
            execution: [
                "1) LLM agent receives market data and reasons about the next action.",
                "2) AI calls a tool (e.g. swap) — the tool builds Action{target, value, data}.",
                "3) Runner simulates the action off-chain to catch policy violations early.",
                "4) Execute calls AgentNFA.execute(tokenId, action) on-chain.",
                "5) PolicyGuardV4 routes to DefiGuardPolicy — checks all five layers.",
                "6) If all checks pass, AgentAccount.executeCall runs the DeFi interaction."
            ],
            allowlistTitle: "Ceiling vs User Config (two-layer limits)",
            allowlist: [
                "Template ceiling: hard limits set by the agent creator, cannot be exceeded by anyone.",
                "User config: renter's own limits, must be ≤ ceiling values.",
                "If user sets maxAmountPerTx = 50 USDT but ceiling is 100 USDT, the effective limit is 50 USDT.",
                "If user tries to set a limit above the ceiling, the system rejects the configuration."
            ],
            constraintsTitle: "What each layer checks",
            constraints: [
                "Spending Limits: per-tx amount ≤ maxAmountPerTx, daily total ≤ maxAmountPerDay, slippage ≤ maxSlippage.",
                "Token Whitelist: both tokenIn and tokenOut must be in the approved token list.",
                "DEX Whitelist: target router must be approved, function selector must be allowed for that router.",
                "Cooldown: block.timestamp - lastActionTime must be ≥ cooldownSeconds.",
                "Receiver Guard: swap recipient / transfer destination must equal the agent vault address."
            ],
            runnerTitle: "Why the AI agent is not a custody risk",
            runner: [
                "The AI decides what to trade — PolicyGuard decides whether it is allowed.",
                "Even if the AI is compromised or hallucinating, on-chain policies cannot be bypassed.",
                "All five policy layers are enforced at the smart contract level, not in the AI or backend.",
                "Every AI decision is logged in the reasoning log for full auditability."
            ],
            comparisonTitle: "Security comparison with typical platforms",
            comparisonColumns: {
                dimension: "Dimension",
                baseline: "Typical agent platform",
                shll: "SHLL"
            },
            comparison: [
                {
                    dimension: "Fund custody",
                    baseline: "Private key handover or bot-controlled hot wallet.",
                    shll: "No private key handover, isolated per-agent vault."
                },
                {
                    dimension: "Execution privilege",
                    baseline: "Often arbitrary contract call capability.",
                    shll: "Five-layer on-chain firewall validates every action."
                },
                {
                    dimension: "AI transparency",
                    baseline: "Black box — hard to inspect what the bot will do.",
                    shll: "Full AI reasoning log with intent, analysis, and outcome."
                },
                {
                    dimension: "Blast radius",
                    baseline: "Shared wallet or pooled exposure.",
                    shll: "One tokenId, one vault — complete fund isolation."
                },
                {
                    dimension: "Rate limiting",
                    baseline: "No limit on trade frequency.",
                    shll: "On-chain cooldown prevents rapid-fire trading."
                },
                {
                    dimension: "Permission revoke",
                    baseline: "Hard to revoke safely.",
                    shll: "Lease expiry via ERC-4907 plus pause/terminate controls."
                }
            ],
            defendTitle: "What SHLL defends against",
            defend: [
                "AI agent attempting to drain vault to third-party addresses (Receiver Guard).",
                "Excessive single-trade or daily spending (Spending Limits).",
                "Trading rug-pull or unauthorized tokens (Token Whitelist).",
                "Interaction with malicious smart contracts (DEX Whitelist).",
                "Rapid-fire trading during market crashes (Cooldown).",
                "Compromised runner sending out-of-policy actions (all five layers)."
            ],
            limitsTitle: "Known assumptions and external risk surfaces",
            limits: [
                "Whitelist quality depends on operator governance and review discipline.",
                "Whitelisted external protocols still carry their own protocol-level risk.",
                "Market/MEV/slippage risk is bounded by policy but not eliminable.",
                "AI reasoning quality depends on the underlying LLM model capability."
            ],
            userGuideTitle: "User safety guide",
            userGuide: [
                "Review the five policy layers before renting — understand what the agent can and cannot do.",
                "Configure your own safety limits within the template ceiling.",
                "Only deposit capital you are willing to risk in the agent vault.",
                "Monitor the AI reasoning log regularly for unexpected behavior.",
                "Use pause or terminate immediately if you see abnormal activity."
            ],
            developerGuideTitle: "Developer: adding new policy domains",
            developerGuide: [
                "Create a new policy contract implementing the IPolicy interface.",
                "Register the policy with PolicyGuardV4 via the composable router.",
                "Define domain-specific validation rules (e.g. NFT policies, lending policies).",
                "Write tests for both valid and adversarial parameters.",
                "Deploy and register via admin dashboard or Foundry scripts."
            ],
            warningTitle: "Security reminder",
            warning: "Authorizing an operator allows action submission, not policy bypass. All five security layers are enforced at the smart contract level — not in the AI, not in the backend."
        },
        faq: {
            title: "Frequently Asked Questions",
            items: [
                {
                    q: "Do I need to hand my private keys to SHLL?",
                    a: "No. You sign with your own wallet. SHLL mints an isolated agent instance for you — your main wallet is never exposed to the AI."
                },
                {
                    q: "Can the AI agent steal funds from my vault?",
                    a: "No. Every action the AI takes is validated by five on-chain policy layers (PolicyGuardV4). Even if the AI is compromised, it cannot bypass smart contract enforcement."
                },
                {
                    q: "What is Rent-to-Mint?",
                    a: "When you rent an agent, SHLL mints a new on-chain instance (NFA). You own the NFT, the AI operates it, but all actions are constrained by PolicyGuard. The agent gets its own isolated vault."
                },
                {
                    q: "What is the difference between ceiling and user config?",
                    a: "The template creator sets hard ceilings (maximum limits). As a renter, you configure your own limits that cannot exceed those ceilings. This ensures you are always within safe bounds."
                },
                {
                    q: "How does the LLM agent make trading decisions?",
                    a: "The LLM agent receives market data, vault balance, and your strategy instructions. It reasons through the situation and calls tools (swap, wait, done) to execute. Every decision is logged in the AI reasoning log."
                },
                {
                    q: "What is Cooldown and why does it matter?",
                    a: "Cooldown enforces a minimum time between consecutive actions at the contract level. This prevents the AI from rapid-fire trading during flash crashes or exploits."
                },
                {
                    q: "How do I pause or stop my agent?",
                    a: "You can disable autopilot from the Console at any time. You can also use the pause or terminate controls to immediately halt all agent execution on-chain."
                },
                {
                    q: "What happens when my rental expires?",
                    a: "When the lease ends, the ERC-4907 userOf right expires automatically. The agent can no longer execute actions on your behalf. You can withdraw remaining vault funds at any time."
                }
            ]
        },
        cta: {
            title: "Ready to run your first AI agent safely?",
            desc: "Start from Marketplace, rent an agent via Rent-to-Mint, configure your safety limits, and let the AI trade within your policy guardrails.",
            primaryAction: "Open Marketplace",
            primaryUrl: "/market",
            secondaryAction: "Open My Dashboard",
            secondaryUrl: "/me"
        },
        social: {
            title: "Community & GitHub",
            subtitle: "Follow project updates and source code repositories.",
            links: [
                {
                    label: "GitHub Profile",
                    url: "https://github.com/kledx"
                },
                {
                    label: "Web App Repo",
                    url: "https://github.com/kledx/shll-web"
                },
                {
                    label: "Contracts Repo",
                    url: "https://github.com/kledx/shll-docs"
                },
                {
                    label: "Indexer Repo",
                    url: "https://github.com/kledx/shll-indexer"
                }
            ]
        }
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
        native: "原生",
    },
    home: {
        hero: {
            title: "租赁自主 AI Agent",
            subtitle: "BSC 链上首个去中心化 AI Agent 租赁与执行市场，由链上策略守护。",
            cta: "探索市场",
            secondaryCta: "阅读文档",
        },
        stats: {
            activeAgents: "活跃 Agent",
            totalExecutions: "总执行次数",
            successRate: "执行成功率",
            totalValue: "总锁定价值",
        },
        featured: {
            title: "精选 Agent",
            subtitle: "表现最佳的 Agent，即刻可租。",
        },
        why: {
            title: "为什么选择 SHLL？",
            subtitle: "专为去中心化自动化而生。",
            items: [
                { title: "非托管", desc: "资金保留在 Agent 金库中，无需共享私钥。" },
                { title: "策略守护", desc: "链上策略强制执行风控限制与白名单。" },
                { title: "可验证", desc: "所有操作与逻辑分支均链上可查。" }
            ]
        }
    },
    marketplace: {
        title: "市场",
        subtitle: "租赁由链上策略保护的自主 AI Agent。",
        noAgents: "暂无可租赁的 Agent。",
        noResults: "没有匹配的 Agent。",
        wrongChain: "Agent 部署在 BSC Testnet 上，请将钱包切换到 BSC Testnet 网络以查看和租赁 Agent。",
        searchPlaceholder: "按名称、ID 或所有者搜索...",
        filterAll: "全部",
        filterAvailable: "可租赁",
        filterRented: "已租出",
        sort: {
            label: "排序",
            newest: "最新上架",
            oldest: "最早上架",
            priceAsc: "价格: 低到高",
            priceDesc: "价格: 高到低",
        },
        filters: {
            title: "筛选",
            status: "状态",
            price: "价格范围",
            capabilities: "能力",
            clear: "清除全部",
        }
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
            template: "\u591a\u79df\u6237Agent",
            mintInstance: "\u79df\u7528Agent",
        },
        detail: {
            tabs: {
                overview: "概览",
                history: "历史记录",
                rent: "租赁 / 续租",
                console: "控制台",
                faq: "常见问题",
            },
            status: {
                active: "活跃",
                inactive: "非活跃",
                minLease: "最少租期: {days} 天",
                notListed: "未上架",
                policyActive: "风控运行中",
                owner: "所有者",
            },
            notFound: "未找到 Agent。",
            loading: "加载中...",
            risk: {
                title: "风险分析",
                allowlist: "仅白名单",
                allowlistDesc: "交互仅限于已验证的合约地址。",
                spendLimit: "支出限额",
                spendLimitDesc: "单笔交易最大支出受限。",
                nonCustodial: "非托管",
                nonCustodialDesc: "资产由 Agent 金库持有，非 Runner 托管。",
                trustScore: "信任评分",
                viewPolicy: "查看策略",
            },
        },
        rent: {
            title: "租赁 Agent",
            minLease: "最少租赁期限为 {days} 天",
            duration: "租期 (天)",
            totalCost: "总费用",
            connect: "连接钱包以租赁",
            approve: "授权 {token}",
            confirm: "确认租赁",
            toasts: {
                walletNotConnected: "钱包未连接",
                rentToMintSubmitted: "租用铸造交易已提交",
                rentToMintFailed: "租用铸造交易失败",
                rentToMintSimulationFailed: "租用铸造模拟失败",
                instanceMintedSuccess: "实例铸造成功，你现在是该实例的所有者与租户。",
                insufficientBalanceTitle: "BNB 余额不足",
                insufficientBalancePrecheck:
                    "租金至少需要 {rentBnb} BNB，且还需预留 Gas。当前余额 {balanceBnb} BNB。",
                insufficientBalanceSimulation:
                    "本次租赁需要支付 {rentBnb} BNB 租金，并额外支付 Gas。请先充值测试网 BNB 后重试。",
            },
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
                    generate: "生成兑换动作",
                    insufficientBalance: "{token} 余额不足",
                    stepApprove: "第 1 步：授权 {token}",
                    approveNotice: "在兑换之前，您必须授权路由合约使用您的 {token}。",
                    txNotice: "这是 2 个交易中的第 1 个。授权确认后，再次点击即可兑换。",
                    bnbNotice: "使用 swapExactETHForTokens — 直接从金库中兑换原生 BNB。",
                    unsupportedPair: "不支持该交易对：输入与输出映射到同一底层资产。"
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
    dashboard: {
        page: {
            title: "\u6211\u7684\u63a7\u5236\u53f0",
            subtitle: "\u7ba1\u7406\u4f60\u62e5\u6709\u7684 Agent \u4e0e\u300c\u79df\u7528\u540e\u94f8\u9020\u300d\u8d44\u4ea7\u3002",
        },
        tabs: {
            owned: "\u6211\u7684 Agent",
            instances: "\u79df\u7528Agent",
            active: "\u5f53\u524d\u79df\u7528",
            history: "\u5b9e\u4f8b\u5386\u53f2",
        },
        empty: {
            owned: "\u4f60\u8fd8\u6ca1\u6709\u62e5\u6709\u4efb\u4f55 Agent\u3002",
            instances: "\u4f60\u8fd8\u6ca1\u6709\u4efb\u4f55\u79df\u7528Agent\u3002",
            active: "\u6682\u65e0\u8fdb\u884c\u4e2d\u7684\u79df\u7528\u3002",
            history: "\u6682\u65e0\u5df2\u8fc7\u671f\u7684\u5b9e\u4f8b\u8bb0\u5f55\u3002",
        },
        card: {
            agentLabel: "Agent",
            ownerBadge: "\u6240\u6709\u8005",
            statusExpired: "\u5df2\u8fc7\u671f",
            statusActive: "\u8fdb\u884c\u4e2d",
            ownThisAgent: "\u4f60\u62e5\u6709\u8fd9\u4e2a Agent",
            expiredOn: "\u5df2\u4e8e {date} \u5230\u671f",
            expiresIn: "\u8fd8\u6709 {days} \u5929\u5230\u671f",
            deposit: "\u5b58\u5165",
            manage: "\u7ba1\u7406",
            depositDialog: {
                title: "\u5411 Agent #{tokenId} \u5b58\u5165",
                desc: "\u5411 Agent \u91d1\u5e93\u8f6c\u5165\u8d44\u4ea7\u3002",
                account: "\u8d26\u6237",
                token: "\u4ee3\u5e01",
                selectToken: "\u9009\u62e9\u4ee3\u5e01",
                amount: "\u6570\u91cf",
                approve: "1. \u6388\u6743",
                depositStep: "2. \u5b58\u5165",
                depositNative: "\u5b58\u5165 {symbol}",
                nativeTag: "\uff08\u539f\u751f\uff09",
            },
        },
    },
    docs: {
        title: "文档与新手指南",
        subtitle: "先跑通，再理解运行机制，最后按安全规范稳定运营。",
        tabs: {
            quickstart: "新手上手",
            runtime: "运行机制",
            security: "安全模型",
            faq: "常见问题"
        },
        quickstart: {
            intro: "第一次使用 SHLL？按下面路径走一遍，即可完成从租赁到链上策略托管的完整闭环。",
            prerequisitesTitle: "开始前准备",
            prerequisites: [
                "钱包切到 BSC Testnet，并准备少量 tBNB 作为 gas。",
                "准备策略需要的测试资产（例如测试 USDT）。",
                "租赁和控制台操作尽量使用同一个钱包地址。"
            ],
            steps: [
                {
                    title: "1. 连接钱包并切链",
                    desc: "点击右上角连接钱包，按提示切换到 BSC Testnet。",
                    action: "前往市场",
                    url: "/market"
                },
                {
                    title: "2. Rent-to-Mint 铸造 Agent",
                    desc: "从市场选择 Agent 模板并租用。SHLL 会铸造一个新的链上实例 — 你拥有 NFT，AI 在你的策略护栏内运行。",
                    action: "打开我的页面",
                    url: "/me"
                },
                {
                    title: "3. 在控制台配置并启动",
                    desc: "从我的页面打开 Agent 控制台。配置你的安全限额（不能超过模板上限），向 Vault 充值，并启用自动驾驶。",
                    action: "打开我的页面",
                    url: "/me"
                },
                {
                    title: "4. 全程透明监控",
                    desc: "实时查看 AI 推理日志。每一个决策、每一笔交易、每一次策略检查都会记录在链上，并在控制台历史中展示。",
                    action: "查看安全模型",
                    url: "#security"
                }
            ],
            pathsTitle: "常用路径",
            paths: [
                "市场首页: /market — 浏览和租用 Agent 模板",
                "我的页面: /me — 管理拥有和租用的 Agent",
                "Agent 详情: /agent/{nfa}/{tokenId} — 概览、Vault、历史",
                "Agent 控制台: /agent/{nfa}/{tokenId}/console — 配置、执行、监控"
            ]
        },
        runtime: {
            intro: "SHLL 将身份、策略、执行和自动化分为不同层级，每层都有明确边界。",
            actorsTitle: "角色与职责",
            actors: [
                {
                    name: "Owner / 创建者",
                    responsibility: "铸造 Agent 模板，定义策略上限和能力包，上架到市场并收取租金。",
                    boundary: "除非 Owner 同时是当前租户，否则不能执行租户会话动作。"
                },
                {
                    name: "Renter / 租户",
                    responsibility: "通过 Rent-to-Mint 租用 Agent，在上限内配置安全限额，充值并控制自动驾驶。",
                    boundary: "不能绕过策略检查、超过上限或将 Vault 资产转到任意地址。"
                },
                {
                    name: "Runner（AI Agent）",
                    responsibility: "链下服务，自主监控市场、通过 LLM 推理、并通过工具调用提交执行请求。",
                    boundary: "即使持有 operator key，仍完全受链上 PolicyGuard 约束 — 即使被入侵也无法绕过。"
                }
            ],
            conceptsTitle: "核心概念",
            concepts: [
                {
                    name: "自主 AI Agent",
                    desc: "每个 SHLL Agent 都是自主 AI — 它观察市场、推理你的策略、并通过工具调用执行。所有决策在策略护栏内自主完成。",
                    detail: "AI brain 接收市场上下文、Vault 状态和你的指令，然后独立决定采取什么行动以及何时行动。"
                },
                {
                    name: "可组合策略",
                    desc: "PolicyGuardV4 是路由器，将验证委托给专门的策略合约（如 DefiGuardPolicy）。",
                    detail: "每个策略合约负责一个特定领域（DeFi、NFT 等），有自己的验证规则。新领域可以无需修改核心即可添加。"
                },
                {
                    name: "上限 vs 用户配置",
                    desc: "模板 Owner 设置硬性上限。租户配置自己的限额，不能超过上限。",
                    detail: "这种双层设计确保租户始终在创建者设定的安全范围内，即使配置有误也不会突破上限。"
                }
            ],
            actionFieldsTitle: "LLM Agent 如何做决策",
            actionFields: [
                "LLM Agent 接收市场数据、Vault 余额和策略指令作为上下文。",
                "它分析当前情况并选择工具（swap、wait、wrap、done）。",
                "选定的工具自动构建链上 Action payload。",
                "提交前先执行模拟 — 如果模拟失败则不发送。",
                "即使模拟通过，PolicyGuard 仍会在链上再次验证。"
            ],
            mappingTitle: "自适应调度器",
            mapping: [
                "1) 每个 Agent token 有独立的检查间隔，由 LLM 动态建议。",
                "2) 一次性任务（如 '用 100 USDT 买 WBNB'）完成后自动关闭自动驾驶。",
                "3) 监控型任务（如 '价格下跌 5% 时买入'）设置更长的检查间隔。",
                "4) 调度器遵守最小间隔（minIntervalMs）作为安全保障。",
                "5) Agent 状态在控制台显示：'任务已完成'、'下次检查在 Xm 后' 等。"
            ],
            flowTitle: "执行生命周期",
            flow: [
                "1) 调度器触发特定 tokenId 的 Agent brain。",
                "2) LLM Agent 接收市场上下文、Vault 状态和策略指令。",
                "3) LLM 进行推理并调用工具（如 swap）及其参数。",
                "4) Runner 从工具调用构建 Action{target, value, data}。",
                "5) 链下模拟执行 — 如果 revert 则停止并记录原因。",
                "6) AgentNFA 校验调用者角色和租期有效性。",
                "7) PolicyGuardV4 路由到 DefiGuardPolicy 进行五层验证。",
                "8) 所有策略通过后 AgentAccount 才执行调用。",
                "9) 结果写入索引，供控制台历史、AI 推理日志和诊断使用。"
            ],
            multiTenantTitle: "单 Runner 管理多个 Agent",
            multiTenant: [
                "一个 Runner 实例可通过 ALLOWED_TOKEN_IDS 管理多个 Agent。",
                "每个 token 的执行状态独立存储（锁、健康、策略、间隔）。",
                "每个 Agent 的 AI brain 按 token 解析 — 执行逻辑和策略上下文完全隔离。",
                "这减少了部署数量，同时保持链上资金隔离不变。"
            ],
            failureTitle: "故障排查",
            failures: [
                "检查钱包角色：当前钱包是否为该 token 的 active renter。",
                "检查链上授权：operator 地址是否已完成授权。",
                "检查 Runner 健康状态和 AI 推理日志中的错误详情。",
                "检查 Vault 余额：确保有足够资金执行预期交易。",
                "检查策略配置：你的限额可能阻止了该操作。"
            ]
        },
        security: {
            intro: "SHLL 是 AI Agent 安全协议 — AI 决定做什么，PolicyGuard 决定是否允许，智能合约执行或回退。",
            promise: "SHLL 不承诺收益。我们承诺：权限清晰、资金隔离、执行可控、行为可审计。用密码学执行替代信任。",
            diagramsTitle: "安全图解总览",
            diagramsDesc: "通过两张图快速理解不可绕过的执行路径与分层隔离架构。",
            executionDiagramTitle: "执行链路图",
            executionDiagramAlt: "SHLL 安全执行链路图",
            architectureDiagramTitle: "分层架构图",
            architectureDiagramAlt: "SHLL 分层安全架构图",
            problemsTitle: "SHLL 解决的安全问题",
            problems: [
                "私钥托管风险：用户不应把 EOA 私钥交给机器人或平台。",
                "无约束执行：AI Agent 不应具备无限制的任意合约调用能力。",
                "不透明决策：用户需要能看到 AI 的决策内容、原因，以及策略是通过还是拒绝。"
            ],
            actorsTitle: "核心参与者与权限边界",
            actors: [
                "Owner：铸造 Agent 模板，设置策略上限和能力包，收取租金收入。",
                "Renter：通过 Rent-to-Mint 租用，在上限内配置限额，租期内拥有实例 NFT。",
                "PolicyGuard：链上防火墙，针对五个安全层验证每一个动作。",
                "Runner/Operator：带 AI 推理的自动化触发器，不是资金托管方。"
            ],
            architectureTitle: "PolicyGuardV4 — 五层安全模型",
            architecture: [
                {
                    title: "1) 消费限额（Spending Limits）",
                    points: [
                        "单笔交易最大金额限制。",
                        "每日累计最大金额限制（24 小时滚动窗口）。",
                        "合约级别强制执行的最大滑点容忍度。"
                    ]
                },
                {
                    title: "2) 代币白名单（Token Whitelist）",
                    points: [
                        "Agent 只能交易预先批准的代币。",
                        "杜绝 rug pull 代币和随机 memecoin。",
                        "输入和输出代币都必须在白名单中。"
                    ]
                },
                {
                    title: "3) DEX 白名单（DEX Whitelist）",
                    points: [
                        "交易仅限于已批准的 DEX 路由器。",
                        "不与恶意或未验证的合约交互。",
                        "每个路由器的函数选择器也需验证。"
                    ]
                },
                {
                    title: "4) 冷却时间（Cooldown）",
                    points: [
                        "连续操作之间强制最少等待时间。",
                        "防止闪崩或漏洞利用期间的高频交易。",
                        "由 Owner 按模板可配置。"
                    ]
                },
                {
                    title: "5) 接收方守卫（Receiver Guard）",
                    points: [
                        "Swap 输出和资金转账只能发送到 Agent 自己的 Vault。",
                        "Agent 无法将资金转移到未知钱包。",
                        "提现目的地限制为租户自己的地址。"
                    ]
                }
            ],
            bapTitle: "合约架构层级",
            bap: [
                "AgentNFA：ERC-721 + ERC-4907 身份层 — 管理所有权、租赁权和生命周期控制（暂停/终止）。",
                "AgentAccount：按 tokenId 隔离的 Vault — 仅接受绑定 AgentNFA 的执行，一 Agent 一 Vault。",
                "PolicyGuardV4：可组合策略路由器 — 委托给领域专用策略（如 DefiGuardPolicy）。",
                "ListingManager：市场层 — 管理上架、Rent-to-Mint、续租和 ERC-4907 userOf 分配。"
            ],
            invariantTitle: "不可绕过的不变量",
            invariant: "所有执行必须经过：AgentNFA → PolicyGuardV4.validate → DefiGuardPolicy.check → AgentAccount.executeCall。没有捷径。",
            executionTitle: "执行链路（含 AI 推理）",
            execution: [
                "1) LLM Agent 接收市场数据并推理下一步动作。",
                "2) AI 调用工具（如 swap）— 工具自动构建 Action{target, value, data}。",
                "3) Runner 在链下模拟以提前捕获策略违规。",
                "4) Execute 调用 AgentNFA.execute(tokenId, action) 上链。",
                "5) PolicyGuardV4 路由到 DefiGuardPolicy — 检查所有五层。",
                "6) 所有检查通过后，AgentAccount.executeCall 执行 DeFi 交互。"
            ],
            allowlistTitle: "上限 vs 用户配置（双层限额）",
            allowlist: [
                "模板上限：由 Agent 创建者设定的硬性限制，任何人都不能超过。",
                "用户配置：租户自己的限额，必须 ≤ 上限值。",
                "如果用户设置 maxAmountPerTx = 50 USDT 而上限是 100 USDT，有效限额为 50 USDT。",
                "如果用户尝试设置超过上限的限额，系统会拒绝该配置。"
            ],
            constraintsTitle: "各层检查内容",
            constraints: [
                "消费限额：单笔金额 ≤ maxAmountPerTx，日累计 ≤ maxAmountPerDay，滑点 ≤ maxSlippage。",
                "代币白名单：tokenIn 和 tokenOut 都必须在批准列表中。",
                "DEX 白名单：目标路由器必须已批准，函数选择器必须对该路由器有效。",
                "冷却时间：block.timestamp - lastActionTime 必须 ≥ cooldownSeconds。",
                "接收方守卫：swap 接收方 / 转账目的地必须等于 Agent Vault 地址。"
            ],
            runnerTitle: "为什么 AI Agent 不是托管风险",
            runner: [
                "AI 决定交易什么 — PolicyGuard 决定是否允许。",
                "即使 AI 被入侵或产生幻觉，链上策略也无法被绕过。",
                "所有五层策略都在智能合约级别强制执行，不在 AI 或后端。",
                "每个 AI 决策都记录在推理日志中，完全可审计。"
            ],
            comparisonTitle: "与常见 Agent 平台的安全对比",
            comparisonColumns: {
                dimension: "维度",
                baseline: "常见平台做法",
                shll: "SHLL"
            },
            comparison: [
                {
                    dimension: "资金托管",
                    baseline: "交私钥或把资金转到 bot 热钱包。",
                    shll: "无需交私钥，按 Agent 独立 Vault 隔离。"
                },
                {
                    dimension: "执行权限",
                    baseline: "常见为任意合约调用能力。",
                    shll: "五层链上防火墙验证每一个动作。"
                },
                {
                    dimension: "AI 透明度",
                    baseline: "黑箱 — 难以检查机器人将做什么。",
                    shll: "完整 AI 推理日志，包含意图、分析和结果。"
                },
                {
                    dimension: "风险隔离",
                    baseline: "常见共用钱包或资金池。",
                    shll: "一 tokenId 一 Vault — 完全资金隔离。"
                },
                {
                    dimension: "频率限制",
                    baseline: "交易频率无限制。",
                    shll: "链上冷却时间防止高频交易。"
                },
                {
                    dimension: "权限撤销",
                    baseline: "撤销成本高且不彻底。",
                    shll: "ERC-4907 到期自动失效 + 暂停/终止控制。"
                }
            ],
            defendTitle: "SHLL 防御的攻击向量",
            defend: [
                "AI Agent 试图将 Vault 资产转移到第三方地址（接收方守卫）。",
                "单笔或每日过度消费（消费限额）。",
                "交易 rug pull 或未授权代币（代币白名单）。",
                "与恶意智能合约交互（DEX 白名单）。",
                "市场崩盘期间的高频交易（冷却时间）。",
                "被入侵的 Runner 发送超出策略的动作（五层全检）。"
            ],
            limitsTitle: "已知前提与外部风险面",
            limits: [
                "白名单质量依赖运营治理与审核流程。",
                "被允许的外部协议仍有其自身协议风险。",
                "市场/MEV/滑点风险可被策略约束但无法完全消除。",
                "AI 推理质量取决于底层 LLM 模型的能力。"
            ],
            userGuideTitle: "用户安全使用指南",
            userGuide: [
                "租前先了解五层策略 — 明确 Agent 能做和不能做什么。",
                "在模板上限范围内配置你自己的安全限额。",
                "只向 Agent Vault 充入你愿意承担风险的资金。",
                "定期查看 AI 推理日志，关注异常行为。",
                "发现异常立即使用暂停或终止。"
            ],
            developerGuideTitle: "开发者：添加新策略域",
            developerGuide: [
                "创建实现 IPolicy 接口的新策略合约。",
                "通过可组合路由器将策略注册到 PolicyGuardV4。",
                "定义领域特定的验证规则（如 NFT 策略、借贷策略）。",
                "编写正常和对抗性参数的测试用例。",
                "通过管理面板或 Foundry 脚本部署和注册。"
            ],
            warningTitle: "安全提醒",
            warning: "给 operator 授权只是允许提交动作，不是允许绕过策略。所有五个安全层都在智能合约级别强制执行 — 不在 AI 中，不在后端。"
        },
        faq: {
            title: "常见问题解答",
            items: [
                {
                    q: "我需要把私钥交给 SHLL 吗？",
                    a: "不需要。你用自己的钱包签名。SHLL 为你铸造一个隔离的 Agent 实例 — 你的主钱包永远不会暴露给 AI。"
                },
                {
                    q: "AI Agent 会偷走我 Vault 里的资金吗？",
                    a: "不会。AI 的每一个动作都经过五层链上策略验证（PolicyGuardV4）。即使 AI 被入侵，也无法绕过智能合约的强制执行。"
                },
                {
                    q: "什么是 Rent-to-Mint？",
                    a: "当你租用 Agent 时，SHLL 铸造一个新的链上实例（NFA）。你拥有 NFT，AI 操作它，但所有动作都受 PolicyGuard 约束。Agent 拥有自己的隔离 Vault。"
                },
                {
                    q: "上限和用户配置有什么区别？",
                    a: "模板创建者设置硬性上限（最大限额）。作为租户，你配置自己的限额，不能超过上限。这确保你始终在安全范围内。"
                },
                {
                    q: "LLM Agent 如何做出交易决策？",
                    a: "LLM Agent 接收市场数据、Vault 余额和你的策略指令。它分析情况并调用工具（swap、wait、done）来执行。每个决策都记录在 AI 推理日志中。"
                },
                {
                    q: "什么是冷却时间，为什么重要？",
                    a: "冷却时间在合约级别强制连续操作之间的最少等待时间。这可以防止 AI 在闪崩或漏洞利用期间进行高频交易。"
                },
                {
                    q: "如何暂停或停止我的 Agent？",
                    a: "你可以随时在控制台关闭自动驾驶。也可以使用暂停或终止控制来立即停止所有链上 Agent 执行。"
                },
                {
                    q: "租期到期后会怎样？",
                    a: "租期结束时，ERC-4907 的 userOf 权限自动过期。Agent 再也无法代表你执行动作。你可以随时提取剩余 Vault 资金。"
                }
            ]
        },
        cta: {
            title: "准备好安全运行你的第一个 AI Agent 了吗？",
            desc: "从市场租用 Agent，通过 Rent-to-Mint 铸造，配置你的安全限额，让 AI 在你的策略护栏内交易。",
            primaryAction: "前往市场",
            primaryUrl: "/market",
            secondaryAction: "打开我的页面",
            secondaryUrl: "/me"
        },
        social: {
            title: "社区与 GitHub",
            subtitle: "关注项目动态与源码仓库。",
            links: [
                {
                    label: "GitHub 主页",
                    url: "https://github.com/kledx"
                },
                {
                    label: "Web 应用仓库",
                    url: "https://github.com/kledx/shll-web"
                },
                {
                    label: "合约仓库",
                    url: "https://github.com/kledx/shll-docs"
                },
                {
                    label: "Indexer 仓库",
                    url: "https://github.com/kledx/shll-indexer"
                }
            ]
        }
    }
};
