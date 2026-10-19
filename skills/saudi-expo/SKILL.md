---
name: saudi-expo
description: >
  Builds Expo / React Native apps under the Saudi Soft identity that feel like
  native Swift apps on iPhone and iPad (NativeTabs, Liquid Glass, SF Symbols,
  SwiftUI through @expo/ui, Apple frameworks through local Swift modules), keep
  shadcn/ui on the web, and add Android later without rewriting screens. Use
  when creating or changing an Expo app with Soft colors or Arabic RTL; making
  an Expo screen look native on iOS or iPad; converting a React/shadcn web page
  into an Expo screen; adding or changing a piece (a shared component with iOS,
  web and Android files); wrapping PDFKit, VisionKit, PencilKit or Swift
  Charts; or planning iOS and web now with Android later.
user-invocable: true
allowed-tools: Bash(npx expo install *), Bash(npx expo-doctor*), Bash(npx tsc --noEmit*)
---

# Saudi Expo

One Expo app, three platforms, one identity. iPhone and iPad lead: the app must feel like a Swift app built with SwiftUI, where the system draws tabs, bars, sheets, menus and Liquid Glass, and the app draws only content, in Saudi Soft tokens. The web build is Saudi Soft shadcn/ui. Android inherits every screen when the owner asks for it.

Targets Expo SDK 58 (React Native 0.88, built for the iOS 27 SDK, deployment target iOS 16.4). Web files follow the **saudi-soft** skill; install it with `npx skills add aboalrejalai/saudi-soft -a <agent>` if it is missing.

Checker script, run from the app root:

```bash
node path/to/saudi-expo/scripts/check-shared.js
```

## The three layers

1. **Logic** (`src/logic/`): Supabase, TanStack Query hooks, types, i18n strings, validation, formatting. One copy for every platform. Web-only APIs (`localStorage`, `window`, `import.meta.env`, toast libraries) sit behind **adapters**: one module name, a plain file plus a `.web.ts` (or `.native.ts`) sibling.
2. **Screens** (`src/screens/<feature>/`): written once from pieces. A **shared file** (every screen, logic and piece file except `.web.tsx` and DOM components) contains no DOM tags, `className`, `lucide-react`, `@radix-ui/*`, `react-router-dom`, `window.`, `document.` or `localStorage`.
3. **Pieces** (`src/pieces/<Piece>/`): the design system. One **contract** (`<Piece>.types.ts`) and one file per platform, picked by Metro: `<Piece>.ios.tsx` (SwiftUI through `@expo/ui`), `<Piece>.web.tsx` (shadcn/ui), `<Piece>.tsx` (default: Android and any platform without its own file). Changing one platform file never touches another.

A new feature is a new screen made of existing pieces. Only a missing piece needs per-platform work.

Folder layout, piece anatomy, resolution order, import rules and the monorepo setup: [references/architecture.md](references/architecture.md).

## Golden rules

1. **Screens import pieces only.** A screen imports from `@/pieces`, logic hooks, React, and `expo-router` (`Link`, `useRouter`, `useLocalSearchParams`, `useFocusEffect`). `check-shared.js` fails on React Native UI, `@expo/ui`, `expo-glass-effect`, `Platform.OS` and web libraries in screens and in route files (`src/app` or `app`).
2. **Every visual need is a catalog piece** ([references/pieces.md](references/pieces.md)). A need with no piece becomes a new piece ("Add a piece" workflow), so platform UI stays out of screens.
3. **The system draws the chrome**: `NativeTabs`, native `Stack` headers with large titles on tab roots, `Stack.Toolbar`, `Stack.SearchBar`, `formSheet` routes, native menus and alerts. The app draws content.
4. **Glass only on floating controls over content**, one layer deep. Cards, rows, tiles and backgrounds stay solid, drawn with tokens.
5. **Brand green is the tint** (`#1B8354`, dark `#3DAF6E`): tab tint, button tint, theme primary. Colors come from `src/theme/tokens.ts` on native and the Soft CSS bridge on web; system bars and glass keep their system look.
6. **Arabic first.** Logical props (`marginStart`, `paddingEnd`, `ms-*`), `-forward` / `-back` icon names, alignment through the `Text` piece, and every screen checked in Arabic ([references/rtl.md](references/rtl.md)).
7. **One shared icon name per concept**, mapped to SF Symbol, Material Symbol and lucide in `icon-map.ts` ([references/icons.md](references/icons.md)).
8. **Text lives in `Text` and `Heading`**, strings come from i18n, content uses IBM Plex Sans Arabic, and system chrome keeps Apple's font.
9. **Layout follows the size class** (window width: compact below 768, regular from 768), never the device model. iPad and iOS 27 iPhone windows resize.
10. **A screen variant** (`XScreen.web.tsx`, `XScreen.regular.tsx`) exists only under the variant rule (architecture.md) and calls the same logic hook as the shared screen.
11. **Write only proven APIs.** Every Expo or Apple API name comes from these references or from the package's `.d.ts` in `node_modules`. Mark anything else `// verify at use`, then prove it with `npx tsc --noEmit` and a Simulator run.
12. **A new package needs a reason**: install it with `npx expo install <name>` and give one line in the hand-off on why no existing piece or package covers it.

## Evaluate first

```bash
cat package.json                       # expo version, existing UI libraries
ls src/app app src/screens src/pieces  # which layers exist
npx expo config --type public --json   # plugins, web.output, supportedLocales
```

