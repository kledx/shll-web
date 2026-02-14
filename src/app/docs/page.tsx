"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, AlertTriangle, CircleHelp, ExternalLink, Rocket, ShieldCheck, Workflow } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { AppShell } from "@/components/ui/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("quickstart");
    const docs = t.docs;

    return (
        <AppShell>
            <div className="container max-w-6xl mx-auto py-12 px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif font-bold text-[var(--color-burgundy)] mb-3">{docs.title}</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{docs.subtitle}</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 max-w-3xl mx-auto">
                        <TabsTrigger value="quickstart">{docs.tabs.quickstart}</TabsTrigger>
                        <TabsTrigger value="runtime">{docs.tabs.runtime}</TabsTrigger>
                        <TabsTrigger value="security">{docs.tabs.security}</TabsTrigger>
                        <TabsTrigger value="faq">{docs.tabs.faq}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="quickstart" className="animate-in fade-in-50 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <Card className="lg:col-span-2 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[var(--color-burgundy)]">
                                        <Rocket className="w-5 h-5" />
                                        {docs.quickstart.intro}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.quickstart.prerequisitesTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {docs.quickstart.prerequisites.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {docs.quickstart.steps.map((step, index) => (
                                <Card key={index} className="flex flex-col h-full border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/50">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-serif text-[var(--color-burgundy)]">{step.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground">{step.desc}</p>
                                    </CardContent>
                                    <CardContent>
                                        <DocActionButton label={step.action} url={step.url} onAnchor={setActiveTab} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.quickstart.pathsTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 font-mono text-sm text-muted-foreground">
                                    {docs.quickstart.paths.map((path, idx) => (
                                        <li key={idx}>{path}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="runtime" className="animate-in fade-in-50 duration-300">
                        <Card className="mb-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[var(--color-burgundy)]">
                                    <Workflow className="w-5 h-5" />
                                    {docs.runtime.intro}
                                </CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="mb-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.runtime.actorsTitle}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {docs.runtime.actors.map((actor, idx) => (
                                    <div key={idx} className="rounded-md border border-[var(--color-burgundy)]/20 p-4">
                                        <h3 className="font-semibold text-[var(--color-burgundy)] mb-2">{actor.name}</h3>
                                        <p className="text-sm mb-2">{actor.responsibility}</p>
                                        <p className="text-xs text-muted-foreground">{actor.boundary}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="mb-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.runtime.conceptsTitle}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {docs.runtime.concepts.map((item, idx) => (
                                    <div key={idx} className="rounded-md border border-[var(--color-burgundy)]/20 p-4">
                                        <h3 className="font-semibold text-[var(--color-burgundy)] mb-2">{item.name}</h3>
                                        <p className="text-sm mb-2">{item.desc}</p>
                                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.runtime.actionFieldsTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {docs.runtime.actionFields.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.runtime.mappingTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="space-y-2 text-sm">
                                        {docs.runtime.mapping.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.runtime.flowTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="space-y-2 text-sm">
                                        {docs.runtime.flow.map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.runtime.multiTenantTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {docs.runtime.multiTenant.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.runtime.failureTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {docs.runtime.failures.map((item, idx) => (
                                        <li key={idx}>• {item}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="animate-in fade-in-50 duration-300">
                        <Card className="mb-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[var(--color-burgundy)]">
                                    <ShieldCheck className="w-5 h-5" />
                                    {docs.security.intro}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                {docs.security.promise}
                            </CardContent>
                        </Card>

                        <Card className="mb-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.security.diagramsTitle}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground mb-3">
                                {docs.security.diagramsDesc}
                            </CardContent>
                            <CardContent className="grid grid-cols-1 gap-4">
                                <div className="rounded-md border border-[var(--color-burgundy)]/20 p-3 bg-white">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <p className="text-sm font-semibold text-[var(--color-burgundy)]">{docs.security.executionDiagramTitle}</p>
                                        <a
                                            href="/docs/security-execution-flow.svg"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs underline text-[var(--color-burgundy)] hover:opacity-80"
                                        >
                                            Open Original
                                        </a>
                                    </div>
                                    <Image
                                        src="/docs/security-execution-flow.svg"
                                        alt={docs.security.executionDiagramAlt}
                                        width={1200}
                                        height={680}
                                        className="w-full h-auto rounded-sm"
                                    />
                                </div>
                                <div className="rounded-md border border-[var(--color-burgundy)]/20 p-3 bg-white">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <p className="text-sm font-semibold text-[var(--color-burgundy)]">{docs.security.architectureDiagramTitle}</p>
                                        <a
                                            href="/docs/security-architecture-layers.svg"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs underline text-[var(--color-burgundy)] hover:opacity-80"
                                        >
                                            Open Original
                                        </a>
                                    </div>
                                    <Image
                                        src="/docs/security-architecture-layers.svg"
                                        alt={docs.security.architectureDiagramAlt}
                                        width={1200}
                                        height={900}
                                        className="w-full h-auto rounded-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.security.problemsTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {docs.security.problems.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.security.actorsTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {docs.security.actors.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.security.architectureTitle}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {docs.security.architecture.map((layer, idx) => (
                                    <div key={idx} className="rounded-md border border-[var(--color-burgundy)]/20 p-4">
                                        <h3 className="font-semibold text-[var(--color-burgundy)] mb-2">{layer.title}</h3>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            {layer.points.map((point, pointIdx) => (
                                                <li key={pointIdx}>• {point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="mt-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.security.bapTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {docs.security.bap.map((item, idx) => (
                                        <li key={idx}>• {item}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="mt-6 border-green-300/40 bg-green-50/60">
                            <CardHeader>
                                <CardTitle className="text-green-800">{docs.security.invariantTitle}</CardTitle>
                            </CardHeader>
                            <CardContent className="font-mono text-sm text-green-900">{docs.security.invariant}</CardContent>
                        </Card>

                        <Card className="mt-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.security.executionTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="space-y-2 text-sm">
                                    {docs.security.execution.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ol>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.security.allowlistTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {docs.security.allowlist.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.security.constraintsTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {docs.security.constraints.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.security.runnerTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {docs.security.runner.map((item, idx) => (
                                        <li key={idx}>• {item}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="mt-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-burgundy)]">{docs.security.comparisonTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--color-burgundy)]/20 text-left">
                                                <th className="py-2 pr-3">{docs.security.comparisonColumns.dimension}</th>
                                                <th className="py-2 px-3">{docs.security.comparisonColumns.baseline}</th>
                                                <th className="py-2 pl-3">{docs.security.comparisonColumns.shll}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {docs.security.comparison.map((row, idx) => (
                                                <tr key={idx} className="border-b border-[var(--color-burgundy)]/10 align-top">
                                                    <td className="py-2 pr-3 font-medium">{row.dimension}</td>
                                                    <td className="py-2 px-3 text-muted-foreground">{row.baseline}</td>
                                                    <td className="py-2 pl-3">{row.shll}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.security.defendTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {docs.security.defend.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.security.limitsTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {docs.security.limits.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.security.userGuideTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {docs.security.userGuide.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-burgundy)]">{docs.security.developerGuideTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="space-y-2 text-sm">
                                        {docs.security.developerGuide.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-6 border-amber-400/40 bg-amber-50/70">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-800">
                                    <AlertTriangle className="w-5 h-5" />
                                    {docs.security.warningTitle}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-amber-900">{docs.security.warning}</CardContent>
                        </Card>

                        <Card className="mt-6 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/70">
                            <CardContent className="pt-6 text-sm text-[var(--color-burgundy)] font-medium">
                                {docs.security.promise}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="faq" className="animate-in fade-in-50 duration-300">
                        <Card className="border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[var(--color-burgundy)]">
                                    <CircleHelp className="w-5 h-5" />
                                    {docs.tabs.faq}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {docs.faq.items.map((item, idx) => (
                                    <div key={idx} className="rounded-md border border-[var(--color-burgundy)]/20 p-4">
                                        <h3 className="font-semibold mb-2">{item.q}</h3>
                                        <p className="text-sm text-muted-foreground">{item.a}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Card className="mt-8 border-[var(--color-burgundy)]/20 bg-[var(--color-paper)]/70">
                    <CardHeader>
                        <CardTitle className="text-[var(--color-burgundy)]">{docs.cta.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-muted-foreground text-sm md:max-w-2xl">{docs.cta.desc}</p>
                        <div className="flex gap-3">
                            <DocActionButton label={docs.cta.primaryAction} url={docs.cta.primaryUrl} onAnchor={setActiveTab} />
                            <DocActionButton label={docs.cta.secondaryAction} url={docs.cta.secondaryUrl} onAnchor={setActiveTab} variant="outline" />
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppShell>
    );
}

function DocActionButton({
    label,
    url,
    onAnchor,
    variant = "default",
}: {
    label: string;
    url: string;
    onAnchor: (id: string) => void;
    variant?: "default" | "outline";
}) {
    if (url.startsWith("#")) {
        return (
            <Button
                variant={variant}
                onClick={() => onAnchor(url.replace("#", ""))}
                className={variant === "default" ? "gap-2 bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90" : "gap-2"}
            >
                {label}
                <ArrowRight className="w-4 h-4" />
            </Button>
        );
    }

    if (url.startsWith("http")) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant={variant} className="gap-2">
                    {label}
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </a>
        );
    }

    return (
        <Link href={url}>
            <Button className={variant === "default" ? "gap-2 bg-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/90" : "gap-2"} variant={variant}>
                {label}
                <ArrowRight className="w-4 h-4" />
            </Button>
        </Link>
    );
}
