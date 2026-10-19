# RTL (Arabic first)

Arabic is the default language. Design and check every screen in Arabic RTL first, then in English LTR. A popup, menu or icon that stays LTR in Arabic is a bug, not a detail.

## Native: how direction is set

Layout direction comes from `I18nManager`. The language module below sets it on launch and on every language switch. List `ar` in `supportedLocales` so iOS writes Arabic into `CFBundleLocalizations`. The device language does not set direction by itself.

1. **Config plugin** in `app.json`.

   ```json
   ["expo-localization", { "supportedLocales": { "ios": ["ar", "en"], "android": ["ar", "en"] } }]
   ```

   `supportsRTL` defaults to `true`. An Arabic-only app may also set `"forcesRTL": true` on that plugin (verify at use). The language module still runs.

2. **One language module**, `src/logic/i18n.tsx`. The app has a single `useLanguage()`. The default language is `ar`. Put strings in this module; screens call `t('…')`. **Port mode:** when the web app already has a language context and string files (for example `src/contexts/LanguageContext.tsx` + `src/locales/`), reuse those strings and adapt that context with a `.native.tsx` sibling that calls `applyDirection`; never create a second `useLanguage()`.

   ```tsx
   // src/logic/i18n.tsx
   import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
   import { applyDirection } from './direction';
   import { getItem, setItem } from './storage';

   type Language = 'ar' | 'en';
   const STRINGS: Record<Language, Record<string, string>> = { ar: {}, en: {} };

   type LanguageValue = {
     language: Language;
     t: (key: string) => string;
     setLanguage: (language: Language) => Promise<void>;
   };

   const LanguageContext = createContext<LanguageValue | null>(null);

   export function LanguageProvider({ children }: { children: ReactNode }) {
     const [language, setLanguageState] = useState<Language>('ar');

     useEffect(() => {
       let cancelled = false;
       (async () => {
         const saved = await getItem('language');
         const next: Language = saved === 'en' ? 'en' : 'ar';
         if (!cancelled) setLanguageState(next);
         await applyDirection(next);
       })();
       return () => {
         cancelled = true;
       };
     }, []);

     async function setLanguage(next: Language) {
       await setItem('language', next);
       setLanguageState(next);
       await applyDirection(next);
     }

     const t = (key: string) => STRINGS[language][key] ?? key;
     return <LanguageContext.Provider value={{ language, t, setLanguage }}>{children}</LanguageContext.Provider>;
   }

   export function useLanguage() {
     const value = useContext(LanguageContext);
     if (!value) throw new Error('useLanguage must sit inside LanguageProvider');
     return value;
   }
   ```

   Call `applyDirection` from that effect and from `setLanguage` only. Never call it during render. On launch it runs once: when `I18nManager.isRTL` already matches, it returns and does not reload.

3. **`applyDirection`** (Arabic ⇄ English). A direction change reloads the app. It does not work in Expo Go (Expo Go resets RTL preferences), so test in a development build.

   ```ts
   // src/logic/direction.ts  (iOS + Android)
   import { I18nManager } from 'react-native';
   import { reloadAppAsync } from 'expo';

   export async function applyDirection(language: 'ar' | 'en') {
     const rtl = language === 'ar';
     if (I18nManager.isRTL === rtl) return;
     I18nManager.allowRTL(rtl);
     I18nManager.forceRTL(rtl);
     await reloadAppAsync('language changed');
   }
   ```

   ```ts
   // src/logic/direction.web.ts
   export async function applyDirection(language: 'ar' | 'en') {
     document.documentElement.lang = language;
     document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
   }
   ```

   `reloadAppAsync` (from `expo`) reloads the current bundle in debug and release builds. `Updates.reloadAsync()` from `expo-updates` also works when that package is installed. The storage adapter's `getItem` / `setItem` are the only place the choice is saved (architecture.md).

4. **Navigation**: the root layout wraps the tree in `LanguageProvider`, then `LocaleProvider direction={I18nManager.isRTL ? 'rtl' : 'ltr'}` (from `expo-router`). `LocaleProvider` flips headers, push transitions and the back gesture. `I18nManager` flips the content.

5. **SwiftUI**: `Host` takes its `layoutDirection` from `I18nManager` by default. Leave the prop unset.

## Native layout rules

| Write | Instead of |
| --- | --- |
| `marginStart`, `marginEnd`, `marginInline` | `marginLeft`, `marginRight` |
| `paddingStart`, `paddingEnd`, `paddingInline` | `paddingLeft`, `paddingRight` |
| `start`, `end` (absolute position) | `left`, `right` |
| `borderStartWidth`, `borderTopStartRadius`, `borderBottomEndRadius` | `borderLeftWidth`, `borderTopLeftRadius`, … |
| `flexDirection: 'row'` (flips by itself) | `'row-reverse'` chosen by language |
| `align="start"` on the `Text` piece | `textAlign: 'right'` in a screen |
| shared icon names `*-forward` / `*-back` | `*-left` / `*-right` |

