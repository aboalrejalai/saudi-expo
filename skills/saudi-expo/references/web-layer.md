# Web layer

On web the app is Saudi Soft: upstream shadcn/ui, Soft tokens, lucide, RTL. Every `.web.tsx` piece and web layout follows the **saudi-soft** skill (styling, forms, composition, icons, recipes). Load it before writing web files; install it with `npx skills add aboalrejalai/saudi-soft -a <agent>` if it is missing. This file covers only what Expo web changes.

## Setup (once per app)

1. **Bundler and output** in `app.json`:

   ```json
   { "expo": { "web": { "bundler": "metro", "output": "single" } } }
   ```

   SDK 58 switches to server output when `web.output` is unset, which needs a server host. Use `"single"` (one `index.html`, like a Vite SPA) for a signed-in app, `"static"` for public pages that need pre-rendered HTML, `"server"` only with a server host.

2. **Tailwind v4** (Expo's Tailwind guide):

   ```bash
   npx expo install tailwindcss @tailwindcss/postcss postcss --dev
   ```

   ```js
   // postcss.config.mjs
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   };
   ```

   ```css
   /* global.css */
   @import 'tailwindcss';
   ```

   Keep CSS enabled in Metro (the default; do not pass `isCSSEnabled: false`).

3. **Soft theme**: `node path/to/saudi-soft/scripts/apply-theme.js global.css` injects the theme bridge. The native twin of those values is `src/theme/tokens.ts`; the two change together.

4. **Import `global.css` once**, in the web root layout `src/app/_layout.web.tsx`. A DOM component (`'use dom'`) imports it again inside its own file, because it renders in a separate WebView document.

5. **shadcn components** live in `src/components/ui/` and are imported only by `.web.tsx` files. Run `npx shadcn@latest init`; if the CLI cannot detect the framework, write `components.json` by hand (`"tsx": true`, `"rsc": false`, `"tailwind": { "css": "global.css" }`, `"iconLibrary": "lucide"`, aliases `@/components`, `@/lib/utils`). Verify with a spike. In a monorepo, point the alias at the Vite app's existing `src/components/ui` instead of adding them twice.

6. **Fonts**: load IBM Plex Sans Arabic once for web (the Fontsource package for IBM Plex Sans Arabic imported in `_layout.web.tsx`, package name verified at use on fontsource.org; or a Google Fonts `<link>` in `+html.tsx` with static output), as saudi-soft describes. Native loads the font through `@expo-google-fonts/ibm-plex-sans-arabic`.

## Web root and direction

With `"static"` output, `src/app/+html.tsx` sets the document shell; put `lang` and `dir` on `<html>` there so the first paint is already RTL. Whether `"single"` output reads `+html.tsx` is not documented (verify at use); the root-layout effect below sets the same attributes in both modes.

```tsx
// src/app/+html.tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

When the user switches language, the web root layout updates `document.documentElement.lang`, `.dir` and the `.dark` class in an effect, and wraps the tree in `DirectionProvider` (references/rtl.md). That code is allowed because it sits in a `.web.tsx` file. `LanguageProvider` wraps the shell so `useLanguage()` has a provider above it.

```tsx
// src/app/_layout.web.tsx
import '../../global.css';
import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Toaster } from '@/components/ui/sonner';
import { ConfirmProvider, ToastProvider } from '@/pieces';
import { LanguageProvider, useLanguage } from '@/logic/i18n';

export default function RootWebLayout() {
  return (
    <LanguageProvider>
      <WebShell />
    </LanguageProvider>
  );
}

function WebShell() {
  const scheme = useColorScheme();
  const { language } = useLanguage();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = dir;
    root.classList.toggle('dark', scheme === 'dark');
  }, [language, scheme, dir]);
  return (
    <DirectionProvider dir={dir}>
      <ConfirmProvider>
        <ToastProvider>
          <Slot />
          <Toaster position="top-center" />
        </ToastProvider>
      </ConfirmProvider>
    </DirectionProvider>
  );
}
```

## Tabs layout on web: the Soft sidebar shell

NativeTabs falls back to a basic tab bar on web. Replace it with `src/app/(tabs)/_layout.web.tsx`, built from the saudi-soft **app shell** recipe (280 px sidebar, 64 px top bar, active pill), with `<Slot />` as the page area:

```tsx
// src/app/(tabs)/_layout.web.tsx
import { Slot, usePathname, useRouter } from 'expo-router';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarInset, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider,
} from '@/components/ui/sidebar';
import { Icon, type IconName } from '@/pieces';
import { useLanguage } from '@/logic/i18n';

const items: { href: string; label: string; icon: IconName }[] = [
  { href: '/home', label: 'tabs.home', icon: 'home' },
  { href: '/classes', label: 'tabs.classes', icon: 'book-open' },
  { href: '/search', label: 'tabs.search', icon: 'search' },
];

export default function TabsWebLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <SidebarProvider>
      <Sidebar side="right" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={pathname.startsWith(item.href)} onClick={() => router.push(item.href)}>
                    <Icon name={item.icon} />
                    <span>{t(item.label)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Slot />
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- `side="right"` puts the sidebar at the start edge in Arabic; use `"left"` for an LTR-only app.
- Navigation uses `router.push`; `Link asChild` inside shadcn `asChild` components is unproven on Expo web (verify with a spike before switching to it).
- Each tab folder gets a one-line `_layout.web.tsx` (`export { Slot as default } from 'expo-router';`) so the native `Stack` header does not render inside the Soft shell. Pages show their title through `Screen.web.tsx`.
- Expo's documented alternative is headless `Tabs` / `TabList` / `TabTrigger` / `TabSlot` from `expo-router/ui`; use it when tab state must survive switching.

## Web files: what is allowed

`.web.tsx` files (pieces, layouts, screen variants) may use DOM elements, `className`, shadcn, Radix, `lucide-react`, `sonner`, `window`, `document` and `localStorage`. `check-shared.js` skips them.

A web file still imports logic hooks and pieces like any other file; data access is never copied into it.

React Native elements (`View`, `Text`) on web do not take `className`. Inside a web file, use DOM elements for Soft styling. If a web file must style an RN element, Expo's documented escape is `style={{ $$css: true, _: 'bg-muted rounded-xl' }}`.

## DOM components (`'use dom'`): the closed list

A DOM component renders real web code inside a WebView on iOS and Android. Use one only for:

1. the `Chart` piece's default (Android) file, and its iOS file until the Swift Charts module exists;
2. rich text and Markdown (help articles, long formatted content);
3. a third-party web embed with no native piece yet (a video or map embed, math rendering).

Forms, lists, navigation, buttons and screens are never DOM components.

Rules for each DOM component:

- `'use dom';` is the first statement of the file; the native side imports it like a component.
- Props are serializable (`string`, `number`, `boolean`, `null`, arrays, plain objects). Functions are top-level async props only; they cannot return values synchronously.
- It takes no `children` and no native views, and it cannot read native React context: pass data as props.
- Size it with `dom={{ matchContents: true }}` or an explicit height.
- It starts slower than native code (plain JS, not Hermes bytecode); keep it off the first screen when you can.

## React Native Reusables

React Native Reusables (a shadcn port for React Native on NativeWind or Uniwind) is not part of this architecture: native pieces render SwiftUI and Compose, and its NativeWind v5 / Tailwind v4 support is unconfirmed. Use it only when the owner asks for it.
