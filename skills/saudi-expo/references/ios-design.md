# iOS and iPadOS design (iOS 26 / 27)

The system draws the chrome; the app draws the content. Since iOS 26 the chrome is Liquid Glass, and apps built with Xcode 27 (the iOS 27 SDK, which Expo SDK 58 uses) can no longer opt out: Apple ignores `UIDesignRequiresCompatibility` for them. iOS 27 also gives users a transparency slider. A screen that uses system components gets every one of these changes for free; a screen that fakes chrome in JavaScript breaks with each of them.

## System chrome first

Each need has exactly one answer:

| Need | Use | Never |
| --- | --- | --- |
| App sections | `NativeTabs` from `expo-router/native-tabs` | a JS tab bar, `expo-router/js-tabs`, a bottom `Row` of buttons |
| Push navigation and titles | native `Stack` (`expo-router`), one per tab | a custom header `View` |
| Big page title | `largeTitle` on the tab root `Screen` (the piece sets `headerLargeTitleEnabled`; verify at use; `headerLargeTitle` is the deprecated name) | a `Heading level={1}` at the top of the scroll view |
| Header buttons | `Stack.Toolbar placement="left" \| "right"` + `Stack.Toolbar.Button icon="<sf>"` (the `Screen actions` prop) | buttons inside the content |
| Bottom actions | `Stack.Toolbar placement="bottom"` (the `Toolbar` piece) | a floating custom bar |
| Search | `Stack.SearchBar`, or a `NativeTabs.Trigger role="search"` tab | a search `TextInput` pinned under the header |
| Modal task | a route with `presentation: 'formSheet'` and `sheetAllowedDetents` | a full-screen custom modal |
| Menus | `Menu` / `ContextMenu` pieces (SwiftUI `Menu`, `Link.Menu`) | a custom popover `View` |
| Alerts and confirmations | `useConfirm()` → `Alert.alert` | a custom dialog |
| Controls (buttons, toggles, pickers, fields) | the pieces, which render SwiftUI through `@expo/ui/swift-ui` | hand-drawn controls |
| Share | RN `Share.share({ message, url })` | a custom share list |

## NativeTabs layout

Each tab is a folder with its own `Stack`, because native tabs have no header of their own.

```
src/app/(tabs)/_layout.tsx          NativeTabs
src/app/(tabs)/_layout.web.tsx      Soft sidebar shell (references/web-layer.md)
src/app/(tabs)/home/_layout.tsx     <Stack />
src/app/(tabs)/home/index.tsx       export { default } from '@/screens/home/HomeScreen'
src/app/(tabs)/classes/_layout.tsx  <Stack />
src/app/(tabs)/search/_layout.tsx   <Stack />
```

```tsx
// src/app/(tabs)/_layout.tsx
import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';
import { colors } from '@/theme/tokens';
import { useLanguage } from '@/logic/i18n';

export default function TabsLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const { t } = useLanguage();
  return (
    <NativeTabs tintColor={colors[scheme].primary} minimizeBehavior="onScrollDown" sidebarAdaptable>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="classes">
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="menu_book" />
        <NativeTabs.Trigger.Label>{t('tabs.classes')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge>3</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>{t('tabs.search')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

- On SDK 55–57 the import is `expo-router/unstable-native-tabs`; SDK 58 made native tabs stable at `expo-router/native-tabs`.
- Declare every tab with `NativeTabs.Trigger`; tabs are not discovered from folders. Adding or removing tabs at runtime is not supported (hide one with `hidden`, which also blocks navigation to it).
- At most 5 tabs: Android's Material tab bar caps at 5, and 5 is the iPhone norm. Extra sections live inside a tab.
- `sidebarAdaptable` turns the tab bar into a sidebar on iPad (iPadOS 18+); it does nothing on iPhone.
- `minimizeBehavior` values: `automatic`, `never`, `onScrollDown`, `onScrollUp` (iOS 26+). Minimize-on-scroll and scroll-to-top do not work with `FlatList`, and scroll-edge detection can leave the bar looking transparent over it. `Screen` uses a `ScrollView`; for `List` screens, check minimizing in the Simulator.
- `role="search"` moves the tab to the trailing end as the system search button (Xcode 26+). It is iOS-only, so keep the `md` icon and label for Android.
- `NativeTabs.BottomAccessory` (iOS 26+) floats a view above the tab bar (a "now playing" style strip). It renders twice (`usePlacement()` returns `'regular'` or `'inline'`), so keep its state outside it.
- `backgroundColor`, `blurEffect`, `shadowColor` and `disableTransparentOnScrollEdge` do nothing on iOS 26+. Leave them unset.
- Selected tab icons use the `.fill` variant through `sf={{ default, selected }}`.

## Liquid Glass rules

Glass is the navigation layer floating above content. Content stays opaque.

**System glass (you get it by using the component):** tab bar, sidebar, navigation bar, toolbars, sheets, menus, popovers, alerts, search.

**Your glass (`GlassView` from `expo-glass-effect`) goes only on floating controls over content:**

- the Toast capsule;
- a floating control over a map, canvas, camera view or PDF page (zoom, page counter, draw tools);
- the content of `NativeTabs.BottomAccessory`.

**Content never gets glass:** cards, KPI tiles, list rows, form fields, page or section backgrounds, images, text blocks. Draw them with tokens (`colors.card`, `colors.border`, `shadow.e1`).

Rules for every `GlassView`:

1. One layer: no glass inside glass (not inside a toolbar, sheet, menu or another `GlassView`).
2. Several floating glass controls side by side go in one `GlassContainer spacing={…}` so they merge like system glass.
3. Keep the `GlassView` and its parents at opacity 1. To fade, animate a wrapper and switch `glassEffectStyle` between `'regular'` and `'none'`.
4. Render it only when `isGlassEffectAPIAvailable()` returns true (some iOS 26 betas crash); otherwise render a solid `colors.card` surface. On Android and web `GlassView` falls back to a plain `View`, so the piece's default and web files draw the solid surface themselves.
5. When `AccessibilityInfo.isReduceTransparencyEnabled()` resolves true, render the solid surface.
6. If the app has its own light/dark toggle, pass `colorScheme` so the glass matches.

Inside SwiftUI pieces, prefer system button styles over custom glass: `buttonStyle('glass')` and `buttonStyle('glassProminent')` (iOS 26+) for buttons that float over content. The `glassEffect({ glass: { variant: 'regular' | 'clear', interactive, tint }, shape })` modifier exists for custom SwiftUI shapes; it follows the same six rules.

## Color

- The brand green `#1B8354` (dark `#3DAF6E`) is the **tint**: `NativeTabs tintColor`, the `ThemeProvider` `primary`, the `tint()` modifier on SwiftUI controls, `Host seedColor`.
- System surfaces keep system colors: no `backgroundColor` on tab bars, no colored navigation bars, no tinted glass for decoration.
- Destructive actions use `role: 'destructive'` (SwiftUI) or `style: 'destructive'` (`Alert.alert`), which gives the system red.
- Content colors come from `useTokens()`; dark mode follows the system (`"userInterfaceStyle": "automatic"` in `app.json`).

