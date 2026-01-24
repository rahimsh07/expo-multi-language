import { languageCountryMap } from "@/constants";

export const getCountryByLang = (langCode: string): string => {
    let countyCode: string = languageCountryMap.find((item) => item.code === langCode)?.country || '';

    if (!countyCode) {
        // try generating the country code from the language code
        countyCode = langCode.toUpperCase();
    }

    return countyCode || 'IN';
}