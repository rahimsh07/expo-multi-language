import { useLanguage } from "@/context/languageContext";
import { maskTextWithDots } from "@/utils";
import { getTranslatedText } from "@/utils/getTranslatedText";
import memoryCache from "@/utils/memoryCache";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useLiveTranslation = (key: string) => {
    const [text, setText] = useState(key);
    const [translating, setTranslating] = useState(false);
    const [hasTranslated, setHasTranslated] = useState(false);

    const { language } = useLanguage();

    useEffect(() => {
        if (language === 'en' || !key.trim()) {
            setText(key);
            return;
        }

        const cacheKey = `${key}_${language}`;
        if (memoryCache.has(cacheKey)) {
            setText(memoryCache.get(cacheKey) || key);
            return;
        }

        const controller = new AbortController();

        setTranslating(true);

        getTranslatedText(key, language, controller.signal)
            .then(t => {
                setText(t);
                setHasTranslated(true);
            })
            .finally(() => {
                setTranslating(false);
            });

        // 👇 abort when not visible / unmount / dependency change
        return () => {
            controller.abort();
        };
    }, [key, language]);

    return { text, translating, hasTranslated };
};

export const useTranslateLang = (key: string) => {
    const { language } = useLanguage();

    const { data, isFetching } = useQuery({
        queryKey: ['translate', key, language],
        queryFn: async () => getTranslatedText(key, language),
        staleTime: 1000 * 60 * 60 * 24,
        initialData: memoryCache.get(`${key}_${language}`) || undefined,
    });

    return { text: data || key, translating: isFetching };
};

export const useTranslateText = (key: string) => {
    const { text, translating } = useLiveTranslation(key);

    return translating ? maskTextWithDots(key) : text;
};