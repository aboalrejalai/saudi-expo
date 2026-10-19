# Architecture

How a Saudi Expo app is laid out, which file may import what, and how Metro picks platform files. Facts marked **verify with a spike** come from a working pattern, not from Expo's docs: prove them in a throwaway branch before you build on them.

## The three layers

| Layer | Folder | Holds | Written |
| --- | --- | --- | --- |
| 1. Logic | `src/logic/` (or the web app's `src/`, see Monorepo) | Supabase client, TanStack Query hooks, types, i18n strings, validation, formatting | once, for every platform |
| 2. Screens | `src/screens/<feature>/` | one component per screen, built from pieces | once; a variant file only under the variant rule |
| 3. Pieces | `src/pieces/<Piece>/` | the design system: one contract, one file per platform | once per platform, only when a piece is new or changes |

A new feature is a new screen made of existing pieces. Per-platform work happens only when the feature needs a piece that does not exist yet.

## Folder layout (standalone app)

```
<app>/
  app.json                      expo config: plugins, supportedLocales, web.output
  metro.config.js               only when the monorepo section applies
  global.css                    web only: Tailwind + Saudi Soft theme bridge
  postcss.config.mjs            web only
  modules/                      local Expo modules (Swift), one per Apple framework
    pdf-viewer/
  src/
    app/                        routes only (Expo Router). Nothing else lives here.
      _layout.tsx               root: providers + Stack (iOS, Android)
      _layout.web.tsx           root: providers + Stack or Slot (web)
      (tabs)/_layout.tsx        NativeTabs (iOS, Android)
      (tabs)/_layout.web.tsx    Soft sidebar shell + Slot (web)
      (tabs)/home/_layout.tsx   Stack for this tab (iOS, Android)
      (tabs)/home/_layout.web.tsx  Slot only (web-layer.md)
      (tabs)/home/index.tsx     export { default } from '@/screens/home/HomeScreen'
      (tabs)/classes/_layout.tsx  Stack, same shape as home
      (tabs)/classes/_layout.web.tsx  Slot only
      (tabs)/classes/index.tsx  re-export the classes screen
      (tabs)/search/_layout.tsx Stack, same shape as home
      (tabs)/search/_layout.web.tsx  Slot only
      (tabs)/search/index.tsx   re-export the search screen
    screens/
      home/HomeScreen.tsx
      grades/GradebookScreen.tsx
      grades/GradebookScreen.web.tsx   variant (rare, see below)
    pieces/
      index.ts                  the barrel: the closed vocabulary screens import
      Button/
        Button.types.ts         contract (props type); no platform imports
        Button.tsx              default: Android and any platform without its own file
        Button.ios.tsx          iOS: SwiftUI through @expo/ui
        Button.web.tsx          web: shadcn/ui (saudi-soft)
      Icon/icon-map.ts          shared icon names (references/icons.md)
      _shared/                  piece internals: EnsureHost, useTokens, useSizeClass
    logic/
      storage.ts                native implementation (AsyncStorage); getItem / setItem
      storage.web.ts            web implementation (localStorage); same two functions
    theme/tokens.ts             copy of references/tokens.ts
```

Expo's current docs put routes in `src/app/`. A project that already has `app/` at the root keeps it; everything else in this skill stays the same.

### Route files

A route file re-exports a screen and nothing more:

```tsx
// src/app/(tabs)/home/index.tsx
export { default } from '@/screens/home/HomeScreen';
```

Each tab is a folder with its own `Stack` (`(tabs)/home/_layout.tsx` renders `<Stack />`). The trigger `name` matches the folder name, and the web sidebar links to that path (`/home`). `(tabs)/home/_layout.web.tsx` re-exports `Slot` so the native header stays out of the Soft shell.

Inside `src/app`, a platform file (`about.web.tsx`) works only when the plain file (`about.tsx`) also exists, so every route stays universal for deep links. Keep platform files for screens in `src/screens`, not in `src/app`, except `_layout.web.tsx`.

### Root layout

```tsx
// src/app/_layout.tsx  (iOS + Android)
import { useEffect } from 'react';
import { Stack, ThemeProvider, DarkTheme, DefaultTheme, LocaleProvider } from 'expo-router';
import { I18nManager, useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@expo-google-fonts/ibm-plex-sans-arabic/useFonts';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold';
import { IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic/700Bold';
import { ToastProvider, ConfirmProvider } from '@/pieces';
import { LanguageProvider } from '@/logic/i18n';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync(); // verify at use

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync(); // verify at use
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const palette = colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.card,
      text: palette.foreground,
      border: palette.border,
    },
  };

  return (
    <LanguageProvider>
      <LocaleProvider direction={I18nManager.isRTL ? 'rtl' : 'ltr'}>
        <ThemeProvider value={theme}>
          <ConfirmProvider>
            <ToastProvider>
              <Stack />
            </ToastProvider>
          </ConfirmProvider>
        </ThemeProvider>
      </LocaleProvider>
    </LanguageProvider>
  );
}
```

Keep the splash up until the fonts load. A font error hides the splash and renders with the system font, so the tree is never stuck on `return null`. `preventAutoHideAsync` and `hideAsync` are `expo-splash-screen` (verify at use). `text` is the navigation theme key for the `foreground` token; `background` is `colors.background`, so the surface behind screens matches Soft in light and dark. `ThemeProvider` with `DarkTheme` / `DefaultTheme` also stops the white flash between native tabs on iOS 26+. `LanguageProvider` and `LocaleProvider` are the RTL startup (references/rtl.md). Add the app's own providers (TanStack `QueryClientProvider`, auth) around `ThemeProvider`.

## Piece anatomy

Every piece folder holds:

| File | Required | Runs on | May import |
| --- | --- | --- | --- |
| `<Piece>.types.ts` | yes | everywhere (types only) | other `*.types.ts`, `icon-map.ts`, `tokens.ts` |
| `<Piece>.tsx` | yes | Android, and iOS/web when their file is missing | `react-native`, universal `@expo/ui`, `@expo/ui/jetpack-compose`, `expo-symbols`, `expo-image`, `react-native-reanimated`, `_shared/*`, `tokens.ts` |
| `<Piece>.ios.tsx` | when iOS differs | iOS | the default list plus `@expo/ui/swift-ui`, `@expo/ui/swift-ui/modifiers`, `expo-glass-effect`, local modules |
| `<Piece>.web.tsx` | when web differs | web | shadcn files (`@/components/ui/*`), `lucide-react`, Radix, `sonner`, DOM elements, `className` |

Contract first. Every platform file exports the same names with the props type from `<Piece>.types.ts`:

```ts
// src/pieces/Button/Button.types.ts
import type { IconName } from '../Icon/icon-map';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'plain';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant; // default 'primary'
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};
```

```tsx
// src/pieces/Button/Button.web.tsx
import { Button as UiButton } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Icon } from '../Icon/Icon';
import type { ButtonProps } from './Button.types';

const variantMap = { primary: 'default', secondary: 'outline', destructive: 'destructive', plain: 'ghost' } as const;

export function Button({ label, onPress, variant = 'primary', icon, disabled, loading, fullWidth }: ButtonProps) {
  return (
    <UiButton variant={variantMap[variant]} onClick={onPress} disabled={disabled || loading} className={fullWidth ? 'w-full' : undefined}>
      {loading ? <Spinner data-icon="inline-start" /> : icon ? <Icon name={icon} data-icon="inline-start" /> : null}
      {label}
    </UiButton>
  );
}
```

The iOS and default files for the same piece are in references/pieces.md. The default tsconfig type-checks the plain `<Piece>.tsx`; `tsconfig.ios.json` and `tsconfig.web.json` typecheck the platform files (rules/review-checklist.md). A platform file that drifts from the contract only fails if you annotate it: write `export function Button(props: ButtonProps)` in every file.

The barrel lists every piece once; screens import only from it:

```ts
// src/pieces/index.ts
export { Button } from './Button/Button';
export type { ButtonProps } from './Button/Button.types';
export { Icon } from './Icon/Icon';
export type { IconName } from './Icon/icon-map';
// … one line pair per piece
```

### Piece internals (`src/pieces/_shared/`)

- `useTokens()` returns `{ scheme, colors: colors[scheme], spacing, radius, fontFamily, fontSize, shadow: shadow[scheme] }` from `useColorScheme()`. Pieces read colors only through it.
- `useSizeClass()` returns `'compact'` below `layout.regularMinWidth` (768) window width, else `'regular'` (from `useWindowDimensions`).
- `EnsureHost` (iOS): SwiftUI views from `@expo/ui` must sit inside a `Host`. `Form` and `List` pieces render one `Host` and provide a React context; field pieces read it and wrap themselves in `<Host matchContents>` only when no parent `Host` exists. One `Host` per form, not one per field.

```tsx
// src/pieces/_shared/EnsureHost.ios.tsx
import { createContext, useContext, type ReactNode } from 'react';
import { Host } from '@expo/ui/swift-ui';

const InHost = createContext(false);

export function HostRoot({ children }: { children: ReactNode }) {
  return (
    <Host style={{ flex: 1 }}>
      <InHost.Provider value>{children}</InHost.Provider>
    </Host>
  );
}

export function EnsureHost({ children }: { children: ReactNode }) {
  if (useContext(InHost)) return <>{children}</>;
  return (
    <Host matchContents>
      <InHost.Provider value>{children}</InHost.Provider>
    </Host>
  );
}
```

Ship a default `EnsureHost.tsx` that does the same with the universal `Host` from `@expo/ui`, so Android pieces share the pattern.

## Platform-extension resolution (verified, Expo SDK 58)

Metro tries extensions in this order: `ts, tsx, mjs, js, jsx, json, …`. For each extension it tries the platform file, then `.native` (iOS and Android only, never web), then the plain file, and only then moves to the next extension.

| Platform | Order for `import { Button } from './Button'` |
| --- | --- |
| iOS | `Button.ios.ts` → `Button.native.ts` → `Button.ts` → `Button.ios.tsx` → `Button.native.tsx` → `Button.tsx` → … |
| Android | `Button.android.ts` → `Button.native.ts` → `Button.ts` → `Button.android.tsx` → … → `Button.tsx` |
| Web | `Button.web.ts` → `Button.ts` → `Button.web.tsx` → `Button.tsx` |
| TypeScript (default `tsc`) | `Button.ts` → `Button.tsx` → `Button.d.ts` (`.ios` and `.web` files are invisible to it) |

Two rules follow:

1. **One extension per group.** `Button.ts` next to `Button.ios.tsx` hides the iOS file on iOS. Give every platform file of a piece the same extension (`.tsx` for components, `.ts` for adapters). The contract is `Button.types.ts`, a different base name, so it never collides. `check-shared.js` reports `resolution-collision`.
2. **Import the base path.** `import { Button } from './Button'`, never `'./Button.ios'`.

The default `tsc` resolves the plain file, so `.ios.tsx` and `.web.tsx` stay unchecked. Typecheck them with `tsconfig.ios.json` and `tsconfig.web.json` (rules/review-checklist.md). Annotate every platform file with the contract props (`export function Button(props: ButtonProps)`), or a drifted file still typechecks as untyped.

## Import rules

| From | May import | Imports nothing from |
| --- | --- | --- |
| route files (`src/app`) | screens; in layouts also `expo-router`, `expo-router/native-tabs`, `expo-router/ui`, pieces, `tokens.ts`, the i18n hook | data hooks (data belongs to screens) |
| screens | `@/pieces`, logic hooks, `expo-router` (`Link`, `useRouter`, `useLocalSearchParams`, `useFocusEffect`), React | `react-native` UI, `@expo/ui`, `expo-glass-effect`, `expo-symbols`, `Platform`, any web library |
| piece files | see Piece anatomy | screens, routes |
| logic | its own files, `@supabase/supabase-js`, `@tanstack/react-query`, `tokens.ts`, adapters | pieces, screens, `react-native` UI |

`check-shared.js` enforces the shared-file half of this table, and it applies the screen denylist to route files in `src/app` and `app`. A route file re-exports a screen. A layout file hosts the navigator. Neither file builds UI from React Native or the DOM.

## Size classes, not devices

iPad windows resize, and apps built with the iOS 27 SDK are resizable on iPhone too; `requireFullScreen` no longer opts out. Choose layout by window width:

- `useSizeClass() === 'compact'`: one column, list rows, sheets.
- `'regular'`: two or three columns, sidebar (NativeTabs `sidebarAdaptable`), split views.

Never branch on `Platform.isPad` or a device model. Pieces such as `Grid` and `DataTable` read the size class themselves, so most screens never ask.

## Screen variants (the 10–15% rule)

A screen gets a platform variant only when one of these holds:

1. **Dense desktop table**: more than 6 columns edited in place (gradebook, attendance sheet, timetable grid). Make `XScreen.web.tsx` with shadcn `Table`.
2. **Print or export layout**: a page that is printed or saved as PDF from the browser.
3. **Regular-width layout that pieces cannot express**: put a second component `XScreen.regular.tsx` (a plain file, not a platform extension) next to the screen and choose it inside `XScreen.tsx` with `useSizeClass()`.

Every variant:

- calls the same logic hook as the shared screen; data loading and mutations are never copied.
- starts with a one-line comment naming the rule it uses: `// variant: dense desktop table (rule 1)`.
- on iPhone falls back to the shared screen (list rows that open a detail screen).

Everything else is one shared screen.

## Logic adapters

Web-only APIs sit behind an adapter: one module name, two files.

| Concern | Native file | Web file |
| --- | --- | --- |
| key-value storage | `storage.ts`: `@react-native-async-storage/async-storage`, exports `getItem(key)` and `setItem(key, value)` | `storage.web.ts`: `localStorage`, same two functions |
| secrets (tokens) | `secureStore.ts`: `expo-secure-store` | `secureStore.web.ts`: in-memory or `localStorage` (state the trade-off) |
| env vars | `env.ts`: `process.env.EXPO_PUBLIC_*` | (same file works on Expo web) |
| clipboard, share, files | `expo-clipboard`, `expo-sharing`, `expo-file-system` | browser APIs in `.web.ts` |
| toasts | the Toast piece (`useToast`) | the Toast piece |
| navigation | `expo-router` | `expo-router` |

Read env vars as `process.env.EXPO_PUBLIC_NAME`, written out in full: Expo inlines only static dot access, so destructuring does not work. `EXPO_PUBLIC_*` values ship inside the app in plain text; service-role keys never go there. SDK 58 loads only `.env`, `.env.local`, `.env.<mode>` and `.env.<mode>.local`.

The Supabase client on native needs a storage adapter for the session (`auth.storage`) and `detectSessionInUrl: false`; follow Supabase's Expo quickstart for the exact options (verify at use).

## Monorepo: Expo app next to an existing Vite web app

Use this when an Expo app joins a repo whose web app (Vite + React + shadcn) already holds the logic in `src/`. **Verify with a spike**: Expo's monorepo guide covers npm/pnpm/yarn/bun workspaces only; the layout below is a non-workspace pattern that has worked in the owner's repos.

```
repo/
  src/                 Vite web app (owns the logic: hooks, Supabase, types, i18n)
  apps/mobile/         Expo app (screens, pieces, routes, its own node_modules)
```

1. **Watch only the shared folders.** In `apps/mobile/metro.config.js` set `config.watchFolders` to the shared logic folders (for example `repo/src/hooks`, `repo/src/lib`, `repo/src/integrations`), not the repo root, so Metro does not crawl the web app.
2. **One React copy.** Set `config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')]` and add the repo-root `node_modules` to `config.resolver.blockList`. Files outside the app resolve their imports from the app's `node_modules` through a `resolveRequest` that sets `disableHierarchicalLookup: true` for origins under the shared folders. Two React copies crash at runtime ("Invalid hook call"); `npm why react` inside `apps/mobile` must show one version.
3. **Aliases.** Shared files keep their `@/` imports. In the Expo app, point `@/` at `repo/src` (tsconfig `paths` + the `resolveRequest`), and give the Expo app's own folders a second alias such as `@app/` (`@app/pieces`, `@app/screens`). Then run `check-shared.js` with `--screens src/screens --pieces src/pieces --routes src/app` plus one `--logic` per shared folder (the same folders as `watchFolders`, for example `--logic ../../src/hooks`), so it checks exactly the web app's files that the Expo app loads. Passing any folder flag replaces the defaults, so include `--routes` or the route files go unscanned.
4. **Override web-only files with `.native.ts`.** The Vite app owns `storage.ts` (web). Add `storage.native.ts` next to it: Vite ignores it, Metro on iOS/Android picks it, Expo web keeps `storage.ts`. `check-shared.js` treats a plain file with a `.native` sibling as a web file and skips it.
5. **Env vars.** Vite code reads `import.meta.env.VITE_*`, which Metro does not provide. Move the reads into `env.ts` (Vite) and add `env.native.ts` plus `env.web.ts` reading `process.env.EXPO_PUBLIC_*` for the Expo app.
6. **Keep the web app's typecheck green.** The web app's `tsconfig` sees the new `.native.ts` files; exclude `**/*.native.ts` and `**/*.native.tsx` there, or its `tsc` fails on React Native imports.

Example `resolveRequest` shape (spike first):

```js
// apps/mobile/metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '../..');
const sharedRoot = path.resolve(repoRoot, 'src');
const appModules = path.resolve(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [path.join(sharedRoot, 'hooks'), path.join(sharedRoot, 'lib'), path.join(sharedRoot, 'integrations')];
config.resolver.nodeModulesPaths = [appModules];
config.resolver.blockList = [new RegExp(`^${path.join(repoRoot, 'node_modules').replace(/[/\\]/g, '[/\\\\]')}[/\\\\].*`)];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    return context.resolveRequest(context, path.join(sharedRoot, moduleName.slice(2)), platform);
  }
  if (moduleName.startsWith('@app/')) {
    return context.resolveRequest(context, path.join(projectRoot, 'src', moduleName.slice(5)), platform);
  }
  const origin = context.originModulePath ?? '';
  if (origin.startsWith(sharedRoot + path.sep)) {
    return context.resolveRequest({ ...context, nodeModulesPaths: [appModules], disableHierarchicalLookup: true }, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
```

## SDK versions

This skill targets Expo SDK 58 (React Native 0.88, iOS 27 SDK, deployment target iOS 16.4). On SDK 55–57, native tabs import from `expo-router/unstable-native-tabs`; everything else here may differ, so read the versioned docs for that SDK. macOS is not a target in SDK 58.
