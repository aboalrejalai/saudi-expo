# Review checklist

Run every item before handing work back. The hand-off lists each item with its evidence (command output, screenshot path, or "not applicable: <reason>"). Work is done when every item has evidence; "should work" is not evidence.

## 1. Static checks

| Check | Command | Evidence |
| --- | --- | --- |
| Types, default | `npx tsc --noEmit` | zero errors. This tsconfig resolves plain `.ts` / `.tsx` only |
| Types, iOS | `npx tsc -p tsconfig.ios.json --noEmit` | zero errors |
| Types, web | `npx tsc -p tsconfig.web.json --noEmit` | zero errors |
| Expo health | `npx expo-doctor` | "no issues", or each warning with one line on why it stays |
| Shared files | `node <skill>/scripts/check-shared.js` (in a monorepo pass `--screens`, `--pieces`, `--logic`, and `--routes`) | `✓ No problems.`; every suppressed line has a reason after `check-shared-ignore:` |
| Lint | the app's lint script, if it has one | zero errors |

The default tsconfig never loads `.ios.tsx` or `.web.tsx`. Add these two files beside `tsconfig.json` once per app. `moduleSuffixes` includes `""` so packages still resolve.

```json
// tsconfig.ios.json
{ "extends": "./tsconfig.json", "compilerOptions": { "moduleSuffixes": [".ios", ".native", ""] } }
```

```json
// tsconfig.web.json
{ "extends": "./tsconfig.json", "compilerOptions": { "moduleSuffixes": [".web", ""] } }
```

`@expo/agent-cli` (experimental in SDK 58: `status`, `dev`, `smoke`) may add a smoke run; check `npx @expo/agent-cli --help` before relying on it.

## 2. iOS Simulator screenshots

For every screen you added or changed: iPhone and iPad, Arabic, light and dark, so four screenshots per screen. Name them `<screen>-<device>-<scheme>.png` and list the paths.

```bash
xcrun simctl list devices available                 # pick one iPhone and one iPad
npx expo run:ios --device "<iPhone name>"           # dev build (Expo Go cannot load local modules)
xcrun simctl ui booted appearance light             # then: dark
xcrun simctl launch booted <bundle-id> -AppleLanguages "(ar)" -AppleLocale ar_SA
xcrun simctl io booted screenshot home-iphone-light.png
```

Repeat on the iPad. Xcode 27 replaced Simulator.app with Device Hub; the `xcrun simctl` commands above still drive simulators. An agent with a simulator tool may use it instead; the four screenshots per screen stay the same.

Look at each screenshot and confirm, in the hand-off:

- system chrome only: native tab bar (sidebar on iPad), native headers with large titles on tab roots, native sheets and menus;
- glass only on floating controls; cards, rows and backgrounds are solid;
- the brand green appears as tint (selected tab, buttons, links), not as painted bars;
- IBM Plex Sans Arabic in content, the system font in bars, tabs and alerts;
- iPad: the layout uses the width (sidebar, columns), nothing stretched edge to edge;
- the largest text size (`xcrun simctl ui booted content_size accessibility-extra-large`) still reads without clipped text, on at least the main changed screen.

## 3. Web screenshot

`npx expo start --web`, Arabic, at 1280 px and 390 px wide, light (plus dark when the change touches colors). Confirm the Soft shell, shadcn components and Soft tokens, and that `check-shared.js` skipped only `.web.tsx` files and DOM components.

## 4. RTL

Every line of the RTL checklist in references/rtl.md that the change touches, with what you saw. Lines 1, 2, 4 and 8 always apply to a new screen.

## 5. Pieces

- A changed contract (`<Piece>.types.ts`): every platform file of that piece still compiles against it and was opened and updated.
- A new piece: `.types.ts`, default `.tsx`, and the `.ios.tsx` / `.web.tsx` files it needs, all exported from `src/pieces/index.ts`.
- Unverified API details carry `// verify at use`, and you name them in the hand-off.

## 6. Dependencies

Each new package was added with `npx expo install <name>` and has one line in the hand-off: what it does and why an existing piece or package could not. No new package is the default.

## 7. Android (until Android starts)

`npx tsc --noEmit` covers the default files. Write "Android not run (Android later)" in the hand-off. Once Android starts, references/android-later.md step 6 adds Android screenshots here.

## Hand-off template

```
Change: <one line>
Screens: <paths>    Pieces: <new/changed>    Packages: <none | name — reason>
tsc: 0 errors (default, ios, web)   expo-doctor: <result>   check-shared: ✓ (n suppressed: reasons)
iOS screenshots: <8 paths per 2 screens …>   Web: <paths>
RTL: lines 1,2,4,8 ✓ …   iOS design: ✓ …
Verify at use: <list or none>
Android: not run (Android later)
```
