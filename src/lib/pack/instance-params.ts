import { encodeAbiParameters, parseAbiParameters, parseUnits } from "viem";

export interface InstanceEncoding {
    abiTypes: string[];
    fieldOrder: string[];
    units?: Record<string, string>;
}

function normalizeWithUnit(value: unknown, unit?: string): unknown {
    if (unit !== "human") return value;
    if (typeof value === "bigint") return value;
    if (typeof value === "number") return parseUnits(String(value), 18);
    if (typeof value === "string") return parseUnits(value, 18);
    throw new Error(`Unsupported human-unit value: ${String(value)}`);
}

/**
 * Encode instance params with manifest-provided abiTypes + fieldOrder.
 * This avoids hardcoding struct order in multiple places.
 */
export function encodeInstanceParamsWithEncoding(
    params: Record<string, unknown>,
    encoding: InstanceEncoding,
) {
    if (!encoding.abiTypes?.length) {
        throw new Error("instance.encoding.abiTypes is required");
    }
    if (!encoding.fieldOrder?.length) {
        throw new Error("instance.encoding.fieldOrder is required");
    }
    if (encoding.abiTypes.length !== encoding.fieldOrder.length) {
        throw new Error("instance.encoding.abiTypes length must match fieldOrder length");
    }

    const abi = parseAbiParameters(encoding.abiTypes.join(","));
    const values = encoding.fieldOrder.map((field) => {
        if (!(field in params)) {
            throw new Error(`Missing required instance param: ${field}`);
        }
        const unit = encoding.units?.[field];
        return normalizeWithUnit(params[field], unit);
    });

    return encodeAbiParameters(abi, values);
}
