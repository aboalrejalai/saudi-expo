# Icons

One **shared icon name** per concept. Screens pass the shared name to the `Icon` piece (and to `icon` props of other pieces). The piece maps it per platform:

| Platform | Library | Where the map lives |
| --- | --- | --- |
| iOS | SF Symbols through `expo-symbols` (`SymbolView`) or the `sf` / `icon` props of system chrome | `src/pieces/Icon/icon-map.ts` → `sf` |
| Android | Material Symbols through `expo-symbols` (`name={{ android }}`) or the `md` prop of `NativeTabs.Trigger.Icon` | `icon-map.ts` → `md` |
| Web | `lucide-react` (Saudi Soft rule) | `icon-map.ts` → `lucide` |

## Rules

1. Add a concept to `icon-map.ts` before using it. The `IconName` type is `keyof typeof iconMap`, so an unknown name fails typecheck.
2. Name concepts by meaning, not by drawing. Directional concepts use `-forward` / `-back` (never `-left` / `-right`).
3. Mirrored names (marked **M** below) flip in RTL. The `Icon` piece applies that flip on iOS, Android, and web: `transform: [{ scaleX: -1 }]` when `mirror` is set and `I18nManager.isRTL` is true, and `rtl:-scale-x-100` on web. If an Arabic screenshot shows a double flip (the glyph already mirrored, then the piece mirrored it again), set that row's `mirror` to `false`. Check Android the same way when Android starts.
4. Every SF name below exists on iOS 16.4 (the SDK 58 deployment target), is in `sf-symbols-typescript`, and carries no Apple usage restriction. When you add a name, check all three (see "Checking a new name").
5. When converting a web screen, decide the meaning of each `ArrowRight`, `ArrowLeft`, `ChevronLeft`, `ChevronRight` first. Arabic web screens often used `ChevronLeft` for "next". Map "next / open / go" to `chevron-forward` or `arrow-forward`, and "previous / back" to `chevron-back` or `arrow-back`.
6. A spinner is the `Spinner` piece (`ActivityIndicator`), not a spinning icon.

## Map: the 80 most used lucide icons in the owner's web app

Counted on 2026-10-20 by a read-only scan of `uep/src` (number of files importing each icon from `lucide-react`; 420 files, 296 distinct icons). Material names were checked against Google's Material Symbols codepoints list; SF names against the system SF Symbols catalog (`CoreGlyphs.bundle/name_availability.plist`) and `sf-symbols-typescript`.

