# multi-language (Expo)

A small Expo React Native app that demonstrates multi-language UI and runtime article translations.

Summary
- Static UI translations are provided via i18next in `i18n/locales/*/translation.json`.
- Dynamic article translation is performed at runtime using a local LibreTranslate instance and articles fetched from the Dev.to API.

Quick start
1. Install dependencies (PowerShell):
   bun install

   Note: this project includes a `bun.lock` file; Bun will use it to install exact versions.

2. Configure environment variables (project root `.env`):
   - EXPO_PUBLIC_ARTICLE_API_URL=https://dev.to/api/articles
   - EXPO_PUBLIC_LIBRE_TRANSLATE_API_URL=http://<LIBRE_HOST>:5000
   Replace `<LIBRE_HOST>` with your machine IP reachable from the device/emulator (e.g. `192.168.1.8`).

3. Start the app:
   bun run start

Architecture highlights
- Static translations: `i18n/index.ts` and `i18n/locales/*/translation.json` (i18next)
- Dynamic translation flow: `hooks/useLiveTranslation.ts`, `utils/getTranslatedText.ts`
- Language state/context: `context/languageContext.tsx`
- Article UI and rendering: `app/article/[articleId].tsx`, `app/translationText.tsx`
- Caching and query management: `utils/memoryCache.ts`, `utils/queryClient.ts`

Current known issues and notes
1. i18next vs dynamic translations
- i18next is used only for static translations (UI strings in locales JSON files).
- Dynamic translations (article bodies) are fetched from LibreTranslate at runtime and are not injected into the i18next store, so components that rely on i18next keys won't pick up translated article text automatically.
- Recommendation: inject dynamic translations into i18next at runtime or use a dedicated translation rendering component so both static and dynamic content are handled consistently.

2. LibreTranslate + Dev.to usage
- Dev.to articles are fetched from `EXPO_PUBLIC_ARTICLE_API_URL`.
- Translations are requested from your local LibreTranslate instance at `EXPO_PUBLIC_LIBRE_TRANSLATE_API_URL`.
- Common failure points: unreachable LibreTranslate host from device/emulator, wrong base URL, CORS or API path differences.

3. HTML rendering of translated articles
- Many articles contain HTML. The app currently attempts to render article bodies as plain text which breaks layout.
- Recommendation: use a proper HTML renderer for React Native / Expo (for web/native): `react-native-render-html`, `react-native-webview` (for complex content), or sanitize/strip HTML before rendering if you only need text.

4. Performance issues
- Observed causes:
  - Translating entire article bodies synchronously during render.
  - No batching or debounce when changing language or loading lists.
  - Inadequate caching leading to repeated translation requests.
- Suggestions:
  - Cache translations by (source text, source lang, target lang) in `memoryCache` or persistent storage (AsyncStorage).
  - Debounce language changes and batch translation requests for lists of articles.
  - Prefetch translations for summaries or popular articles.
  - Memoize heavy components (React.memo, useMemo, useCallback) and use FlatList virtualization for lists.
  - Offload heavy parsing/translation to a background worker or server-side job.

Troubleshooting checklist
- If translations fail:
  - Ensure `.env` values are correct and the device/emulator can reach `EXPO_PUBLIC_LIBRE_TRANSLATE_API_URL` (use machine LAN IP for physical devices).
  - Inspect LibreTranslate logs and ensure CORS is enabled and `/translate` endpoint is available.
  - Verify Dev.to API access and rate limits for `EXPO_PUBLIC_ARTICLE_API_URL`.
- If HTML appears raw or layout breaks:
  - Switch to an HTML renderer or sanitize HTML before display.
- If app is slow on language switch:
  - Profile renders and network calls; add caching and debounce.

Files to inspect / implement improvements
- hooks/useLiveTranslation.ts — dynamic translation hook
- utils/getTranslatedText.ts — translation request helper
- utils/memoryCache.ts — in-memory cache utility
- i18n/index.ts — i18next initialization (consider runtime injection)
- app/article/[articleId].tsx — article rendering and HTML handling
- app/translationText.tsx — where translated text is displayed

Recommended next steps
- Integrate dynamic translations into the i18next runtime store so components can use the same APIs for both static and dynamic strings.
- Replace plain-text article rendering with `react-native-render-html` (or similar) and ensure sanitized, styled output.
- Add persistent caching with expiry for translated content and batch/debounce translation requests.
- Improve error handling and show user-friendly UI states for translation/load failures.

If you want, I can implement any of the recommended changes (inject translated strings into i18next at runtime, add HTML rendering, or implement caching and batching).
