"use client";

import { cn } from "@/lib/utils";
import { Check, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { AppShell } from "@/components/ui/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useState } from "react";

export default function DocsPage() {
    const { t } = useTranslation();
    const thread = t.docs.thread;
    const guide = t.docs.guide;
    const [activeTab, setActiveTab] = useState("guide");

    // Helper to render content for architecture thread
    const renderContent = (content: string[] | string, id: number) => {
        if (typeof content === 'string') return <p>{content}</p>;

        if (id === 3) {
            const [intro, nfa, account, items, market] = content;
            return (
                <>
                    <p className="mb-4">{intro}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ContractCard text={nfa} icon="1️⃣" />
                        <ContractCard text={account} icon="2️⃣" />
                        <ContractCard text={items} icon="3️⃣" />
                        <ContractCard text={market} icon="4️⃣" />
                    </div>
                </>
            );
        }

        if (id === 6) {
            return (
                <>
                    <p className="font-bold text-lg">{content[0]}</p>
                    <p className="mt-2 text-[15px]">{parseMarkdown(content[1])}</p>
                    <div className="mt-4 space-y-3 text-[15px]">
                        <CheckItem text={content[2]} />
                        <CheckItem text={content[3]} />
                        <CheckItem text={content[4]} bold />
                    </div>
                    <p className="mt-4 text-sm opacity-80">{parseMarkdown(content[5])}</p>
                </>
            );
        }

        if (id === 8) {
            return (
                <>
                    <p className="font-bold text-lg">{parseMarkdown(content[0])}</p>
                    <p className="mt-2 text-sm opacity-80">{content[1]}</p>
                    <ol className="list-decimal list-inside mt-4 space-y-3 opacity-90 text-[15px]">
                        <li>{parseMarkdown(content[2])}</li>
                        <li className="pl-2 border-l-2 border-green-500/30">{content[3]}</li>
                        <li className="pl-2 border-l-2 border-green-500/30">{parseMarkdown(content[4])}</li>
                        <li className="pl-2 border-l-2 border-green-500/30">{content[5]}</li>
                        <li className="pl-2 border-l-2 border-green-500/30">{parseMarkdown(content[6])}</li>
                        <li>{content[7]}</li>
                        <li>{content[8]}</li>
                    </ol>
                </>
            );
        }

        if (id === 10) {
            return (
                <>
                    <p className="font-bold text-lg">{parseMarkdown(content[0])}</p>
                    <div className="mt-4 space-y-3">
                        <VisionItem emoji="🖥️" text={content[1]} />
                        <VisionItem emoji="📈" text={content[2]} />
                        <VisionItem emoji="🤖" text={content[3]} />
                    </div>
                    <p className="mt-6 font-serif italic text-lg text-center text-[var(--color-burgundy)]">
                        {content[4].replace('> ', '').replace(/'/g, '"')}
                    </p>
                </>
            )
        }

        if (id === 11) {
            return (
                <>
                    <p className="font-bold text-lg">{parseMarkdown(content[0])}</p>
                    <p className="mt-2 text-[15px]">{content[1]}</p>
                    <div className="flex gap-4 mt-6 justify-center">
                        <Link href="/">
                            <Button className="bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90 font-bold">
                                {content[2]}
                            </Button>
                        </Link>
                    </div>
                </>
            )
        }

        return (
            <div className="space-y-3">
                {content.map((line, idx) => {
                    if (line.startsWith("- ")) {
                        return <li key={idx} className="list-disc list-inside opacity-90 text-[15px]">{parseMarkdown(line.substring(2))}</li>;
                    }
                    if (line.startsWith("> ")) {
                        return <p key={idx} className="border-l-2 border-[var(--color-burgundy)] pl-4 italic opacity-80">{parseMarkdown(line.substring(2))}</p>;
                    }
                    if (idx === 0 && id !== 1) {
                        return <p key={idx} className="font-bold text-lg">{parseMarkdown(line)}</p>
                    }
                    return <p key={idx} className={idx === 0 ? "" : "text-[15px]"}>{parseMarkdown(line)}</p>;
                })}
            </div>
        );
    };

    return (
        <AppShell>
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-[var(--color-burgundy)] mb-4">{t.docs.title}</h1>
                    <p className="text-lg text-muted-foreground">{t.docs.subtitle}</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-12 max-w-md mx-auto">
                        <TabsTrigger value="guide">{t.docs.tabs?.guide || "User Guide"}</TabsTrigger>
                        <TabsTrigger value="architecture">{t.docs.tabs?.architecture || "Architecture"}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="guide" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <p className="text-muted-foreground text-lg">{guide?.intro}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {guide?.steps.map((step, index) => (
                                <Card key={index} className="flex flex-col h-full border-[var(--color-burgundy)]/10 hover:border-[var(--color-burgundy)]/30 transition-colors bg-[var(--color-paper)]/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-[var(--color-burgundy)] font-serif">{step.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground min-h-[3rem]">{parseMarkdown(step.desc)}</p>
                                    </CardContent>
                                    <CardFooter>
                                        {step.url ? (
                                            step.url === "#architecture" ? (
                                                <Button
                                                    onClick={() => setActiveTab("architecture")}
                                                    className="w-full gap-2 bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90"
                                                >
                                                    {step.action} <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            ) : step.url.startsWith('http') ? (
                                                <a href={step.url} target="_blank" rel="noopener noreferrer" className="w-full">
                                                    <Button variant="outline" className="w-full gap-2">
                                                        {step.action} <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </a>
                                            ) : (
                                                <Link href={step.url} className="w-full">
                                                    <Button className="w-full gap-2 bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90">
                                                        {step.action} <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            )
                                        ) : (
                                            <Button variant="ghost" disabled className="w-full gap-2 opacity-50 cursor-not-allowed">
                                                {step.action}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="architecture" className="animate-in fade-in-50 duration-500">
                        <div className="relative mt-8">
                            <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-[var(--color-burgundy)]/20 md:left-1/2 md:-ml-px"></div>

                            <div className="space-y-12">
                                {thread.map((item, index) => (
                                    <div key={item.id} className={cn(
                                        "relative flex items-start md:items-center",
                                        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    )}>
                                        <div className="absolute left-[11px] top-0 w-5 h-5 rounded-full border-4 border-[var(--color-paper)] bg-[var(--color-burgundy)] md:left-1/2 md:-ml-2.5 md:top-6 z-10 shrink-0 shadow-sm"></div>

                                        <div className={cn(
                                            "ml-12 md:ml-0 md:w-1/2 px-4",
                                            index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                                        )}>
                                            <div className={cn(
                                                "bg-[var(--color-paper)]/60 backdrop-blur-md p-6 rounded-lg border border-[var(--color-burgundy)]/10 shadow-sm hover:shadow-md transition-all duration-200",
                                                "text-left"
                                            )}>
                                                <div className="text-xs font-bold text-[var(--color-burgundy)]/60 mb-2 uppercase tracking-wide flex items-center gap-2">
                                                    <span>Part {item.id}/11</span>
                                                    <span className="h-px bg-[var(--color-burgundy)]/20 flex-1"></span>
                                                </div>
                                                <h3 className="text-lg font-bold text-[var(--color-burgundy)] mb-3">{item.title}</h3>
                                                <div className="text-[var(--color-dark-text)] leading-relaxed text-[15px]">
                                                    {renderContent(item.content, item.id)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden md:block md:w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-20 text-sm text-muted-foreground pb-12">
                            <p>© 2026 SHLL Protocol</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}

// --- Components & Helpers ---

function parseMarkdown(text: string) {
    if (!text) return text;
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index}>{part.slice(1, -1)}</code>;
        }
        return part;
    });
}

function ContractCard({ text, icon }: { text: string, icon: string }) {
    const [title, subtitle] = text.split('\n');
    return (
        <div className="bg-[var(--color-paper)] border border-[var(--color-burgundy)]/20 p-4 rounded shadow-sm hover:border-[var(--color-burgundy)]/40 transition-colors">
            <div className="font-bold text-[var(--color-burgundy)] mb-1">{icon} {title.replace(/\*\*/g, '')}</div>
            <div className="text-sm font-medium">{subtitle}</div>
        </div>
    )
}

function CheckItem({ text, bold }: { text: string, bold?: boolean }) {
    return (
        <div className={cn("flex items-start gap-2", bold && "font-bold text-[var(--color-burgundy)]")}>
            <Check className="w-5 h-5 text-green-600 shrink-0" />
            <span>{parseMarkdown(text)}</span>
        </div>
    )
}

function VisionItem({ emoji, text }: { emoji: string, text: string }) {
    const [title, desc] = text.split(': ');
    return (
        <div className="flex gap-3 items-start">
            <span className="text-xl shrink-0">{emoji}</span>
            <div>
                <span className="font-bold block">{parseMarkdown(title)}</span>
                <span className="text-sm opacity-70">{desc}</span>
            </div>
        </div>
    )
}