| Mode | When | Do |
| --- | --- | --- |
| **New** | no `expo` dependency | the "New app" workflow |
| **Layer** | Expo app without `src/pieces` | "New app" steps 2–7 inside the existing app, then "Write a screen" |
| **Feature** | Expo app with pieces | "Write a screen"; "Add a piece" for each missing piece |
| **Port** | porting pages from an existing React web app | [references/converting-web-screens.md](references/converting-web-screens.md); the Monorepo section of architecture.md when the Expo app sits next to the web app |
| **Ask** | Expo SDK below 58, or the app has its own non-Soft design system | ask the owner before changing structure or identity |

## Workflow: New app

1. `npx create-expo-app@latest <name>` (Expo Router + TypeScript). Confirm `expo` is `~58`.
2. Install the core set, each used by a piece: `npx expo install @expo/ui expo-symbols expo-glass-effect expo-localization expo-haptics expo-image expo-splash-screen @expo-google-fonts/ibm-plex-sans-arabic @react-native-async-storage/async-storage`.
3. Copy `references/tokens.ts` to `src/theme/tokens.ts`.
4. `app.json`: `expo-localization` plugin with `supportedLocales` including `ar`; `"orientation": "default"`; `"ios": { "supportsTablet": true }`; `"userInterfaceStyle": "automatic"`; `web.output` set (web-layer.md). RTL startup and `useLanguage()`: [references/rtl.md](references/rtl.md) (default `ar`).
5. Layouts: root `_layout.tsx` (architecture.md), `(tabs)/_layout.tsx` with `NativeTabs`, one `Stack` `_layout.tsx` per tab folder ([references/ios-design.md](references/ios-design.md)), `_layout.web.tsx` and `(tabs)/_layout.web.tsx` with the Soft shell ([references/web-layer.md](references/web-layer.md)).
6. Core pieces, each with its contract and every platform file pieces.md lists for it: `_shared` (`useTokens`, `useSizeClass`, `EnsureHost`), `Icon` (with `icon-map.ts`), `Text`, `Heading`, `Stack`, `Row`, `Grid`, `Screen`, `Section`, `Card`, `Button`, `ListItem`, `EmptyState`, `Spinner`, `Skeleton`, `Toast`, `Dialog`.
7. Web setup: Tailwind, `global.css` with the Soft bridge, shadcn (web-layer.md).
8. Build the first screen as the golden screen candidate (converting-web-screens.md, template), run the review checklist, and hand it to the owner.

Done when the app runs in Arabic on an iPhone simulator, an iPad simulator and web, and `check-shared.js` passes.

## Workflow: Add a piece

1. Check the catalog (pieces.md) and `src/pieces/index.ts`. Use an existing piece when one fits, even with a new prop.
2. Write the contract `<Piece>.types.ts`. Labels are props (the screen passes translated strings).
3. Write the default `<Piece>.tsx`: a universal `@expo/ui` component when one fits, else `@expo/ui/jetpack-compose`, else React Native with tokens.
4. Write `<Piece>.ios.tsx` when iOS should render SwiftUI (controls, pickers, menus, lists). Read the component's page or `.d.ts` first. Content pieces (cards, tiles, badges) keep the default file on iOS.
5. Write `<Piece>.web.tsx` with shadcn/ui under saudi-soft rules.
6. Export it from `src/pieces/index.ts`; the barrel is the app's catalog.
7. Use it in one screen and screenshot it on iOS and web.

An Apple framework behind the piece (PDF, scanner, drawing, charts): [references/native-modules.md](references/native-modules.md). Done when all files compile against the contract and the review checklist passes for the screen that uses it.

## Workflow: Write a screen

1. List the screen's UI needs and map each to a piece. Missing piece → "Add a piece".
2. Open the golden screen (its path is in the app's `AGENTS.md`) and copy its structure.
3. Get data only from logic hooks; a new query or mutation goes into `src/logic` first.
4. Add the route file that re-exports the screen; register a new tab in both tab layouts (native and web).
5. Run the review checklist.

Done when `check-shared.js` passes and the screen's iPhone, iPad and web screenshots are in the hand-off.

## Verify (every change)

[rules/review-checklist.md](rules/review-checklist.md): types (default, iOS, and web tsconfigs), `npx expo-doctor`, `check-shared.js`, iPhone and iPad screenshots in Arabic (light and dark), a web screenshot in Arabic, the RTL lines, and a reason for every new package. Done when every item has evidence in the hand-off.

## Which reference to read

| Read | When |
| --- | --- |
| [references/architecture.md](references/architecture.md) | setting up an app, adding folders or platform files, adapters, the variant rule, sharing logic with a Vite web app |
| [references/pieces.md](references/pieces.md) | choosing, writing or changing any piece |
| [references/ios-design.md](references/ios-design.md) | tabs, headers, toolbars, glass, sheets, menus, haptics, iPad layout |
| [references/web-layer.md](references/web-layer.md) | web setup, `_layout.web.tsx`, any `.web.tsx` file, DOM components |
| [references/rtl.md](references/rtl.md) | direction setup, `useLanguage()`, number and date format, RTL checks |
| [references/icons.md](references/icons.md) | adding or choosing an icon |
| [references/tokens.ts](references/tokens.ts) | colors, spacing, radius, fonts, shadows (copy into the app) |
| [references/converting-web-screens.md](references/converting-web-screens.md) | porting a web page; the golden screen template |
| [references/native-modules.md](references/native-modules.md) | PDFKit, VisionKit, PencilKit, Swift Charts, App Intents |
| [references/android-later.md](references/android-later.md) | Android work, or deciding where Android code goes |
| [rules/review-checklist.md](rules/review-checklist.md) | before every hand-off |

## Identity sync

`references/tokens.ts` mirrors saudi-soft's `references/theme-bridge.css` value for value (light = `:root`, dark = `.dark`). A brand change edits both in the same change: the SA ladder first, then any semantic value that differs. In the app, `src/theme/tokens.ts` and the Soft block in `global.css` follow the same rule.
