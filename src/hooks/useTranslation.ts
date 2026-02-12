import { useLanguage } from "@/components/providers/language-provider";
import { en, zh } from "@/lib/i18n/dictionaries";

export function useTranslation() {
    const { language, setLanguage } = useLanguage();
    const dictionary = language === 'zh' ? zh : en;

    return {
        t: dictionary,
        language,
        setLanguage
    };
}
