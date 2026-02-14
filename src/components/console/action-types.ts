import { Address, Hex } from "viem";

export interface Action {
    target: Address;
    value: bigint;
    data: Hex;
}

export type TemplateKey = "swap" | "repay" | "raw";