| # | lucide (web) | files | shared name | SF Symbol (iOS) | Material Symbol (Android) | notes |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | `ArrowRight` | 119 | `arrow-forward` or `arrow-back` | `arrow.forward` or `arrow.backward` | `arrow_forward` or `arrow_back` | **M**. Next / open / go → `arrow-forward`. Previous / return → `arrow-back`. Do not copy the glyph's direction. |
| 2 | `Clock` | 81 | `clock` | `clock` | `schedule` | |
| 3 | `Plus` | 74 | `plus` | `plus` | `add` | |
| 4 | `FileText` | 66 | `file-text` | `doc.text` | `description` | |
| 5 | `Users` | 62 | `users` | `person.2` | `group` | |
| 6 | `Loader2` | 58 | — | — | — | use the `Spinner` piece |
| 7 | `BookOpen` | 58 | `book-open` | `book` | `menu_book` | |
| 8 | `CheckCircle2` | 54 | `check-circle` | `checkmark.circle` | `check_circle` | |
| 9 | `GraduationCap` | 52 | `graduation-cap` | `graduationcap` | `school` | |
| 10 | `Calendar` | 51 | `calendar` | `calendar` | `calendar_today` | |
| 11 | `Trash2` | 43 | `trash` | `trash` | `delete` | |
| 12 | `AlertTriangle` | 42 | `alert-triangle` | `exclamationmark.triangle` | `warning` | |
| 13 | `Sparkles` | 38 | `sparkles` | `sparkles` | `auto_awesome` | |
| 14 | `X` | 37 | `close` | `xmark` | `close` | |
| 15 | `ChevronLeft` | 36 | `chevron-forward` or `chevron-back` | `chevron.forward` or `chevron.backward` | `chevron_right` or `chevron_left` | **M**. Same decision as rule 5. Arabic screens often used this glyph for next. |
| 16 | `Download` | 31 | `download` | `arrow.down.circle` | `download` | |
| 17 | `Check` | 30 | `check` | `checkmark` | `check` | |
| 18 | `ChevronRight` | 28 | `chevron-forward` or `chevron-back` | `chevron.forward` or `chevron.backward` | `chevron_right` or `chevron_left` | **M**. Same decision as rule 5. |
| 19 | `TrendingUp` | 27 | `trending-up` | `chart.line.uptrend.xyaxis` | `trending_up` | |
| 20 | `Award` | 27 | `award` | `rosette` | `workspace_premium` | |
| 21 | `ArrowLeft` | 26 | `arrow-forward` or `arrow-back` | `arrow.forward` or `arrow.backward` | `arrow_forward` or `arrow_back` | **M**. Same decision as rule 5. |
| 22 | `Send` | 25 | `send` | `paperplane` | `send` | |
| 23 | `Building2` | 25 | `building` | `building.2` | `apartment` | |
| 24 | `Save` | 22 | `save` | `square.and.arrow.down` | `save` | |
| 25 | `ClipboardList` | 22 | `clipboard-list` | `list.clipboard` | `assignment` | |
| 26 | `AlertCircle` | 21 | `alert-circle` | `exclamationmark.circle` | `error` | |
| 27 | `Bell` | 21 | `bell` | `bell` | `notifications` | |
| 28 | `RefreshCw` | 20 | `refresh` | `arrow.clockwise` | `refresh` | |
| 29 | `Eye` | 20 | `eye` | `eye` | `visibility` | |
| 30 | `RotateCcw` | 19 | `reset` | `arrow.counterclockwise` | `restart_alt` | |
| 31 | `Search` | 19 | `search` | `magnifyingglass` | `search` | |
| 32 | `BarChart3` | 19 | `bar-chart` | `chart.bar` | `bar_chart` | |
| 33 | `CheckCircle` | 18 | `check-circle` | `checkmark.circle` | `check_circle` | same concept as #8 |
| 34 | `ShieldCheck` | 18 | `shield-check` | `checkmark.shield` | `verified_user` | |
| 35 | `UserCheck` | 18 | `user-check` | `person.crop.circle.badge.checkmark` | `how_to_reg` | `person.badge.checkmark` needs iOS 27 |
| 36 | `ExternalLink` | 17 | `external-link` | `arrow.up.forward.square` | `open_in_new` | **M** |
| 37 | `Zap` | 17 | `zap` | `bolt` | `bolt` | |
| 38 | `MapPin` | 16 | `map-pin` | `mappin.and.ellipse` | `location_on` | |
| 39 | `Globe` | 16 | `globe` | `globe` | `globe` | |
| 40 | `Shield` | 16 | `shield` | `shield` | `shield` | |
| 41 | `Trophy` | 15 | `trophy` | `trophy` | `trophy` | |
| 42 | `Activity` | 15 | `activity` | `waveform.path.ecg` | `vital_signs` | |
| 43 | `Star` | 15 | `star` | `star` | `star` | |
| 44 | `ChevronDown` | 14 | `chevron-down` | `chevron.down` | `expand_more` | |
| 45 | `User` | 14 | `user` | `person` | `person` | |
| 46 | `XCircle` | 14 | `x-circle` | `xmark.circle` | `cancel` | |
| 47 | `Mail` | 14 | `mail` | `envelope` | `mail` | |
| 48 | `Play` | 14 | `play` | `play` | `play_arrow` | media control: never mirror |
| 49 | `MessageSquare` | 14 | `message-square` | `text.bubble` | `chat_bubble` | |
| 50 | `Printer` | 14 | `printer` | `printer` | `print` | |
| 51 | `Info` | 13 | `info` | `info.circle` | `info` | |
| 52 | `FlaskConical` | 13 | `flask` | `testtube.2` | `science` | SF `flask` needs iOS 17 |
| 53 | `Settings` | 13 | `settings` | `gearshape` | `settings` | |
| 54 | `CalendarDays` | 13 | `calendar-days` | `calendar` | `calendar_month` | |
| 55 | `MessageCircle` | 12 | `message-circle` | `bubble.left` | `chat` | SF `message` is reserved for Apple's Messages app |
| 56 | `Upload` | 12 | `upload` | `arrow.up.circle` | `upload` | |
| 57 | `Database` | 12 | `database` | `cylinder.split.1x2` | `database` | |
| 58 | `Copy` | 12 | `copy` | `doc.on.doc` | `content_copy` | |
| 59 | `Lock` | 12 | `lock` | `lock` | `lock` | |
| 60 | `Target` | 12 | `target` | `target` | `target` | |
| 61 | `ClipboardCheck` | 12 | `clipboard-check` | `checklist` | `assignment_turned_in` | |
| 62 | `Lightbulb` | 11 | `lightbulb` | `lightbulb` | `lightbulb` | |
| 63 | `Link2` | 11 | `link` | `link` | `link` | |
| 64 | `Briefcase` | 11 | `briefcase` | `briefcase` | `work` | |
| 65 | `Share2` | 11 | `share` | `square.and.arrow.up` | `share` | |
| 66 | `Video` | 11 | `video` | `play.rectangle` | `videocam` | SF `video` is reserved for FaceTime |
| 67 | `Brain` | 10 | `brain` | `brain` | `psychology` | |
| 68 | `Languages` | 10 | `languages` | `character.bubble` | `translate` | |
| 69 | `TrendingDown` | 10 | `trending-down` | `chart.line.downtrend.xyaxis` | `trending_down` | |
| 70 | `School` | 10 | `school` | `building.columns` | `account_balance` | building; the cap is `graduation-cap` |
| 71 | `Rocket` | 10 | `rocket` | `flag` | `rocket_launch` | SF Symbols has no rocket |
| 72 | `Pencil` | 9 | `pencil` | `pencil` | `edit` | |
| 73 | `Filter` | 9 | `filter` | `line.3.horizontal.decrease.circle` | `filter_alt` | Apple's filter convention |
| 74 | `Home` | 9 | `home` | `house` | `home` | |
| 75 | `Heart` | 8 | `heart` | `heart` | `favorite` | |
| 76 | `Bot` | 8 | `bot` | `cpu` | `smart_toy` | SF Symbols has no robot |
| 77 | `Sun` | 8 | `sun` | `sun.max` | `light_mode` | |
| 78 | `Moon` | 8 | `moon` | `moon` | `dark_mode` | |
| 79 | `Wallet` | 8 | `wallet` | `creditcard` | `account_balance_wallet` | `wallet.bifold` needs iOS 18 |
| 80 | `EyeOff` | 7 | `eye-off` | `eye.slash` | `visibility_off` | |

