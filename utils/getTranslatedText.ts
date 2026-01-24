import memoryCache from "./memoryCache";

export const getTranslatedText = async (
  key: string,
  language: string,
  signal?: AbortSignal
): Promise<string> => {
  if (!key.trim() || !language) return key;

  const cacheKey = `${key}_${language}`;

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) || key;
  }

  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_LIBRE_TRANSLATE_API_URL}/translate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal, // 👈 important
        body: JSON.stringify({
          q: key,
          source: "en",
          target: language,
          format: "text",
        }),
      }
    );

    const data = await res.json();
    const translated = data?.translatedText || key;

    memoryCache.set(cacheKey, translated);
    return translated;
  } catch (err: any) {
    if (err.name === "AbortError") {
      // request was cancelled → silently ignore
      return key;
    }
    return key;
  }
};

