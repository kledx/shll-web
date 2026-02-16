"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PolicyManager } from "@/components/admin/policy-manager";
import { NfaManager } from "@/components/admin/nfa-manager";
import { ListingManagerPanel } from "@/components/admin/listing-manager";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Bot, ListPlus, LayoutDashboard } from "lucide-react";

export default function AdminPage() {
    return (
        <AppShell>
            <AdminGuard>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
                                Admin Panel
                            </h1>
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                                Contract management console
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="dashboard" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-sm">
                                <LayoutDashboard className="h-3.5 w-3.5" />
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="policy" className="flex items-center gap-1.5 text-sm">
                                <Shield className="h-3.5 w-3.5" />
                                PolicyGuard
                            </TabsTrigger>
                            <TabsTrigger value="nfa" className="flex items-center gap-1.5 text-sm">
                                <Bot className="h-3.5 w-3.5" />
                                AgentNFA
                            </TabsTrigger>
                            <TabsTrigger value="listing" className="flex items-center gap-1.5 text-sm">
                                <ListPlus className="h-3.5 w-3.5" />
                                Listings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard">
                            <AdminDashboard />
                        </TabsContent>
                        <TabsContent value="policy">
                            <PolicyManager />
                        </TabsContent>
                        <TabsContent value="nfa">
                            <NfaManager />
                        </TabsContent>
                        <TabsContent value="listing">
                            <ListingManagerPanel />
                        </TabsContent>
                    </Tabs>
                </div>
            </AdminGuard>
        </AppShell>
    );
}