Selected state (tab bars, toggles): pass the `.fill` variant on iOS (`house.fill`) as `sf={{ default: 'house', selected: 'house.fill' }}`. Check that the `.fill` name exists the same way as a new name.

lucide renamed some icons (`CheckCircle2` → `CircleCheck`, `AlertTriangle` → `TriangleAlert`, `Loader2` → `LoaderCircle`, `Home` → `House`); `lucide-react` keeps the old names as aliases. In the web map, use the name that compiles in the app's installed lucide version.

## icon-map.ts shape

```ts
// src/pieces/Icon/icon-map.ts — strings only, no imports
export const iconMap = {
  'arrow-forward': { sf: 'arrow.forward', md: 'arrow_forward', lucide: 'ArrowRight', mirror: true },
  clock: { sf: 'clock', md: 'schedule', lucide: 'Clock', mirror: false },
  plus: { sf: 'plus', md: 'add', lucide: 'Plus', mirror: false },
} as const;

export type IconName = keyof typeof iconMap;
```

`icon-map.ts` is a shared file, so it holds names as strings only. `Icon.web.tsx` imports each lucide component by name, keeps a lookup object (`const lucide = { ArrowRight, Clock, Plus }`), and picks the component by the `lucide` string. Named imports keep unused icons out of the web bundle.

## Checking a new name

- **SF Symbol:** on a Mac, convert the system catalog and look the name up (the value is the year it shipped; 2022 = iOS 16, 2023 = iOS 17):
  `plutil -convert json -o /tmp/sf.json /System/Library/CoreServices/CoreGlyphs.bundle/Contents/Resources/name_availability.plist`
  Then check `/System/Library/CoreServices/CoreGlyphs.bundle/Contents/Resources/symbol_restrictions.strings` for Apple-only symbols (Messages, FaceTime, AirPlay and others).
- **Typecheck:** `sf` props are typed by `sf-symbols-typescript` and `md` props by `expo-symbols` (`AndroidSymbol`), so `npx tsc --noEmit` rejects misspelled names.
- **Material Symbol:** search fonts.google.com/icons, or the codepoints file in `google/material-design-icons` (`variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].codepoints`).