- **Text alignment**: `textAlign` does not flip with the layout. The `Text` piece converts `align` (`start` / `end` / `center`) into `left` / `right` from `I18nManager.isRTL`, so screens never pass `left` or `right`.
- **Mixed text**: an Arabic sentence with English words or numbers renders in Arabic order when its paragraph direction is RTL. The `Text` piece sets `writingDirection` from `I18nManager.isRTL` (`rtl` when the language module has applied Arabic, `ltr` after English).
- **What mirrors** (Apple HIG): back and forward arrows and chevrons, progress and sliders (system controls do it), lists and row order, icons that show motion or reading direction.
- **What never mirrors**: logos, photos and illustrations, media playback controls (`play`), checkmarks, clocks, digits inside a number (phone, ID, `541`).
- **Custom drawn direction** (a bar that fills, a step indicator): build it with a `Row` and logical props so it starts at the start edge by itself.
- **Third-party components** may ignore RTL. Check each one in the Arabic Simulator before you ship it; wrap fixes inside the piece that uses it.

## Numbers and dates

Web and native format through different engines (browser `Intl`, Hermes `Intl`), and `ar-SA` defaults can differ between them: `ar-SA` dates default to the Umm al-Qura (Hijri) calendar in browsers, and `ar-SA` numbers default to Eastern Arabic digits. Format only through one helper with explicit options, so both platforms print the same text:

```ts
// src/logic/format.ts
const numberFormat = new Intl.NumberFormat('ar-SA', { numberingSystem: 'latn' });
const dateFormat = new Intl.DateTimeFormat('ar-SA', { calendar: 'gregory', numberingSystem: 'latn', dateStyle: 'medium' });

export const formatNumber = (value: number) => numberFormat.format(value);
export const formatDate = (value: Date) => dateFormat.format(value);
```

Keep the choice the existing web app shows (Western or Eastern digits, Gregorian or Hijri) and write it in the app's `AGENTS.md`. Compare one Arabic date and one number on iOS and web screenshots; Hermes support for every `calendar` / `numberingSystem` value is verified at use.

## Web

- `<html lang="ar" dir="rtl">` (references/web-layer.md).
- Logical Tailwind classes only: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s`, `rounded-s-*`.
- Directional lucide icons: `rtl:-scale-x-100` (the `Icon` piece adds it for mirrored names).
- Radix popups follow `DirectionProvider` (`@radix-ui/react-direction`): wrap the web root in `<DirectionProvider dir={dir}>` so menus, selects and popovers open RTL. saudi-soft's RTL setup (`shadcn init --rtl`) covers the component side.

## RTL checklist

The reviewer runs every line and records what it saw (rules/review-checklist.md).

**iOS Simulator, Arabic** (launch with `xcrun simctl launch booted <bundle-id> -AppleLanguages "(ar)" -AppleLocale ar_SA`, or switch the in-app language):

1. The whole app is RTL: the first tab sits at the right edge of the tab bar.
2. Back button at the right, pointing right; the back swipe starts at the right edge.
3. Large titles and section headers align right.
4. List rows: icon at the right (start), chevron at the left pointing left.
5. Arabic paragraphs align right; mixed Arabic and English lines read in the right order; digits inside numbers keep their order.
6. Forms: labels, values, placeholders and the cursor start at the right.
7. Menus, context menus, sheets and alerts show Arabic labels aligned right.
8. Mirrored icons point the reading direction; logos, photos, play buttons, checkmarks and clocks do not flip.
9. Horizontal scrollers start at the right edge.
10. Progress bars, sliders and custom fill bars fill from the right.
11. Header buttons from `Stack.Toolbar placement="right"` sit at the trailing edge (the left in Arabic). Record what you see.
12. Dates and numbers match the web app's text.
13. Switching to English reloads the app in LTR; switching back restores RTL.

**Web, Arabic:**

14. `document.documentElement.dir` is `rtl` and `lang` is `ar`.
15. The sidebar sits at the right; the active item's pill is at its start edge.
16. Dropdowns, selects, popovers, sheets and toasts open RTL.
17. `grep -rnE '\b(ml|mr|pl|pr|left|right)-[0-9]|text-(left|right)\b' src --include='*.web.tsx'` finds nothing.

**Android (when Android starts):** lines 1–13 in an Arabic emulator.
