
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Play, Terminal, ArrowRightLeft, Banknote } from "lucide-react";
import { Address, Hex, isAddress, isHex } from "viem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwapTemplate } from "./swap-template";
import { RepayTemplate } from "./repay-template";

export interface Action {
    target: Address;
    value: bigint;
    data: Hex;
}

interface ActionBuilderProps {
    onSimulate: (action: Action) => void;
    onExecute: (action: Action) => void;
    isSimulating: boolean;
    isExecuting: boolean;
    simulationResult: { success: boolean, data: Hex } | null;
    agentAccount?: Address;
}

export function ActionBuilder({
    onSimulate,
    onExecute,
    isSimulating,
    isExecuting,
    simulationResult,
    agentAccount
}: ActionBuilderProps) {

    const [target, setTarget] = useState<string>("");
    const [value, setValue] = useState<string>("0");
    const [data, setData] = useState<string>("0x");

    const isValid = isAddress(target) && isHex(data);

    const handleActionGenerated = (action: Action) => {
        setTarget(action.target);
        setValue(action.value.toString());
        setData(action.data);
    };

    const handleSimulate = () => {
        if (!isValid) return;
        onSimulate({
            target: target as Address,
            value: BigInt(value),
            data: data as Hex
        });
    };

    const handleExecute = () => {
        if (!isValid) return;
        onExecute({
            target: target as Address,
            value: BigInt(value),
            data: data as Hex
        });
    };

    return (
        <div className="space-y-6">
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Terminal className="w-5 h-5" /> Transaction Builder
                    </CardTitle>
                    <CardDescription>
                        Construct a raw transaction using templates or manually.
                        <br />
                        Agent Account: <span className="font-mono text-xs bg-muted px-1 rounded">{agentAccount || "Loading..."}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <Tabs defaultValue="swap" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="swap" className="gap-2"><ArrowRightLeft className="w-4 h-4" /> Swap</TabsTrigger>
                            <TabsTrigger value="repay" className="gap-2"><Banknote className="w-4 h-4" /> Repay</TabsTrigger>
                            <TabsTrigger value="raw" className="gap-2"><Terminal className="w-4 h-4" /> Raw</TabsTrigger>
                        </TabsList>

                        <TabsContent value="swap">
                            <SwapTemplate onActionGenerated={handleActionGenerated} agentAccount={agentAccount} />
                        </TabsContent>

                        <TabsContent value="repay">
                            {/* TODO: Pass real renter address */}
                            <RepayTemplate onActionGenerated={handleActionGenerated} renterAddress="0xYourAddress" />
                        </TabsContent>

                        <TabsContent value="raw">
                            <div className="p-4 border rounded-lg bg-[var(--color-paper)]/50 text-sm text-muted-foreground text-center">
                                Manual input mode active. Edit fields below directly.
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground">Preview Transaction</Label>
                            {isValid ? <span className="text-xs text-green-600">Valid</span> : <span className="text-xs text-red-600">Invalid</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Target Address</Label>
                            <Input
                                placeholder="0x..."
                                value={target}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Value (Wei)</Label>
                                <Input
                                    type="number"
                                    value={value}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Calldata (Hex)</Label>
                            <Textarea
                                placeholder="0x..."
                                value={data}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData(e.target.value)}
                                className="font-mono text-xs h-24"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <Button
                            variant="secondary"
                            onClick={handleSimulate}
                            disabled={!isValid || isSimulating || isExecuting}
                            className="flex-1"
                        >
                            {isSimulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            Simulate Call
                        </Button>

                        <Button
                            onClick={handleExecute}
                            disabled={!isValid || isSimulating || isExecuting || !simulationResult?.success}
                            className="flex-1 bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90"
                        >
                            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Execute On-Chain"}
                        </Button>
                    </div>

                    {simulationResult && (
                        <div className={`mt-4 p-4 rounded border ${simulationResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            <div className="font-bold mb-1">
                                {simulationResult.success ? "Simulation Success" : "Simulation Reverted"}
                            </div>
                            <div className="text-xs font-mono break-all opacity-80">
                                Return: {simulationResult.data}
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
