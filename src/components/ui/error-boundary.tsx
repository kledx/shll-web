"use client";

import React from "react";

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[ErrorBoundary]", error, errorInfo);
    }

    private getLocale(): "en" | "zh" {
        if (typeof window === "undefined") return "en";
        return window.localStorage.getItem("shll-language") === "zh" ? "zh" : "en";
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const zh = this.getLocale() === "zh";
            const title = zh ? "页面发生错误" : "Something went wrong";
            const message = zh ? "发生了未预期错误。" : "An unexpected error occurred.";
            const retry = zh ? "重试" : "Try Again";

            return (
                <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <span className="text-2xl text-red-700">!</span>
                    </div>
                    <h2 className="text-xl font-serif font-bold text-[var(--color-burgundy)]">{title}</h2>
                    <p className="max-w-md text-sm text-muted-foreground">{this.state.error?.message || message}</p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="rounded-md bg-[var(--color-burgundy)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        {retry}
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
