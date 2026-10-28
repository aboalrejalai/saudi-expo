<p align="center"><img src=".github/assets/cover.png" alt="saudi-expo" width="100%"></p>

# Saudi Expo

Agent skill for building Expo / React Native apps under the Saudi Soft identity: native-feeling iPhone and iPad apps, Saudi Soft shadcn/ui on the web, Android later without rewriting screens.

**https://github.com/aboalrejalai/saudi-expo**

Expo SDK 58. NativeTabs and native stacks. Liquid Glass on system chrome. SF Symbols. SwiftUI through `@expo/ui`. Apple frameworks through local Swift modules. Primary green `#1B8354`. IBM Plex Sans Arabic. Arabic RTL first. Light and dark.

| Path | Role |
| --- | --- |
| `skills/saudi-expo/` | Skill (architecture, pieces, iOS design, web layer, RTL, icons, tokens, native modules) |
| `skills.sh.json` | skills.sh grouping |
| `.claude-plugin/marketplace.json` | Skill picker |

## How apps are built

Three layers:

1. **Logic**: data, Supabase, TanStack Query hooks, types, i18n. One copy for every platform.
2. **Screens**: written once from a closed set of pieces.
3. **Pieces**: the design system. Each piece has one props contract and one file per platform: SwiftUI on iOS, shadcn/ui on web, Compose or React Native on Android.

A new feature is a new screen made of existing pieces. Only a new piece needs work per platform.

## Prerequisites

- Node.js 18+
- macOS with Xcode for the iOS Simulator
- Cursor, Claude Code, Codex, or another agent supported by the Skills CLI
- The [saudi-soft](https://github.com/aboalrejalai/saudi-soft) skill for the web layer

## Install

```bash
npx skills add aboalrejalai/saudi-expo -a cursor
```

```bash
npx skills add aboalrejalai/saudi-expo -a claude-code
```

```bash
npx skills add aboalrejalai/saudi-expo -a agents
```

```bash
npx skills add aboalrejalai/saudi-expo --skill saudi-expo -a cursor
```

Pass `-a` so the skill installs for one agent. Do not use `--all`. It installs into every agent.

Install saudi-soft for the same agent:

```bash
npx skills add aboalrejalai/saudi-soft -a cursor
```

```bash
npx skills add aboalrejalai/saudi-expo --list
```

## Local clone

```bash
git clone https://github.com/aboalrejalai/saudi-expo.git
cd saudi-expo
npx skills add . -a cursor
```

## Update

```bash
npx skills update
```

```bash
npx skills add aboalrejalai/saudi-expo --skill saudi-expo -a cursor
```

## What the skill does

- Scaffolds an Expo SDK 58 app with native tabs, native stacks, an iPad sidebar, and a Soft sidebar shell on web
- Keeps screens free of platform code and checks it with `scripts/check-shared.js`
- Gives agents a closed catalog of pieces with the SwiftUI, shadcn and Android component for each
- Applies Liquid Glass only where Apple uses it and keeps the brand green as the app tint
- Maps the 80 most used lucide icons to SF Symbols and Material Symbols
- Ports React + shadcn web pages to shared screens
- Wraps Apple frameworks (PDFKit, VisionKit, PencilKit, Swift Charts) as local Expo modules with web and Android fallbacks
- Requires iPhone and iPad screenshots in Arabic, light and dark, before work is handed back

Agent entry: [`skills/saudi-expo/SKILL.md`](skills/saudi-expo/SKILL.md)

Tokens: [`skills/saudi-expo/references/tokens.ts`](skills/saudi-expo/references/tokens.ts) (mirrors saudi-soft's `theme-bridge.css`)

Piece catalog: [`skills/saudi-expo/references/pieces.md`](skills/saudi-expo/references/pieces.md)

Icon map: [`skills/saudi-expo/references/icons.md`](skills/saudi-expo/references/icons.md)

```bash
node path/to/saudi-expo/scripts/check-shared.js
```

## License & Security

This project is licensed under the [MIT License](LICENSE).

For vulnerability reporting, see [SECURITY.md](SECURITY.md).  
For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).
