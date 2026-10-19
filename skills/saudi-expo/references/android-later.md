# Android later

Android inherits the app; it is not a port. Every shared screen, every logic file and every piece's default file (`<Piece>.tsx`) already runs on Android, and `NativeTabs` renders Material 3 bottom navigation from the same layout file. "Android starts" means the owner asks for Android builds; until then, Android only has to typecheck.

## What Android gets with no extra work

| Layer | On Android |
| --- | --- |
| Logic, screens | identical code |
| Pieces | the default `<Piece>.tsx`: universal `@expo/ui` (renders Jetpack Compose), `@expo/ui/jetpack-compose`, or React Native |
| Tabs | `NativeTabs` → Material tab bar, `md` icons (needs `expo-symbols` installed), max 5 tabs |
| Headers | native `Stack` headers; `headerLargeTitleEnabled` is set only when `Screen` gets `largeTitle`, and Android ignores it |
| Header actions | `headerRight` with `IconButton`s in `Screen.tsx` only (iOS uses `Stack.Toolbar`) |
| Bottom toolbar | `Stack.Toolbar placement="bottom"` (needs `@expo/ui`) |
| Icons | Material Symbols through `expo-symbols` |
| Direction | `I18nManager` + `android:supportsRtl` (set by the `expo-localization` plugin) |

## Material 3 look

- **No glass.** `GlassView` falls back to a plain `View`; default piece files draw solid surfaces (`colors.card`, `shadow.e2`).
- **Tab bar**: `NativeTabs indicatorColor={colors[scheme].primarySubtle}` and `rippleColor` from tokens; `labelVisibilityMode="labeled"`; `backBehavior="history"` when tabs should remember the path.
- **Keyboard**: `tabBarRespectsIMEInsets` lifts the tab bar above the keyboard (Android 11+, needs `windowSoftInputMode="adjustResize"`).
- **Touch feedback**: `Pressable android_ripple={{ color: alpha(colors.primary, 0.12) }}` in custom rows; touch targets at least 48 dp.
- **Font**: Android has no system-font rule like iOS, so IBM Plex Sans Arabic may also style header titles on Android.
- **Feedback**: `ToastAndroid` today; `@expo/ui/jetpack-compose` `Snackbar` when Android starts.

## Where Android code goes

- A piece with an `.ios.tsx` file: its default `<Piece>.tsx` is Android's file. Edit it freely.
- A piece whose default file also serves iOS (no `.ios.tsx`): create `<Piece>.android.tsx` and leave the shared default untouched, so iOS does not change.
- Screens never branch on Android. A difference is a piece file or a variant (references/architecture.md).

## The Android pass (when the owner asks)

1. `npx expo install expo-symbols @expo/ui` if missing, then `npx expo run:android` on an emulator set to Arabic.
2. Walk every screen in Arabic and English; run lines 1–13 of the RTL checklist (references/rtl.md). Check that mirrored icons point the right way (Material Symbols may already mirror; a double flip points backwards).
3. Upgrade default files that still use React Native fallbacks to Compose, one piece at a time, verifying props in `node_modules/@expo/ui` first: `IconButton`, `Snackbar`, `DropdownMenu`, `DateTimePicker`, `DockedSearchBar`, `LinearProgressIndicator`, `ModalBottomSheet`.
4. Heavy pieces: replace stubs (`PdfViewer`, `DocumentScanner`) with real Android implementations only when the owner asks; a Kotlin local module follows the same three-face layout as references/native-modules.md.
5. App config: `android.package`, adaptive icon, `supportedLocales.android`, permissions with Arabic text, `predictiveBackGestureEnabled` decided and tested.
6. Screenshots for the hand-off: phone and tablet emulators, Arabic, light and dark.
