import { Address } from 'viem';

export const CONTRACTS = {
  AgentNFA: {
    // BSC Testnet — redeployed 2026-02-15 (V1.3 Rent-to-Mint)
    address: "0xcf5d434d855155beba97e3554ef9afea5ed4eb4d" as Address,
    deployBlock: BigInt(90496831),
    abi: [
      {
        "type": "constructor",
        "inputs": [
          {
            "name": "_policyGuard",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "accountOf",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "agentStatus",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "uint8",
            "internalType": "enum IBAP578.Status"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "approve",
        "inputs": [
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "execute",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "action",
            "type": "tuple",
            "internalType": "struct Action",
            "components": [
              {
                "name": "target",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
              }
            ]
          }
        ],
        "outputs": [
          {
            "name": "result",
            "type": "bytes",
            "internalType": "bytes"
          }
        ],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "executeAction",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "data",
            "type": "bytes",
            "internalType": "bytes"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "executeBatch",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "actions",
            "type": "tuple[]",
            "internalType": "struct Action[]",
            "components": [
              {
                "name": "target",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
              }
            ]
          }
        ],
        "outputs": [
          {
            "name": "results",
            "type": "bytes[]",
            "internalType": "bytes[]"
          }
        ],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "fundAgent",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "getAgentMetadata",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "tuple",
            "internalType": "struct IBAP578.AgentMetadata",
            "components": [
              {
                "name": "persona",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "experience",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "voiceHash",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "animationURI",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "vaultURI",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "vaultHash",
                "type": "bytes32",
                "internalType": "bytes32"
              }
            ]
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "getApproved",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "getState",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "tuple",
            "internalType": "struct IBAP578.State",
            "components": [
              {
                "name": "balance",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "status",
                "type": "uint8",
                "internalType": "enum IBAP578.Status"
              },
              {
                "name": "owner",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "logicAddress",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "lastActionTimestamp",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "isApprovedForAll",
        "inputs": [
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "operator",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "listingManager",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "logicAddressOf",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "mintAgent",
        "inputs": [
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "policyId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "uri",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "metadata",
            "type": "tuple",
            "internalType": "struct IBAP578.AgentMetadata",
            "components": [
              {
                "name": "persona",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "experience",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "voiceHash",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "animationURI",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "vaultURI",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "vaultHash",
                "type": "bytes32",
                "internalType": "bytes32"
              }
            ]
          }
        ],
        "outputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "name",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "string",
            "internalType": "string"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "ownerOf",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "pause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "pauseAgent",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "paused",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "policyGuard",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "policyIdOf",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "safeTransferFrom",
        "inputs": [
          {
            "name": "from",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "safeTransferFrom",
        "inputs": [
          {
            "name": "from",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "data",
            "type": "bytes",
            "internalType": "bytes"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setApprovalForAll",
        "inputs": [
          {
            "name": "operator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "approved",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setListingManager",
        "inputs": [
          {
            "name": "_listingManager",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setLogicAddress",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "newLogic",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setOperator",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "operator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "opExpires",
            "type": "uint64",
            "internalType": "uint64"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setOperatorWithSig",
        "inputs": [
          {
            "name": "permit",
            "type": "tuple",
            "internalType": "struct AgentNFA.OperatorPermit",
            "components": [
              {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "renter",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "operator",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "expires",
                "type": "uint64",
                "internalType": "uint64"
              },
              {
                "name": "nonce",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "deadline",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "sig",
            "type": "bytes",
            "internalType": "bytes"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "clearOperator",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setPolicy",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "newPolicyId",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setPolicyGuard",
        "inputs": [
          {
            "name": "_policyGuard",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setUser",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "user",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "expires",
            "type": "uint64",
            "internalType": "uint64"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "supportsInterface",
        "inputs": [
          {
            "name": "interfaceId",
            "type": "bytes4",
            "internalType": "bytes4"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "symbol",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "string",
            "internalType": "string"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "terminate",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "tokenURI",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "string",
            "internalType": "string"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "transferFrom",
        "inputs": [
          {
            "name": "from",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
          {
            "name": "newOwner",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "unpause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "unpauseAgent",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "updateAgentMetadata",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "metadata",
            "type": "tuple",
            "internalType": "struct IBAP578.AgentMetadata",
            "components": [
              {
                "name": "persona",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "experience",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "voiceHash",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "animationURI",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "vaultURI",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "vaultHash",
                "type": "bytes32",
                "internalType": "bytes32"
              }
            ]
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "userExpires",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "userOf",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "operatorNonceOf",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "operatorOf",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "operatorExpiresOf",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "event",
        "name": "ActionExecuted",
        "inputs": [
          {
            "name": "agent",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "result",
            "type": "bytes",
            "indexed": false,
            "internalType": "bytes"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "AgentFunded",
        "inputs": [
          {
            "name": "agent",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "funder",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "AgentMinted",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          },
          {
            "name": "owner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "account",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          },
          {
            "name": "policyId",
            "type": "bytes32",
            "indexed": false,
            "internalType": "bytes32"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "Approval",
        "inputs": [
          {
            "name": "owner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "approved",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "ApprovalForAll",
        "inputs": [
          {
            "name": "owner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "operator",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "approved",
            "type": "bool",
            "indexed": false,
            "internalType": "bool"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "BatchMetadataUpdate",
        "inputs": [
          {
            "name": "_fromTokenId",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          },
          {
            "name": "_toTokenId",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "Executed",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          },
          {
            "name": "caller",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "account",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "target",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          },
          {
            "name": "selector",
            "type": "bytes4",
            "indexed": false,
            "internalType": "bytes4"
          },
          {
            "name": "success",
            "type": "bool",
            "indexed": false,
            "internalType": "bool"
          },
          {
            "name": "result",
            "type": "bytes",
            "indexed": false,
            "internalType": "bytes"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "LeaseSet",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          },
          {
            "name": "user",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "expires",
            "type": "uint64",
            "indexed": false,
            "internalType": "uint64"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "LogicUpgraded",
        "inputs": [
          {
            "name": "agent",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "oldLogic",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          },
          {
            "name": "newLogic",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "MetadataUpdate",
        "inputs": [
          {
            "name": "_tokenId",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "MetadataUpdated",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          },
          {
            "name": "metadataURI",
            "type": "string",
            "indexed": false,
            "internalType": "string"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
          {
            "name": "previousOwner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "newOwner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "Paused",
        "inputs": [
          {
            "name": "account",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "PolicyUpdated",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          },
          {
            "name": "oldPolicyId",
            "type": "bytes32",
            "indexed": false,
            "internalType": "bytes32"
          },
          {
            "name": "newPolicyId",
            "type": "bytes32",
            "indexed": false,
            "internalType": "bytes32"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "StatusChanged",
        "inputs": [
          {
            "name": "agent",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "newStatus",
            "type": "uint8",
            "indexed": false,
            "internalType": "enum IBAP578.Status"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "Transfer",
        "inputs": [
          {
            "name": "from",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "to",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "Unpaused",
        "inputs": [
          {
            "name": "account",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "UpdateUser",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          },
          {
            "name": "user",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "expires",
            "type": "uint64",
            "indexed": false,
            "internalType": "uint64"
          }
        ],
        "anonymous": false
      },
      {
        "type": "error",
        "name": "AgentPaused",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "type": "error",
        "name": "AgentTerminated",
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "type": "error",
        "name": "ExecutionFailed",
        "inputs": []
      },
      {
        "type": "error",
        "name": "InvalidLogicAddress",
        "inputs": []
      },
      {
        "type": "error",
        "name": "LeaseExpired",
        "inputs": []
      },
      {
        "type": "error",
        "name": "OnlyListingManager",
        "inputs": []
      },
      {
        "type": "error",
        "name": "OnlyOwner",
        "inputs": []
      },
      {
        "type": "error",
        "name": "PolicyViolation",
        "inputs": [
          {
            "name": "reason",
            "type": "string",
            "internalType": "string"
          }
        ]
      },
      {
        "type": "error",
        "name": "Unauthorized",
        "inputs": []
      },
      {
        "type": "error",
        "name": "ZeroAddress",
        "inputs": []
      },
      {
        "type": "error",
        "name": "AlreadyTemplate",
        "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }]
      },
      {
        "type": "error",
        "name": "NotTemplate",
        "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }]
      },
      {
        "type": "function",
        "name": "isTemplate",
        "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "templateOf",
        "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "nextTokenId",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "registerTemplate",
        "inputs": [
          { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
          { "name": "packHash", "type": "bytes32", "internalType": "bytes32" },
          { "name": "packURI", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "paramsHashOf",
        "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "templatePackHash",
        "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "templatePolicyId",
        "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
        "stateMutability": "view"
      },
      {
        "type": "event",
        "name": "TemplateListed",
        "inputs": [
          { "name": "templateId", "type": "uint256", "indexed": true, "internalType": "uint256" },
          { "name": "owner", "type": "address", "indexed": true, "internalType": "address" },
          { "name": "packHash", "type": "bytes32", "indexed": false, "internalType": "bytes32" },
          { "name": "packURI", "type": "string", "indexed": false, "internalType": "string" },
          { "name": "policyId", "type": "bytes32", "indexed": false, "internalType": "bytes32" }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "InstanceMinted",
        "inputs": [
          { "name": "templateId", "type": "uint256", "indexed": true, "internalType": "uint256" },
          { "name": "instanceId", "type": "uint256", "indexed": true, "internalType": "uint256" },
          { "name": "renter", "type": "address", "indexed": true, "internalType": "address" },
          { "name": "vault", "type": "address", "indexed": false, "internalType": "address" },
          { "name": "expires", "type": "uint64", "indexed": false, "internalType": "uint64" },
          { "name": "paramsHash", "type": "bytes32", "indexed": false, "internalType": "bytes32" }
        ],
        "anonymous": false
      }
    ] as const,
  },
  ListingManager: {
    address: "0x7e47e94d4ec2992898300006483d55848efbc315" as Address,
    deployBlock: BigInt(90496831),
    abi: [
      {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "cancelListing",
        "inputs": [
          {
            "name": "listingId",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "claimRentalIncome",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "createListing",
        "inputs": [
          {
            "name": "nfa",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "pricePerDay",
            "type": "uint96",
            "internalType": "uint96"
          },
          {
            "name": "minDays",
            "type": "uint32",
            "internalType": "uint32"
          }
        ],
        "outputs": [
          {
            "name": "listingId",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "extend",
        "inputs": [
          {
            "name": "listingId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "daysToExtend",
            "type": "uint32",
            "internalType": "uint32"
          }
        ],
        "outputs": [
          {
            "name": "newExpires",
            "type": "uint64",
            "internalType": "uint64"
          }
        ],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "getListingId",
        "inputs": [
          {
            "name": "nfa",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "stateMutability": "pure"
      },
      {
        "type": "function",
        "name": "listings",
        "inputs": [
          {
            "name": "",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "outputs": [
          {
            "name": "nfa",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "pricePerDay",
            "type": "uint96",
            "internalType": "uint96"
          },
          {
            "name": "minDays",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "pendingWithdrawals",
        "inputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "rent",
        "inputs": [
          {
            "name": "listingId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "daysToRent",
            "type": "uint32",
            "internalType": "uint32"
          }
        ],
        "outputs": [
          {
            "name": "expires",
            "type": "uint64",
            "internalType": "uint64"
          }
        ],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
          {
            "name": "newOwner",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "event",
        "name": "AgentRented",
        "inputs": [
          {
            "name": "listingId",
            "type": "bytes32",
            "indexed": true,
            "internalType": "bytes32"
          },
          {
            "name": "renter",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "expires",
            "type": "uint64",
            "indexed": false,
            "internalType": "uint64"
          },
          {
            "name": "totalPaid",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "LeaseExtended",
        "inputs": [
          {
            "name": "listingId",
            "type": "bytes32",
            "indexed": true,
            "internalType": "bytes32"
          },
          {
            "name": "renter",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "newExpires",
            "type": "uint64",
            "indexed": false,
            "internalType": "uint64"
          },
          {
            "name": "totalPaid",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "ListingCanceled",
        "inputs": [
          {
            "name": "listingId",
            "type": "bytes32",
            "indexed": true,
            "internalType": "bytes32"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "ListingCreated",
        "inputs": [
          {
            "name": "listingId",
            "type": "bytes32",
            "indexed": true,
            "internalType": "bytes32"
          },
          {
            "name": "nfa",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "indexed": true,
            "internalType": "uint256"
          },
          {
            "name": "pricePerDay",
            "type": "uint96",
            "indexed": false,
            "internalType": "uint96"
          },
          {
            "name": "minDays",
            "type": "uint32",
            "indexed": false,
            "internalType": "uint32"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
          {
            "name": "previousOwner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "newOwner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "WithdrawalClaimed",
        "inputs": [
          {
            "name": "owner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "error",
        "name": "AlreadyRented",
        "inputs": []
      },
      {
        "type": "error",
        "name": "ExecutionFailed",
        "inputs": []
      },
      {
        "type": "error",
        "name": "InsufficientBalance",
        "inputs": []
      },
      {
        "type": "error",
        "name": "InsufficientPayment",
        "inputs": [
          {
            "name": "required",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "sent",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "type": "error",
        "name": "ListingAlreadyExists",
        "inputs": []
      },
      {
        "type": "error",
        "name": "ListingNotFound",
        "inputs": []
      },
      {
        "type": "error",
        "name": "MinDaysNotMet",
        "inputs": [
          {
            "name": "requested",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "minimum",
            "type": "uint32",
            "internalType": "uint32"
          }
        ]
      },
      {
        "type": "error",
        "name": "NotListingOwner",
        "inputs": []
      },
      {
        "type": "error",
        "name": "Unauthorized",
        "inputs": []
      },
      {
        "type": "function",
        "name": "getListingCount",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "getListingByIndex",
        "inputs": [
          {
            "name": "index",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "allListingIds",
        "inputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "createTemplateListing",
        "inputs": [
          { "name": "nfa", "type": "address", "internalType": "address" },
          { "name": "templateId", "type": "uint256", "internalType": "uint256" },
          { "name": "pricePerDay", "type": "uint96", "internalType": "uint96" },
          { "name": "minDays", "type": "uint32", "internalType": "uint32" }
        ],
        "outputs": [{ "name": "listingId", "type": "bytes32", "internalType": "bytes32" }],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "rentToMint",
        "inputs": [
          { "name": "listingId", "type": "bytes32", "internalType": "bytes32" },
          { "name": "daysToRent", "type": "uint32", "internalType": "uint32" },
          { "name": "initParams", "type": "bytes", "internalType": "bytes" }
        ],
        "outputs": [{ "name": "instanceId", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "payable"
      },
      {
        "type": "event",
        "name": "TemplateListingCreated",
        "inputs": [
          { "name": "listingId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
          { "name": "nfa", "type": "address", "indexed": true, "internalType": "address" },
          { "name": "templateId", "type": "uint256", "indexed": true, "internalType": "uint256" },
          { "name": "pricePerDay", "type": "uint96", "indexed": false, "internalType": "uint96" },
          { "name": "minDays", "type": "uint32", "indexed": false, "internalType": "uint32" }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "InstanceRented",
        "inputs": [
          { "name": "listingId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
          { "name": "instanceId", "type": "uint256", "indexed": true, "internalType": "uint256" },
          { "name": "renter", "type": "address", "indexed": true, "internalType": "address" },
          { "name": "expires", "type": "uint64", "indexed": false, "internalType": "uint64" },
          { "name": "totalPaid", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
      }
    ] as const,
  },
  PolicyGuard: {
    address: "0xcfdc3bea04c36673a1eabf777647d38fcfcb23c7" as Address,
    abi: [
      {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "limits",
        "inputs": [
          {
            "name": "",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "pause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "paused",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "selectorAllowed",
        "inputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "",
            "type": "bytes4",
            "internalType": "bytes4"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "setLimit",
        "inputs": [
          {
            "name": "key",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "value",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setSelectorAllowed",
        "inputs": [
          {
            "name": "target",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "selector",
            "type": "bytes4",
            "internalType": "bytes4"
          },
          {
            "name": "allowed",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setSpenderAllowed",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "spender",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "allowed",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setTargetAllowed",
        "inputs": [
          {
            "name": "target",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "allowed",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "setTokenAllowed",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "allowed",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "spenderAllowed",
        "inputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "targetAllowed",
        "inputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "tokenAllowed",
        "inputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [
          {
            "name": "",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
          {
            "name": "newOwner",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "unpause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "validate",
        "inputs": [
          {
            "name": "nfa",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "agentAccount",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "caller",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "action",
            "type": "tuple",
            "internalType": "struct Action",
            "components": [
              {
                "name": "target",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
              }
            ]
          }
        ],
        "outputs": [
          {
            "name": "ok",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "reason",
            "type": "string",
            "internalType": "string"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "event",
        "name": "LimitUpdated",
        "inputs": [
          {
            "name": "key",
            "type": "bytes32",
            "indexed": true,
            "internalType": "bytes32"
          },
          {
            "name": "value",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
          {
            "name": "previousOwner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "newOwner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "Paused",
        "inputs": [
          {
            "name": "account",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "SelectorUpdated",
        "inputs": [
          {
            "name": "target",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "selector",
            "type": "bytes4",
            "indexed": true,
            "internalType": "bytes4"
          },
          {
            "name": "allowed",
            "type": "bool",
            "indexed": false,
            "internalType": "bool"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "SpenderUpdated",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "spender",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "allowed",
            "type": "bool",
            "indexed": false,
            "internalType": "bool"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "TargetUpdated",
        "inputs": [
          {
            "name": "target",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "allowed",
            "type": "bool",
            "indexed": false,
            "internalType": "bool"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "TokenUpdated",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "allowed",
            "type": "bool",
            "indexed": false,
            "internalType": "bool"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "Unpaused",
        "inputs": [
          {
            "name": "account",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "error",
        "name": "CalldataTooShort",
        "inputs": []
      }
    ] as const,
  },
  AgentAccount: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    abi: [
      {
        "type": "constructor",
        "inputs": [
          {
            "name": "_nfa",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "_tokenId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "nonpayable"
      },
      {
        "type": "receive",
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "depositToken",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "executeCall",
        "inputs": [
          {
            "name": "target",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "value",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "data",
            "type": "bytes",
            "internalType": "bytes"
          }
        ],
        "outputs": [
          {
            "name": "ok",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "result",
            "type": "bytes",
            "internalType": "bytes"
          }
        ],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "nfa",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "address",
            "internalType": "address"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "tokenId",
        "inputs": [],
        "outputs": [
          {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "withdrawNative",
        "inputs": [
          {
            "name": "amount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "withdrawToken",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "event",
        "name": "CallExecuted",
        "inputs": [
          {
            "name": "target",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "value",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          },
          {
            "name": "success",
            "type": "bool",
            "indexed": false,
            "internalType": "bool"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "Deposited",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "from",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "WithdrawnNative",
        "inputs": [
          {
            "name": "to",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "WithdrawnToken",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "to",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "error",
        "name": "ExecutionFailed",
        "inputs": []
      },
      {
        "type": "error",
        "name": "InsufficientBalance",
        "inputs": []
      },
      {
        "type": "error",
        "name": "InvalidWithdrawRecipient",
        "inputs": []
      },
      {
        "type": "error",
        "name": "OnlyNFA",
        "inputs": []
      },
      {
        "type": "error",
        "name": "Unauthorized",
        "inputs": []
      },
      {
        "type": "error",
        "name": "ZeroAddress",
        "inputs": []
      }
    ] as const,
  },
};
