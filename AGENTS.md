# AGENTS.md

This repository is a **distributable agent skill**, not an Expo app. Do not run `create-expo-app`, `expo prebuild` or `shadcn init` here, and do not add `package.json`, `app.json` or `src/` at the root.

When the user is **using** Saudi Expo in some other project, follow `skills/saudi-expo/SKILL.md`. This file is only for **editing this repo**.

## What it is

Saudi Expo teaches agents to build Expo / React Native apps that:

- feel like native Swift apps on iPhone and iPad (system chrome, Liquid Glass, SF Symbols, SwiftUI through `@expo/ui`, Apple frameworks through local Swift modules);
- keep upstream shadcn/ui on the web under the saudi-soft skill;
- add Android later without rewriting screens;
- carry the Saudi Soft identity: primary `#1B8354` (hover `#166A45`), IBM Plex Sans Arabic, radius 10 / 12, Arabic RTL first, light and dark.

The web layer depends on the saudi-soft skill (its `theme-bridge.css` and `apply-theme.js`). Everything else is self-contained.

## Layout

```
README.md                         Human install + overview (single source)
LICENSE                           MIT License
SECURITY.md                       Vulnerability reporting policy
CONTRIBUTING.md                   Open-source contribution guidelines
skills.sh.json                    skills.sh grouping
.claude-plugin/marketplace.json   Skill picker metadata
skills/saudi-expo/
  SKILL.md                        Agent entry: layers, golden rules, workflows, reference index
  rules/
    review-checklist.md           Evidence required before a hand-off
  references/
    architecture.md               Folder layout, piece anatomy, Metro resolution, imports, variants, monorepo
    pieces.md                     Piece catalog: contract + iOS / web / Android component per piece
    ios-design.md                 iOS 26/27 + iPadOS rules: system chrome, NativeTabs, Liquid Glass
    web-layer.md                  Expo web setup, Soft shell, DOM component rules
    rtl.md                        Direction setup, layout rules, formatting, RTL checklist
    icons.md                      Shared icon names → SF Symbol / Material Symbol / lucide
    tokens.ts                     TypeScript twin of saudi-soft theme-bridge.css
    converting-web-screens.md     Web page → shared screen recipe + golden screen template
    native-modules.md             Local Expo modules in Swift (PDFKit example)
    android-later.md              How Android inherits the app
  scripts/
    check-shared.js               Shared-file checker (runs in the consumer app)
  evals/evals.json                Prompt evals for the skill
```

Install target for humans: `npx skills add aboalrejalai/saudi-expo -a <agent>`. Always pass `-a`. Never document `--all`.

## Edit rules

1. **Behavior lives in `SKILL.md`.** Keep it the single agent entry and under about 300 lines. Tables and recipes stay in `references/` and `rules/`; do not paste them back into `SKILL.md`.
2. **Tokens follow saudi-soft.** `references/tokens.ts` mirrors `saudi-soft/skills/saudi-soft/references/theme-bridge.css` value for value. When the bridge changes, update `tokens.ts` in the same session, and the other way round.
3. **Facts are verified or marked.** Every Expo or Apple API name in the skill was checked against docs.expo.dev, developer.apple.com, or the package's `.d.ts`. A detail you cannot check gets `// verify at use` (code) or "verify at use" / "verify with a spike" (prose). Re-verify the version-specific facts (SDK number, import paths, deprecated props) when a new Expo SDK ships, and update the SDK line in `SKILL.md` and `architecture.md`.
4. **Icons**: a new row in `icons.md` needs an SF name that exists on iOS 16.4, is in `sf-symbols-typescript`, and is not in `symbol_restrictions.strings`, plus a Material Symbol from the codepoints list. `icons.md` explains the checks.
5. **Scripts are CommonJS** (`require`) with zero dependencies, so they run in any consumer app. They operate on `process.cwd()` of the **consumer app**, not this repo. Test changes against a temporary fixture outside the skill folder.
6. **Marketplace / skills.sh**: if you rename the skill folder or change its description, update `.claude-plugin/marketplace.json` and `skills.sh.json` together.
7. **Do not split install docs.** Install commands belong in `README.md` only.
8. **Do not commit** `.env*`, `skills-lock.json`, `.claude/`, or `node_modules/`.
9. **Write in English**, imperative and positive: each rule says what to do. Examples use Arabic labels through i18n keys.

## Identity (do not change unless the user asks)

| Token | Value |
| --- | --- |
| Primary | `#1B8354` (dark `#3DAF6E`) |
| Primary hover | `#166A45` |
| Font | IBM Plex Sans Arabic 400–700 for content; system font for iOS chrome |
| Icons | SF Symbols (iOS), Material Symbols (Android), lucide (web) through one shared name |
| Radius | controls 10, cards and dialogs 12, large tiles 16 |
