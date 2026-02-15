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
            intro: "New to SHLL? Follow this path once and you can run an agent safely end-to-end.",
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
                    url: "/"
                },
                {
                    title: "2. Rent an agent",
                    desc: "Open an agent detail page and rent it. After success, the UserOf right is minted to your wallet for the lease window.",
                    action: "Open My Dashboard",
                    url: "/me"
                },
                {
                    title: "3. Open console and complete preflight",
                    desc: "From My Dashboard, enter Agent Detail -> Console. Confirm renter status, strategy mode, and operator readiness before execution.",
                    action: "Open My Dashboard",
                    url: "/me"
                },
                {
                    title: "4. Run safely with guardrails",
                    desc: "Use strategy evaluation first, then execute only when simulation passes and policy constraints are satisfied.",
                    action: "Read Runtime",
                    url: "#runtime"
                }
            ],
            pathsTitle: "Recommended path",
            paths: [
                "Marketplace: /",
                "My agents and rentals: /me",
                "Agent detail: /agent/{nfa}/{tokenId}",
                "Agent console: /agent/{nfa}/{tokenId}/console"
            ]
        },
        runtime: {
            intro: "SHLL separates permission, execution, and operations so each layer has explicit boundaries.",
            actorsTitle: "Who does what",
            actors: [
                {
                    name: "Owner",
                    responsibility: "Lists an agent, defines policy/capability packs, and receives rent.",
                    boundary: "Cannot execute renter session actions unless owner is also the active renter."
                },
                {
                    name: "Renter",
                    responsibility: "Gets temporary UserOf control and sends strategy or transaction intents.",
                    boundary: "Cannot bypass policy checks or extract vault assets to arbitrary addresses."
                },
                {
                    name: "Runner",
                    responsibility: "Off-chain service that watches enabled tokens and submits execution requests.",
                    boundary: "Runs with operator keys but is still constrained by on-chain policy and account binding."
                }
            ],
            conceptsTitle: "Action and capability pack",
            concepts: [
                {
                    name: "Action",
                    desc: "The smallest executable unit submitted by user or runner.",
                    detail: "Contains target contract, value, calldata and execution intent metadata."
                },
                {
                    name: "Capability Pack",
                    desc: "A per-agent function bundle that defines which action templates are available.",
                    detail: "It constrains supported protocols, action schemas, and strategy-specific parameters."
                },
                {
                    name: "Policy Bundle",
                    desc: "Risk constraints enforced at execution time.",
                    detail: "Even valid capability actions are blocked if whitelist, amount, slippage, or destination rules fail."
                }
            ],
            actionFieldsTitle: "Typical action fields",
            actionFields: [
                "tokenId: which agent instance to execute",
                "target: destination contract",
                "value: native token amount",
                "data: encoded calldata",
                "intent: semantic type such as swap, repay, raw"
            ],
            mappingTitle: "How pack becomes action",
            mapping: [
                "1) Console loads capability pack by tokenId.",
                "2) UI renders allowed templates from that pack.",
                "3) User fills parameters and builder creates action payload.",
                "4) Preflight and simulation run before send.",
                "5) Runner or user submits action for on-chain validation."
            ],
            flowTitle: "Execution lifecycle",
            flow: [
                "1) User or runner submits an intent for tokenId.",
                "2) AgentNFA verifies caller role and lease validity.",
                "3) AgentNFA routes action to PolicyGuard.validate(...).",
                "4) PolicyGuard enforces whitelist, amount caps, slippage and destination constraints.",
                "5) AgentAccount executes the call only when validated.",
                "6) Result and status are indexed for console history and diagnostics.",
                "7) Runner loop continues based on strategy interval and health status."
            ],
            multiTenantTitle: "Single runner, multiple tokenIds",
            multiTenant: [
                "One runner instance can manage many agents by ALLOWED_TOKEN_IDS filtering.",
                "Per-token execution state is isolated in storage (locks, health, strategy status).",
                "Different strategies are resolved per token using capability pack and policy bundle metadata.",
                "Operationally this reduces deployment count, while keeping on-chain isolation unchanged."
            ],
            failureTitle: "If status is false",
            failures: [
                "Check wallet role: current wallet must match active renter for the token.",
                "Check operator authorization on-chain for your operator address.",
                "Check runner health endpoint and market signal sync status.",
                "Check DB and RPC connectivity before re-running strategy evaluation."
            ]
        },
        security: {
            intro: "Make DeFi agent rental auditable, reproducible, and safe-by-default instead of key handover.",
            promise: "SHLL does not promise profit. We promise clear permissions, isolated funds, controllable execution, and auditable behavior.",
            diagramsTitle: "Security visual overview",
            diagramsDesc: "Two diagrams summarize the non-bypassable execution path and four-layer isolation design.",
            executionDiagramTitle: "Execution flow diagram",
            executionDiagramAlt: "SHLL security execution flow diagram",
            architectureDiagramTitle: "Layered architecture diagram",
            architectureDiagramAlt: "SHLL four-layer security architecture diagram",
            problemsTitle: "What security problems SHLL solves",
            problems: [
                "Private-key custody risk: users should not hand over EOA private keys to bots.",
                "Privilege escalation risk: agent must not have unrestricted arbitrary contract calls.",
                "Opaque execution risk: users need readable policy and clear reject reasons."
            ],
            actorsTitle: "Participants and permission boundaries",
            actors: [
                "Owner: mint/list agent, configure policy, reuse the agent after lease ends.",
                "Renter: gets lease-time usage right and can submit controlled DeFi actions.",
                "Policy Admin: maintains allowlist and limits through policy bundle release flow.",
                "Runner/Operator: optional automation trigger service, not a privileged fund custodian."
            ],
            architectureTitle: "Four-layer security architecture",
            architecture: [
                {
                    title: "1) AgentNFA (Identity Layer)",
                    points: [
                        "Implements ERC-721 + ERC-4907 + BAP-578 agent identity semantics.",
                        "Routes permissions and lifecycle (pause/terminate).",
                        "Only current renter can execute during valid lease."
                    ]
                },
                {
                    title: "2) AgentAccount (Vault Layer)",
                    points: [
                        "One tokenId maps to one isolated vault contract.",
                        "Accepts execution only from bound AgentNFA.",
                        "Withdraw destination is restricted to caller self-address."
                    ]
                },
                {
                    title: "3) PolicyGuard (On-chain Firewall)",
                    points: [
                        "Validates target + selector + parameter-level constraints.",
                        "Enforces allowlist and hard limits.",
                        "Blocks unlimited approve and unsafe destination patterns."
                    ]
                },
                {
                    title: "4) ListingManager (Market Layer)",
                    points: [
                        "Handles listing, rent, extension, and rental state transitions.",
                        "Controls ERC-4907 userOf assignment.",
                        "Prevents arbitrary external overwrite of renter role."
                    ]
                }
            ],
            bapTitle: "Why BAP-578 matters",
            bap: [
                "Standardized on-chain agent identity and metadata schema.",
                "Consistent executeAction-style interface for ecosystem integrations.",
                "Portable rental and status semantics across products and tooling.",
                "Better composability: wallets, indexers, and strategy UIs can integrate once."
            ],
            invariantTitle: "Non-bypassable invariant",
            invariant: "All renter execution must follow AgentNFA -> PolicyGuard.validate -> AgentAccount.executeCall.",
            executionTitle: "Execution path (swap example)",
            execution: [
                "1) Renter fills swap parameters in Console.",
                "2) Frontend builds Action{target,value,data}.",
                "3) Simulate first to get PolicyViolation reason before send.",
                "4) Execute calls AgentNFA.execute(tokenId, action).",
                "5) PolicyGuard validates target, selector, path, deadline, amount, destination.",
                "6) AgentAccount.executeCall runs external protocol interaction."
            ],
            allowlistTitle: "PolicyGuard allowlist dimensions",
            allowlist: [
                "targetAllowed[target]: approved protocol contract addresses.",
                "selectorAllowed[target][selector]: approved function selectors.",
                "tokenAllowed[token]: approved tokens in swap/approve path.",
                "spenderAllowed[token][spender]: approved spender contracts."
            ],
            constraintsTitle: "Parameter-level hard constraints",
            constraints: [
                "Swap recipient must equal AgentAccount vault address.",
                "Deadline must be within maxDeadlineWindow.",
                "Path length must be <= maxPathLength and tokens must be allowlisted.",
                "Unlimited approve is blocked; approve amount must be capped.",
                "repayBorrowBehalf borrower must equal current renter."
            ],
            runnerTitle: "Why runner is not a custody service",
            runner: [
                "Runner acts as trigger: Observe -> Decide -> Build Action -> Simulate -> Execute.",
                "If simulate fails, execute is not sent.",
                "Even compromised runner cannot bypass on-chain PolicyGuard validation."
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
                    shll: "On-chain firewall checks target/selector/params."
                },
                {
                    dimension: "Auditability",
                    baseline: "Hard to inspect what bot will do.",
                    shll: "Readable action/policy and explicit reject reasons."
                },
                {
                    dimension: "Blast radius",
                    baseline: "Shared wallet or pooled exposure.",
                    shll: "One tokenId one vault isolation."
                },
                {
                    dimension: "Automation safety",
                    baseline: "Blind auto-send is common.",
                    shll: "Simulation-first and on-chain re-validation."
                },
                {
                    dimension: "Permission revoke",
                    baseline: "Hard to revoke safely.",
                    shll: "Lease expiry via ERC-4907 plus pause/terminate controls."
                }
            ],
            defendTitle: "What SHLL can defend (MVP scope)",
            defend: [
                "Renter attempting to redirect vault assets to third-party addresses.",
                "Unlimited-approve then drain pattern.",
                "repayBorrowBehalf risk transfer abuse.",
                "Compromised runner sending out-of-policy actions."
            ],
            limitsTitle: "Known assumptions and external risk surfaces",
            limits: [
                "Allowlist quality depends on operator governance and review discipline.",
                "Allowlisted external protocols still carry their own protocol-level risk.",
                "Market/MEV/slippage risk is managed and bounded, but not eliminable.",
                "Post-lease owner actions follow asset ownership rules by design."
            ],
            userGuideTitle: "User safety guide",
            userGuide: [
                "Review Policy Summary before renting.",
                "Run Simulate before every execute.",
                "Only deposit capital you are willing to risk.",
                "Stop or pause quickly on abnormal behavior.",
                "Use autopilot only with understood strategies."
            ],
            developerGuideTitle: "Developer secure extension flow",
            developerGuide: [
                "Declare protocol target + selector explicitly.",
                "Implement parameter-level validation in PolicyGuard.",
                "Update allowlist bundle with limits and hashes.",
                "Apply + check + audit policy updates with scripts.",
                "Add tests for normal pass and adversarial parameters."
            ],
            warningTitle: "Security reminder",
            warning: "Authorizing an operator allows action submission, not policy bypass."
        },
        faq: {
            title: "Frequently Asked Questions",
            items: [
                {
                    q: "Do renters need to hand private keys to SHLL?",
                    a: "No. Renters sign with their own wallet. On-chain contracts validate and execute actions."
                },
                {
                    q: "Can runner steal funds from my vault?",
                    a: "Runner cannot directly control the vault. It can only submit execute requests, and every request is checked by PolicyGuard."
                },
                {
                    q: "Why use NFA (BAP-578)?",
                    a: "NFA standardizes agent identity, rental rights, and execute interfaces, making integration and composability easier."
                }
            ]
        },
        cta: {
            title: "Ready to run your first safe strategy?",
            desc: "Start from Marketplace, rent an agent, then execute through Console with policy-aware preflight.",
            primaryAction: "Open Marketplace",
            primaryUrl: "/",
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
            intro: "第一次使用 SHLL，按下面路径走一遍即可完成从租赁到执行的闭环。",
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
                    url: "/"
                },
                {
                    title: "2. 租用 Agent",
                    desc: "进入 Agent 详情页完成租赁。成功后，你的钱包会在租期内获得 UserOf 控制权。",
                    action: "打开我的页面",
                    url: "/me"
                },
                {
                    title: "3. 进入控制台并完成预检",
                    desc: "在我的页面进入 Agent 详情 -> Console。先确认租户身份、策略模式和 operator 状态，再执行。",
                    action: "打开我的页面",
                    url: "/me"
                },
                {
                    title: "4. 在风控约束下执行",
                    desc: "先做策略评估和模拟，通过后再发链上交易，避免直接盲发。",
                    action: "查看运行机制",
                    url: "#runtime"
                }
            ],
            pathsTitle: "常用路径",
            paths: [
                "市场首页: /",
                "我的 Agent 与租赁: /me",
                "Agent 详情: /agent/{nfa}/{tokenId}",
                "Agent 控制台: /agent/{nfa}/{tokenId}/console"
            ]
        },
        runtime: {
            intro: "SHLL 把权限、执行、运营分层设计，每一层都有明确边界。",
            actorsTitle: "角色与职责",
            actors: [
                {
                    name: "Owner",
                    responsibility: "上架 Agent，配置策略/能力包，收取租金。",
                    boundary: "除非 Owner 同时是当前租户，否则不能执行租户会话动作。"
                },
                {
                    name: "Renter",
                    responsibility: "在租期内获得 UserOf 控制权，提交策略或交易意图。",
                    boundary: "不能绕过风控，也不能把金库资产随意转到外部地址。"
                },
                {
                    name: "Runner",
                    responsibility: "链下服务，监听已启用 token 并发起自动执行请求。",
                    boundary: "即使持有 operator key，仍受链上策略与账户绑定约束。"
                }
            ],
            conceptsTitle: "Action 与功能包",
            concepts: [
                {
                    name: "Action",
                    desc: "用户或 runner 提交的最小可执行单元。",
                    detail: "通常包含目标合约、value、calldata 以及意图元数据。"
                },
                {
                    name: "Capability Pack（功能包）",
                    desc: "按 Agent 生效的功能集合，决定可用的动作模板。",
                    detail: "它约束支持哪些协议、动作结构、以及策略参数范围。"
                },
                {
                    name: "Policy Bundle",
                    desc: "执行时生效的风控约束集合。",
                    detail: "即使功能包允许，若白名单、额度、滑点或资金去向不合规，动作仍会被拒绝。"
                }
            ],
            actionFieldsTitle: "Action 常见字段",
            actionFields: [
                "tokenId：要执行的 Agent 实例",
                "target：目标合约地址",
                "value：原生币数量",
                "data：编码后的 calldata",
                "intent：动作语义类型（如 swap、repay、raw）"
            ],
            mappingTitle: "功能包如何变成 Action",
            mapping: [
                "1) 控制台按 tokenId 加载 capability pack。",
                "2) 前端按功能包渲染可用模板。",
                "3) 用户填写参数后，构建器生成 action payload。",
                "4) 发送前执行预检与模拟。",
                "5) runner 或用户提交 action，链上继续校验与执行。"
            ],
            flowTitle: "执行链路",
            flow: [
                "1) 用户或 runner 提交某个 tokenId 的执行意图。",
                "2) AgentNFA 校验调用者角色和租期有效性。",
                "3) AgentNFA 转发动作给 PolicyGuard.validate(... )。",
                "4) PolicyGuard 校验白名单、额度、滑点、资金去向等约束。",
                "5) 通过后 AgentAccount 才会真正执行外部调用。",
                "6) 结果写入索引与活动记录，供控制台诊断和追踪。",
                "7) runner 按策略间隔继续下一轮。"
            ],
            multiTenantTitle: "单 runner 管多个 tokenId",
            multiTenant: [
                "一个 runner 进程可通过 ALLOWED_TOKEN_IDS 管理多个 Agent。",
                "每个 tokenId 的执行锁、健康状态、策略状态独立存储。",
                "不同 Agent 的策略由 capability pack + policy bundle 元数据按 token 动态解析。",
                "这样减少部署数量，但不改变链上资金隔离与风控隔离。"
            ],
            failureTitle: "当 status=false 时",
            failures: [
                "先核对角色：当前钱包是否为该 token 的 active renter。",
                "核对链上授权：operator 地址是否已完成授权。",
                "核对 runner 健康：/status 与 market signal sync 是否正常。",
                "核对基础设施：数据库、RPC、外部数据源是否可连通。"
            ]
        },
        security: {
            intro: "把“租一个可执行 DeFi 的 Agent”变成可审计、可复现、默认安全的流程，而不是交出私钥。",
            promise: "SHLL 不承诺收益，我们承诺：权限清晰、资金隔离、执行可控、行为可审计。",
            diagramsTitle: "安全图解总览",
            diagramsDesc: "通过两张图快速理解不可绕过的执行路径与四层隔离架构。",
            executionDiagramTitle: "执行链路图",
            executionDiagramAlt: "SHLL 安全执行链路图",
            architectureDiagramTitle: "分层架构图",
            architectureDiagramAlt: "SHLL 四层安全架构图",
            problemsTitle: "SHLL 重点解决的安全问题",
            problems: [
                "私钥托管风险：用户不应把 EOA 私钥交给机器人或平台。",
                "越权调用风险：Agent 不应具备任意合约调用能力。",
                "不可审计风险：用户必须能看懂策略并看到明确失败原因。"
            ],
            actorsTitle: "核心参与者与权限边界",
            actors: [
                "Owner：铸造/上架 Agent，配置策略，租期结束后继续使用。",
                "Renter：在租期内获得使用权，可提交受控 DeFi 动作。",
                "Policy Admin：通过策略包发布流维护白名单与限额。",
                "Runner/Operator：可选自动化触发服务，不是资金托管方。"
            ],
            architectureTitle: "四层安全架构",
            architecture: [
                {
                    title: "1) AgentNFA（身份层）",
                    points: [
                        "实现 ERC-721 + ERC-4907 + BAP-578 的 Agent 身份语义。",
                        "负责权限路由与生命周期（pause/terminate）。",
                        "仅当前有效租户可在租期内执行。"
                    ]
                },
                {
                    title: "2) AgentAccount（资金层）",
                    points: [
                        "一 tokenId 一独立 vault，资金隔离。",
                        "仅接受绑定 AgentNFA 的执行调用。",
                        "提现目的地址限制为调用者自身地址。"
                    ]
                },
                {
                    title: "3) PolicyGuard（链上防火墙）",
                    points: [
                        "校验 target + selector + 参数级约束。",
                        "执行白名单与硬性限额策略。",
                        "拦截无限授权与危险资金去向。"
                    ]
                },
                {
                    title: "4) ListingManager（市场层）",
                    points: [
                        "管理上架、租赁、续租、状态流转。",
                        "控制 ERC-4907 的 userOf 设置。",
                        "防止外部任意改写租户身份。"
                    ]
                }
            ],
            bapTitle: "为什么 BAP-578 重要",
            bap: [
                "统一 Agent 的链上身份与元数据结构。",
                "提供标准化 executeAction 风格接口，便于生态集成。",
                "让租赁权与状态语义可复用、可迁移。",
                "提升可组合性：钱包、索引器、策略 UI 可一次接入多处复用。"
            ],
            invariantTitle: "不可绕过的不变量",
            invariant: "所有租户执行都必须经过：AgentNFA -> PolicyGuard.validate -> AgentAccount.executeCall。",
            executionTitle: "执行链路（以 Swap 为例）",
            execution: [
                "1) 租户在 Console 填写交易参数。",
                "2) 前端构建 Action{target,value,data}。",
                "3) 先 simulate，提前看到 PolicyViolation 原因。",
                "4) Execute 调用 AgentNFA.execute(tokenId, action)。",
                "5) PolicyGuard 校验目标、函数、路径、deadline、额度、资金去向。",
                "6) 通过后由 AgentAccount.executeCall 执行外部协议。"
            ],
            allowlistTitle: "PolicyGuard 白名单维度",
            allowlist: [
                "targetAllowed[target]：允许调用的协议合约地址。",
                "selectorAllowed[target][selector]：允许调用的函数选择器。",
                "tokenAllowed[token]：允许出现的代币。",
                "spenderAllowed[token][spender]：允许被授权的 spender。"
            ],
            constraintsTitle: "参数级硬约束",
            constraints: [
                "Swap 的 to 必须等于 AgentAccount vault 地址。",
                "deadline 必须在 maxDeadlineWindow 内。",
                "path 长度必须 <= maxPathLength 且代币均在白名单。",
                "禁止无限 approve，approve 金额必须受限。",
                "repayBorrowBehalf 的 borrower 必须是当前 renter。"
            ],
            runnerTitle: "为什么 Runner 不是托管服务",
            runner: [
                "Runner 是触发器：Observe -> Decide -> Build Action -> Simulate -> Execute。",
                "simulate 失败不会继续 execute。",
                "即使 runner 被劫持，也无法绕过链上 PolicyGuard。"
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
                    shll: "无需交私钥，按 Agent 独立 vault 隔离。"
                },
                {
                    dimension: "执行权限",
                    baseline: "常见为任意合约调用能力。",
                    shll: "链上防火墙校验目标、函数和参数。"
                },
                {
                    dimension: "可审计性",
                    baseline: "用户难知道机器人将做什么。",
                    shll: "Action/Policy 可读，拒绝原因可追踪。"
                },
                {
                    dimension: "风险隔离",
                    baseline: "常见共用钱包或资金池。",
                    shll: "一 tokenId 一 vault，不串仓。"
                },
                {
                    dimension: "自动化安全",
                    baseline: "可能盲发交易。",
                    shll: "先模拟再执行，链上再校验。"
                },
                {
                    dimension: "权限撤销",
                    baseline: "撤销成本高且不彻底。",
                    shll: "ERC-4907 到期自动失效 + pause/terminate。"
                }
            ],
            defendTitle: "当前可防（MVP）",
            defend: [
                "租户将 vault 资产导向第三方地址。",
                "无限授权后转走全部 token 的路径。",
                "repayBorrowBehalf 的风险转嫁滥用。",
                "runner 被劫持后发起越权交易。"
            ],
            limitsTitle: "已知前提与外部风险面",
            limits: [
                "白名单质量依赖运营治理与配置审核流程。",
                "被允许的外部协议仍有其自身协议风险。",
                "价格/滑点/MEV 风险可被约束和降低，但无法完全消除。",
                "租期结束后的 Owner 行为遵循资产所有权规则。"
            ],
            userGuideTitle: "用户安全使用指南",
            userGuide: [
                "租前先看 Policy Summary。",
                "每次执行前先 Simulate。",
                "只放入可承受风险的资金。",
                "发现异常立即停止或请求 pause。",
                "仅在理解策略时启用 autopilot。"
            ],
            developerGuideTitle: "开发者安全扩展流程",
            developerGuide: [
                "先明确协议 target 与 selector。",
                "在 PolicyGuard 中实现参数级校验。",
                "更新 allowlist 策略包并附带限额。",
                "通过脚本 apply/check/audit 完成变更。",
                "补齐正常与攻击参数测试用例。"
            ],
            warningTitle: "安全提醒",
            warning: "给 operator 授权只是允许提交动作，不是允许绕过策略。"
        },
        faq: {
            title: "常见问题解答",
            items: [
                {
                    q: "租户需要把私钥交给 SHLL 吗？",
                    a: "不需要。租户只用自己的钱包签名，链上合约负责校验与执行。"
                },
                {
                    q: "Runner 会不会偷 vault 里的钱？",
                    a: "Runner 不能直接操作 vault。它只能提交 execute 请求，且每次都会被 PolicyGuard 校验。"
                },
                {
                    q: "为什么要用 NFA（BAP-578）？",
                    a: "NFA 把 Agent 身份、租赁权和执行接口标准化，便于生态集成与可组合。"
                }
            ]
        },
        cta: {
            title: "准备好跑第一条安全策略了吗？",
            desc: "从市场租用 Agent，在 Console 里按预检流程执行策略。",
            primaryAction: "前往市场",
            primaryUrl: "/",
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
