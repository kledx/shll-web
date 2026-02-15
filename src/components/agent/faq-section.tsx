"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FAQSection() {
    const { t } = useTranslation();
    const faqs = t.docs.faq.items;

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {t.docs.faq.title || "FAQ"}
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq: { q: string, a: string }, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`} className="rounded-xl border border-[var(--color-border)] bg-white/72 px-4">
                        <AccordionTrigger className="text-sm font-medium">{faq.q}</AccordionTrigger>
                        <AccordionContent className="text-[var(--color-muted-foreground)]">
                            {faq.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}
