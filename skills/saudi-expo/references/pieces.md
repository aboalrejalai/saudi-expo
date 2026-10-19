# Piece catalog

The closed vocabulary screens are written in. Each row gives the contract (key props of `<Piece>.types.ts`) and the component each platform file renders. Pick the first row that fits; a need no row covers is a **new piece** (SKILL.md, "Add a piece" workflow).

**How to read the cells.** Component names are verified for Expo SDK 58 (docs.expo.dev and the packages' `.d.ts`). Props for `@expo/ui` components beyond the ones shown here change between releases: read the component's page (`docs.expo.dev/versions/latest/sdk/ui/swift-ui/<name>`) or its `.d.ts` in `node_modules/@expo/ui` before you write them, and let `npx tsc --noEmit` prove them. A line ending in `// verify at use` is a known-unverified detail.

**Columns.** iOS = `<Piece>.ios.tsx`. Web = `<Piece>.web.tsx` (shadcn/ui under Saudi Soft). Default = `<Piece>.tsx`, which runs on Android and on iOS when no iOS file exists. "same" = no platform file; the default serves that platform.

## Shared conventions

- Colors, spacing, radius and fonts come from `useTokens()` (native) or Soft Tailwind classes (web). No hex values inside pieces.
- `icon` props take an `IconName` (references/icons.md).
- Every SwiftUI or Compose view sits inside a `Host`. Use `EnsureHost` / `HostRoot` (references/architecture.md, Piece internals).
- Tint, not paint: iOS controls get the brand color through `tint(colors.primary)` or `Host seedColor`; bars, tab bars and glass keep their system look.
- Content surfaces (cards, list rows, KPI tiles) are drawn with tokens and never use glass. Glass is for floating controls only (references/ios-design.md).

## Layout

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `Screen` | `title`, `subtitle?`, `icon?` (web header tile), `largeTitle?: boolean` (default false; tab roots pass true), `actions?: ScreenAction[]` (header end), `search?: SearchFieldProps`, `scroll?` (default true), `onRefresh?`, `refreshing?`, `children` | `Screen.ios.tsx`: scroll content `backgroundColor: colors.background`; `headerLargeTitleEnabled: true` only when `largeTitle` (verify at use); actions only through `Stack.Toolbar placement="right"` + `Stack.Toolbar.Button` (no `headerRight`) | `<main className="bg-background">` + Soft page header (title, subtitle, 48px icon tile, action buttons), `Head` from `expo-router/head` for the tab title | `Screen.tsx`: `backgroundColor: colors.background`; `headerLargeTitleEnabled: true` only when `largeTitle` (Android ignores it); `ScrollView contentInsetAdjustmentBehavior="automatic" automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled"` + `RefreshControl`; actions only through `headerRight` with `IconButton`s (no `Stack.Toolbar`); `search` through `SearchField placement="header"` |
| `Section` | `title?`, `description?`, `action?: { label, onPress }`, `children` | same | shadcn `Card` + `CardHeader` + `CardTitle className="text-base"` + `CardContent` | `View` + `Heading level={3}` + children; section titles in title case (iOS 26 dropped all-caps headers) |
| `Stack` | `gap?: SpaceToken` (default 3), `align?`, `children` | same | `<div className="flex flex-col gap-*">` | `View` with `flexDirection: 'column'`, `gap` |
| `Row` | `gap?`, `align?`, `justify?`, `wrap?`, `children` | same | `<div className="flex flex-row gap-*">` | `View` with `flexDirection: 'row'` (flips in RTL by itself) |
| `Grid` | `columns: { compact: number; regular: number }`, `gap?`, `children` | same | `<div className="grid grid-cols-{compact} md:grid-cols-{regular} gap-*">` | `View` + `flexWrap: 'wrap'`, child width from `useSizeClass()` and `onLayout` |
| `Divider` | `inset?` | same | shadcn `Separator` | `View` with `StyleSheet.hairlineWidth` height, `colors.border` |

## Text

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `Text` | `variant?: 'body' \| 'caption' \| 'label' \| 'muted'`, `weight?: 400 \| 500 \| 600 \| 700`, `align?: 'start' \| 'center' \| 'end'`, `numberOfLines?`, `selectable?`, `children` | same | `<p>` / `<span>` with `text-sm` (body), `text-xs` (caption), `text-sm text-muted-foreground` (muted), `text-label` (label) | RN `Text`, `fontFamily: fontFamily.native[weight]` (no `fontWeight`), size from `fontSize`, explicit `textAlign` from `align` + `I18nManager.isRTL`, `writingDirection` from `I18nManager.isRTL` (references/rtl.md) |
| `Heading` | `level: 1 \| 2 \| 3`, `children` | same | `<h1 className="text-2xl md:text-3xl font-bold tracking-tight">`, `<h2>` `text-xl font-semibold`, `<h3>` `text-base font-semibold` | RN `Text`, `accessibilityRole="header"`, 24/20/16 pt, weight 700/600/600. On iOS the page title is the system large title, so level 1 is rare |

## Actions

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `Button` | `label`, `onPress`, `variant?: 'primary' \| 'secondary' \| 'destructive' \| 'plain'`, `icon?`, `disabled?`, `loading?`, `fullWidth?` | `@expo/ui/swift-ui` `Button` (`label`, `systemImage`, `role`, `onPress`) + `buttonStyle('borderedProminent' \| 'bordered' \| 'borderless')`, `controlSize('large')`, `tint(primary)` | shadcn `Button` (`default`, `outline`, `destructive`, `ghost`) + `Spinner` / `Icon data-icon="inline-start"` | universal `@expo/ui` `Button` (`label`, `onPress`) inside `EnsureHost` |
| `IconButton` | `icon`, `accessibilityLabel` (required, Arabic), `onPress`, `variant?` | swift-ui `Button` with `systemImage` + `labelStyle(...)` icon-only // verify at use | shadcn `Button size="icon"` + `aria-label` | `@expo/ui/jetpack-compose` `IconButton` // verify at use; until verified, `Pressable` + `Icon` with 44×44 hit area |

Navigation inside text uses `Link` from `expo-router` directly (allowed in screens); rows and cards take `href`.

## Display

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `Icon` | `name: IconName`, `size?: 16 \| 20 \| 24 \| 28 \| 32`, `tone?: 'default' \| 'muted' \| 'primary' \| 'destructive' \| 'success' \| 'warning' \| 'info' \| 'onPrimary'` | `expo-symbols` `SymbolView name={sf}`, `scaleX: -1` in RTL when `mirror` | lucide component from the map, `rtl:-scale-x-100` when `mirror` | `SymbolView name={{ ios, android, web }}`, `scaleX: -1` in RTL when `mirror` |
| `Card` | `children`, `href?`, `onPress?`, `padding?` | same | shadcn `Card` (`rounded-xl`, hover `border-primary/40` when pressable) | `View` radius `lg` (12), `colors.card`, 1pt `colors.border`, `shadow.e1`; `Link asChild` + `Pressable` when `href` |
| `KpiCard` | `label`, `value`, `icon?`, `delta?: { value: string; tone: 'success' \| 'danger' \| 'neutral' }` | same | Soft KPI recipe: `bg-gradient-to-br from-primary/10`, value `text-3xl font-bold`, label `text-sm text-muted-foreground`, `Badge` delta | `View` with `alpha(colors.primary, 0.1)` fill, value `Heading level={1}`, label `Text variant="muted"` |
| `HubCard` | `title`, `description?`, `icon`, `href` | same | Soft hub recipe: `p-5 rounded-xl`, 40px icon tile `bg-primary/10`, hover `border-primary/40` | `Card href` + 40pt icon tile + `chevron-forward` |
| `Badge` | `label`, `tone?: 'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | same | shadcn `Badge` + Soft status tokens (`bg-status-success/10`) | `View` radius `full`, fill `status*Bg`, text `status*` color |
| `Avatar` | `name`, `imageUrl?`, `size?: 32 \| 40 \| 56` | same | shadcn `Avatar` + `AvatarImage` + `AvatarFallback` (always) | `expo-image` `Image` with initials fallback on `colors.primarySubtle` |
| `Image` | `source`, `alt` (required), `aspectRatio?`, `contentFit?` | same | same (`expo-image` runs on web) | `expo-image` `Image` |
| `Progress` | `value` (0–1), `label?` | swift-ui `ProgressView` // verify value prop at use | shadcn `Progress` | `@expo/ui/jetpack-compose` `LinearProgressIndicator` |
| `Spinner` | `size?: 'small' \| 'large'` | same | shadcn `Spinner` | RN `ActivityIndicator color={colors.primary}` |
| `Skeleton` | `width?`, `height`, `radius?` | same | shadcn `Skeleton` | `View` with `colors.muted` and a Reanimated opacity loop |
| `EmptyState` | `icon`, `title`, `description?`, `action?: { label, onPress }` | same | shadcn `Empty` | `Stack` centered: 48pt icon tile, `Heading level={3}`, muted `Text`, `Button` |

## Lists and data

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `List` | `data`, `keyExtractor`, `toItem: (item) => ListItemData`, `header?`, `empty?: EmptyStateProps`, `onRefresh?`, `refreshing?`, `onEndReached?` | `HostRoot` + swift-ui `List` (`data`, `keyExtractor`, children render function; recycling is on by default in SDK 58), rows built with `HStack` / `VStack` / `Text` / `Image`, `SwipeActions`, `refreshable` modifier // verify row APIs at use | `<ul>` of Soft rows (`divide-y`, `hover:bg-primary/5`), `Empty` when empty | `FlatList` + `ListItem` rows |
| `ListItem` | `ListItemData`: `title`, `subtitle?`, `icon?`, `trailing?` (text), `badge?`, `href?`, `onPress?`, `swipeActions?: { label, icon, destructive?, onPress }[]`, `menu?: MenuItem[]` | standalone: same; inside `List`: a SwiftUI row built by `List` from `toItem`; `menu` with `href` → `Link` + `Link.Menu` + `Link.Preview` | Soft row; `menu` → shadcn `ContextMenu` | `Pressable` row, 56pt min height, `chevron-forward` when `href` |
| `DataTable` | `columns: { key, label, width?, align? }[]`, `rows`, `keyExtractor`, `onRowPress?`, `primaryColumn` | same | shadcn `Table` (+ TanStack Table for sort/filter) | compact: `List` (primary column = title, two key columns = subtitle/trailing); regular: horizontal `ScrollView` grid with fixed column widths |

Two shapes, never mixed:

- **Short list inside a scrolling screen** (up to about 10 rows, for example "latest 5 assignments"): standalone `ListItem`s inside a `Section`.
- **The screen is the list** (longer, paged, or server-backed): `List`, with `Screen scroll={false}` so the list scrolls itself. Never put a `List` inside a scrolling `Screen`.

`swipeActions` render as swipe actions inside `List` on iOS. Everywhere else (standalone rows, web, Android) the same actions appear in the row's `menu`, so put every swipe action in `menu` too.

## Forms

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `Form` | `children` (field pieces), `footer?` | `HostRoot` + swift-ui `Form` + `Section` (grouped style) | shadcn `FieldGroup` (saudi-soft forms rule) | universal `Host` + `FieldGroup` |
| `TextField` | `label`, `value`, `onChangeText`, `placeholder?`, `error?`, `description?`, `secure?`, `keyboard?: 'default' \| 'email' \| 'number' \| 'phone'`, `multiline?` | swift-ui `TextField` / `SecureField` + `keyboardType`, `textContentType` modifiers // verify props at use | shadcn `Field` + `FieldLabel` + `Input` / `Textarea` + `FieldDescription`; `data-invalid` on `Field`, `aria-invalid` on input | universal `TextInput` // verify props at use |
| `Select` | `label`, `value`, `onChange`, `options: { value, label }[]` | swift-ui `Picker` (`label`, `selection`, `onSelectionChange`) + `pickerStyle('menu')`, options as `Text` with `tag(value)` | shadcn `Select` + `SelectGroup` + `SelectItem` | universal `Picker` // verify props at use |
| `DatePicker` | `label`, `value: Date`, `onChange`, `mode?: 'date' \| 'time' \| 'datetime'`, `min?`, `max?` | swift-ui `DatePicker` + `datePickerStyle` // verify props at use | shadcn `Calendar` in `Popover` (date-picker recipe) | `@expo/ui/jetpack-compose` `DateTimePicker` // verify props at use |
| `Switch` | `label`, `value`, `onValueChange`, `description?` | swift-ui `Toggle` // verify props at use | shadcn `Switch` inside `Field orientation="horizontal"` | universal `Switch` |
| `Checkbox` | `label`, `checked`, `onCheckedChange` | swift-ui `Toggle` (iOS has no checkbox control) | shadcn `Checkbox` | universal `Checkbox` |
| `Segmented` | `options: { value, label }[]` (2–5), `value`, `onChange` | swift-ui `Picker` + `pickerStyle('segmented')` | shadcn `ToggleGroup` | `@expo/ui/jetpack-compose` `SingleChoiceSegmentedButtonRow` + `SegmentedButton` (`selected`, `onClick`) |
| `Slider` | `label`, `value`, `onChange`, `min`, `max`, `step?` | swift-ui `Slider` | shadcn `Slider` | universal `Slider` |
| `SearchField` | `value`, `onChangeText`, `placeholder`, `placement?: 'header' \| 'inline'` | `header`: `Stack.SearchBar` (`placeholder`, `onChangeText` → `event.nativeEvent.text`); `inline`: swift-ui `TextField` with a `search` icon | shadcn `InputGroup` + `InputGroupAddon` + `InputGroupInput` | `header`: `Stack.SearchBar`; `inline`: `@expo/ui/jetpack-compose` `DockedSearchBar` // verify at use |

Option count decides the control: 2–5 → `Segmented`, 6+ → `Select`, on/off → `Switch`.

## Navigation inside a screen

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `Tabs` (in-page) | `tabs: { value, label }[]`, `value`, `onValueChange`, `renderPanel: (value) => ReactNode` | `Segmented` on top + active panel | shadcn `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | `Segmented` on top + active panel |
| `Toolbar` (bottom) | `items: { icon, label, onPress, variant?: 'plain' \| 'prominent' }[]` | `Stack.Toolbar placement="bottom"` + `Stack.Toolbar.Button` (`icon`, `accessibilityLabel`, `onPress`, `variant`) | sticky bottom bar (`sticky bottom-0 border-t bg-background/95`) with shadcn `Button`s | `Stack.Toolbar placement="bottom"` (needs `@expo/ui` on Android) |

App-level tabs are not a piece: they are the `NativeTabs` layout (references/ios-design.md) and `_layout.web.tsx` (references/web-layer.md). Header actions are `Screen actions`.

## Overlays and feedback

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `Sheet` | `open`, `onOpenChange`, `title`, `detents?: ('medium' \| 'large')[]`, `children` (short content) | swift-ui `BottomSheet` (`isPresented`, `onIsPresentedChange`) with a `Group` carrying `presentationDetents([...])` and `presentationDragIndicator('visible')` | shadcn `Sheet` opening from the end edge of the reading direction (`side="left"` in Arabic), or `Drawer` on phone widths | universal `BottomSheet` // verify props at use |
| `Dialog` | `useConfirm()` → `confirm({ title, message?, confirmLabel, cancelLabel, destructive? }): Promise<boolean>`; `ConfirmProvider` in the root layout | RN `Alert.alert` (UIAlertController) with `style: 'cancel' \| 'destructive'` buttons | shadcn `AlertDialog` rendered by `ConfirmProvider` | RN `Alert.alert` |
| `Menu` | `trigger: { label, icon? }`, `items: MenuItem[]` (`label`, `icon?`, `onPress`, `destructive?`, `disabled?`) | swift-ui `Menu` with `Button` children // verify props at use | shadcn `DropdownMenu` + `DropdownMenuGroup` + `DropdownMenuItem` | `@expo/ui/jetpack-compose` `DropdownMenu` // verify props at use |
| `ContextMenu` | `items: MenuItem[]`, `href?`, `preview?`, `children` | with `href`: `Link` + `Link.Trigger` + `Link.Preview` + `Link.Menu` + `Link.MenuAction` (`title`, `icon`, `onPress`, `destructive`); without: swift-ui `ContextMenu` + `ContextMenu.Trigger` + `ContextMenu.Items` | shadcn `ContextMenu` | long press opens the `Menu` items // verify at use |
| `Toast` | `useToast()` → `toast.show({ title, description?, tone?: 'success' \| 'error' \| 'info' })`; `ToastProvider` in the root layout | floating capsule at the top safe area: `GlassView` (`glassEffectStyle="regular"`, `isInteractive`) when `isGlassEffectAPIAvailable()`, else `colors.card` + `shadow.e3`; `Icon` + `Text`; `Haptics.notificationAsync` | `sonner` `toast()` (shadcn `Toaster` in the web root layout) | RN `ToastAndroid.show(title, ToastAndroid.SHORT)`; upgrade to `@expo/ui/jetpack-compose` `Snackbar` when Android starts |

A sheet with more than one field or its own actions is a route instead: `presentation: 'formSheet'`, `sheetAllowedDetents: [0.5, 1]`, `sheetGrabberVisible: true` on its `Stack.Screen` (real UIKit sheet with a native title bar).

## Heavy pieces (Apple frameworks and web-only renderers)

| Piece | Contract | iOS | Web | Default (Android) |
| --- | --- | --- | --- | --- |
| `Chart` | `type: 'bar' \| 'line' \| 'area' \| 'pie'`, `data`, `xKey`, `series: { key, label, color: 'chart1'…'chart5' }[]`, `height?` | local module with Swift Charts (references/native-modules.md); until it exists, the default file | shadcn `Chart` (Recharts) + `--chart-1..5` | DOM component (`'use dom'`) rendering the web chart; the allowed DOM exception |
| `PdfViewer` | `uri` (`file://` or `https://`), `onLoad?(pageCount)` | local module with PDFKit `PDFView` | `<iframe>` with the browser's PDF viewer | stub: `EmptyState` + `Button` that calls `Linking.openURL(uri)` |
| `DocumentScanner` | `onScan(pages: { uri }[])`, `onCancel?` | local module with VisionKit `VNDocumentCameraViewController` (check `isSupported`) | `<input type="file" accept="image/*,application/pdf" capture="environment">` | stub: `EmptyState` saying scanning is coming |

Every heavy piece ships all three files from day one; a stub is a working screen state, never a crash.

## Code: Button (iOS and default)

```tsx
// src/pieces/Button/Button.ios.tsx
import { Button as SwiftUIButton, ProgressView } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, tint, disabled as disabledModifier, frame } from '@expo/ui/swift-ui/modifiers';
import { EnsureHost } from '../_shared/EnsureHost';
import { useTokens } from '../_shared/useTokens';
import { iconMap } from '../Icon/icon-map';
import type { ButtonProps } from './Button.types';

const styleFor = { primary: 'borderedProminent', secondary: 'bordered', destructive: 'bordered', plain: 'borderless' } as const;

export function Button({ label, onPress, variant = 'primary', icon, disabled, loading, fullWidth }: ButtonProps) {
  const { colors } = useTokens();
  const modifiers = [
    buttonStyle(styleFor[variant]),
    controlSize('large'),
    ...(variant === 'destructive' ? [] : [tint(colors.primary)]),
    ...(disabled || loading ? [disabledModifier()] : []),
    ...(fullWidth ? [frame({ maxWidth: Infinity })] : []), // verify at use
  ];
  return (
    <EnsureHost>
      {loading ? (
        <SwiftUIButton onPress={onPress} modifiers={modifiers}>
          <ProgressView />
        </SwiftUIButton>
      ) : (
        <SwiftUIButton
          label={label}
          systemImage={icon ? iconMap[icon].sf : undefined}
          role={variant === 'destructive' ? 'destructive' : 'default'}
          onPress={onPress}
          modifiers={modifiers}
        />
      )}
    </EnsureHost>
  );
}
```

```tsx
// src/pieces/Button/Button.tsx  (Android and fallback)
import { Button as UniversalButton } from '@expo/ui';
import { EnsureHost } from '../_shared/EnsureHost';
import type { ButtonProps } from './Button.types';

export function Button({ label, onPress }: ButtonProps) {
  // Map variant / disabled / loading once the universal Button props are verified at use.
  return (
    <EnsureHost>
      <UniversalButton label={label} onPress={onPress} />
    </EnsureHost>
  );
}
```

## Code: Icon (all three files)

```tsx
// src/pieces/Icon/Icon.types.ts
import type { IconName } from './icon-map';
export type IconTone = 'default' | 'muted' | 'primary' | 'destructive' | 'success' | 'warning' | 'info' | 'onPrimary';
export type IconProps = { name: IconName; size?: 16 | 20 | 24 | 28 | 32; tone?: IconTone };
```

```tsx
// src/pieces/Icon/Icon.ios.tsx
import { I18nManager } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useTokens } from '../_shared/useTokens';
import { iconMap } from './icon-map';
import { toneColor } from './tone';
import type { IconProps } from './Icon.types';

export function Icon({ name, size = 20, tone = 'default' }: IconProps) {
  const { colors } = useTokens();
  const entry = iconMap[name];
  return (
    <SymbolView
      name={entry.sf}
      size={size}
      tintColor={toneColor(colors, tone)}
      style={entry.mirror && I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
    />
  );
}
```

```tsx
// src/pieces/Icon/Icon.tsx  (Android and fallback)
import { I18nManager } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useTokens } from '../_shared/useTokens';
import { iconMap } from './icon-map';
import { toneColor } from './tone';
import type { IconProps } from './Icon.types';

export function Icon({ name, size = 20, tone = 'default' }: IconProps) {
  const { colors } = useTokens();
  const entry = iconMap[name];
  return (
    <SymbolView
      name={{ ios: entry.sf, android: entry.md, web: entry.md }}
      size={size}
      tintColor={toneColor(colors, tone)}
      style={entry.mirror && I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
    />
  );
}
```

```tsx
// src/pieces/Icon/Icon.web.tsx
import { ArrowRight, Clock, Plus, type LucideIcon } from 'lucide-react'; // one import per mapped icon
import { cn } from '@/lib/utils';
import { iconMap } from './icon-map';
import type { IconProps, IconTone } from './Icon.types';

const lucide: Record<string, LucideIcon> = { ArrowRight, Clock, Plus };
const toneClass: Record<IconTone, string> = {
  default: 'text-foreground', muted: 'text-muted-foreground', primary: 'text-primary', destructive: 'text-destructive',
  success: 'text-success', warning: 'text-warning', info: 'text-info', onPrimary: 'text-primary-foreground',
};

export function Icon({ name, size = 20, tone = 'default', ...rest }: IconProps & { 'data-icon'?: 'inline-start' | 'inline-end' }) {
  const entry = iconMap[name];
  const Component = lucide[entry.lucide];
  return <Component size={size} aria-hidden className={cn(toneClass[tone], entry.mirror && 'rtl:-scale-x-100')} {...rest} />;
}
```

`tone.ts` maps `IconTone` to token colors: `default` → `foreground`, `muted` → `mutedForeground`, `primary` → `primary`, `destructive` → `destructive`, `success` / `warning` / `info` → the same names, `onPrimary` → `primaryForeground`.