## Typography

- System chrome keeps Apple's font: leave `headerTitleStyle.fontFamily` and `NativeTabs labelStyle.fontFamily` unset on iOS.
- Content text uses IBM Plex Sans Arabic through the `Text` and `Heading` pieces.
- Dynamic Type: RN `Text` scales with the user's text size. Keep scaling on; layouts wrap instead of truncating. Test with `xcrun simctl ui booted content_size accessibility-extra-large`.
- Section headers use title case, not all caps (iOS 26 lists and forms).

## Screens and gestures

- Tab root screens pass `largeTitle` on `Screen`. Pushed detail screens omit it (inline title).
- Lists: SwiftUI `List` through the `List` piece, with swipe actions on rows that have a primary destructive or quick action. The first context-menu actions match the swipe actions.
- Rows that open a screen: `ListItem href` with `menu` items, rendered as `Link` + `Link.Menu` + `Link.Preview` (long-press preview and menu).
- Sheets: half-height (`0.5`) for quick tasks, full (`1`) for forms; show the grabber. iOS 26 insets half sheets and makes them more opaque at full height by itself.
- Pull to refresh on every server-backed list (`onRefresh`).
- Safe areas: `Screen` uses `contentInsetAdjustmentBehavior="automatic"`. Floating pieces read `useSafeAreaInsets()` from `react-native-safe-area-context`. Never hard-code status bar or home indicator heights.
- Haptics (`expo-haptics`), only where the system adds none: Toast success → `notificationAsync(NotificationFeedbackType.Success)`, Toast error → `NotificationFeedbackType.Error`, custom drag or reorder → `impactAsync(ImpactFeedbackStyle.Light)`. System controls already give their own feedback.
- Touch targets at least 44×44 pt.

## iPad

- **Windows resize.** iPadOS windows resize continuously, and apps built with the iOS 27 SDK are resizable on iPhone as well; `requireFullScreen` no longer opts out, and `ScreenOrientation.lockAsync` may do nothing while the app is resizable. Set `"orientation": "default"` and `"ios": { "supportsTablet": true }` in `app.json`. Every screen works from 320 pt wide to full width.
- **Layout by size class** (`useSizeClass()`, references/architecture.md): compact = one column; regular = sidebar (`sidebarAdaptable`) plus a two-pane content area where it helps (list + detail). Build the two-pane layout as a `.regular.tsx` screen variant. `NavigationSplitView` (SwiftUI, SDK 58) suits panes written entirely in SwiftUI; `expo-router/unstable-split-view` exists but is unstable (verify at use).
- **Pointer and keyboard.** System controls get pointer effects and keyboard focus by themselves; custom `Pressable`s keep 44 pt targets.
- **Apple Pencil.** Scribble works in system text fields with no code. Drawing uses PencilKit through a local module (references/native-modules.md).

## Accessibility

- Every `IconButton` and toolbar button has an Arabic `accessibilityLabel`.
- `Heading` sets `accessibilityRole="header"`.
- Test with Increase Contrast (`xcrun simctl ui booted increase_contrast enabled`), the largest text size, and Reduce Transparency.

## App icon

Liquid Glass icons are layered. Build the icon in Apple's Icon Composer and point `ios.icon` in `app.json` at the `.icon` file (verify at use against the Expo app icon guide for SDK 58).
