# Converting a web screen

The recipe for porting an existing React page (shadcn/ui, Tailwind, lucide, react-router, sonner, framer-motion, recharts) into one shared screen that runs on iOS, web and later Android.

## The golden screen rule

The **golden screen** is the first converted screen the owner approved. Its path is written in the app's `AGENTS.md` under "Golden screen". Every later conversion copies its structure: the file layout, the order of blocks (`Screen` → KPI `Grid` → `Section`s), how it calls logic hooks, and how it shows loading, empty and error states.

No golden screen yet: convert one screen with the template at the end of this file, hand it to the owner with screenshots, and record its path in `AGENTS.md` once he approves. Convert the second screen only after that.

## Steps

1. **Inventory.** Read the web page and list, in the hand-off notes: the data hooks it calls, every UI element, every navigation call, toasts, animations, charts, and every web-only API (`window`, `document`, `localStorage`, `import.meta.env`). Done when each line of the page's JSX is accounted for in the list.
2. **Lift the logic.** Hooks, queries, mutations, validation and derived values stay in logic (`src/logic`, or the web app's `src/` in a monorepo). A Supabase call or computation written inside the component moves into a logic hook first, and the web page switches to that hook too. Done when the screen component calls hooks only.
3. **Map the UI.** Give every inventory element a piece from the mapping table below. An element no row covers is a missing piece: add it (SKILL.md, "Add a piece" workflow) before writing the screen. Done when no element is left unmapped.
4. **Write the screen** in `src/screens/<feature>/<Name>Screen.tsx`, copying the golden screen's structure, and add the route file that re-exports it.
5. **Strings.** Keep the page's i18n keys (`t('…')`). Every user-facing string comes from the i18n file; Arabic literals in JSX stay out.
6. **Check.** `node <skill>/scripts/check-shared.js` and `npx tsc --noEmit` pass, then run rules/review-checklist.md.

## Mapping table

| Web | Shared screen |
| --- | --- |
| `<div className="flex flex-col gap-4">` | `<Stack gap={4}>` |
| `<div className="flex items-center justify-between gap-2">` | `<Row gap={2} align="center" justify="between">` |
| `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">` | `<Grid columns={{ compact: 1, regular: 3 }} gap={4}>` |
| page wrapper + `<h1>` + description | `<Screen title subtitle icon>` |
| `<h2>`, `<h3>`, `CardTitle` | `<Heading level={2 \| 3}>` or `Section title` |
| `<p>`, `<span>`, `<label>`, `<small>` | `<Text variant="body" \| "muted" \| "label" \| "caption">` |
| `Card` used as a section | `<Section title description action>` |
| `Card` used as a tile or link | `<Card href>`, `<HubCard>`, `<KpiCard>` |
| `Button` (`default` / `outline`, `secondary` / `destructive` / `ghost`, `link`) | `<Button variant="primary" \| "secondary" \| "destructive" \| "plain">` |
| `Button size="icon"` | `<IconButton icon accessibilityLabel>` |
| `Badge` | `<Badge tone>` |
| `Input`, `Textarea` (+ `Label`) | `<TextField label multiline?>` inside `<Form>` |
| `Select` | `<Select>` |
| `RadioGroup`, `ToggleGroup` with 2–5 options | `<Segmented>` |
| `RadioGroup` with 6+ options | `<Select>` |
| `Switch`, `Checkbox` | `<Switch>`, `<Checkbox>` |
| `Calendar` / date picker | `<DatePicker>` |
| `Table` | `<DataTable>`; more than 6 editable columns → variant rule 1 |
| `Tabs` | `<Tabs>` piece |
| `AlertDialog` / confirm `Dialog` | `const confirm = useConfirm()` |
| `Dialog` holding a form | a route with `presentation: 'formSheet'` |
| `Sheet`, `Drawer` | `<Sheet>` (short content) or a `formSheet` route |
| `DropdownMenu` | `<Menu>` |
| `ContextMenu` | `<ContextMenu>` or `ListItem menu` |
| `Tooltip`, `HoverCard` | delete; show the text as `<Text variant="muted">` or `accessibilityHint` (touch has no hover) |
| `Accordion`, `Collapsible` | new piece `Collapsible` (universal `@expo/ui` `Collapsible`, shadcn `Collapsible`) |
| `Skeleton`, `Progress`, `Avatar`, `Separator` | `<Skeleton>`, `<Progress>`, `<Avatar>`, `<Divider>` |
| `ScrollArea` | delete: `Screen` scrolls |
| empty-state markup | `<EmptyState icon title description action>` |
| `<img>` | `<Image source alt>` |
| lucide `<ArrowRight />` | `icon="arrow-forward"` (references/icons.md; decide forward/back first) |
| `<Link to>` / `useNavigate()` / `navigate(-1)` | `<Link href>` / `useRouter().push(href)` / `router.back()` from `expo-router` |
| `<Navigate to>` | `<Redirect href>` from `expo-router` |
| `useParams()`, `useSearchParams()` | `useLocalSearchParams()` |
| `toast.success()` (sonner), shadcn `useToast` | `useToast().show({ title, tone: 'success' })` |
| framer-motion entrance and hover animations | delete (system transitions animate screens); meaningful motion goes inside a piece with `react-native-reanimated` |
| recharts | `<Chart>` |
| react-pdf | `<PdfViewer>` |
| `window.print()` | variant rule 2 (web print layout) |
| `localStorage` | the storage adapter |
| `import.meta.env.VITE_X` | the env adapter (`process.env.EXPO_PUBLIC_X`) |
| `cn()` and conditional classes | piece props (`variant`, `tone`, `align`) |
| `onClick` | `onPress` |
| `dangerouslySetInnerHTML`, Markdown | a DOM component (references/web-layer.md, closed list) |

**Keep unchanged:** TanStack Query hooks and query keys, mutations, `react-hook-form` logic (use `Controller` around field pieces), zod schemas, types, i18n keys, permission and role checks, business rules.

## Traps

| Trap | Fix |
| --- | --- |
| A string directly inside `Stack`, `Row` or `Card` crashes on native ("Text strings must be rendered within a `<Text>` component") | wrap every string in `<Text>` |
| `{count && <Badge />}` renders `0` as a bare string and crashes | `{count > 0 ? <Badge /> : null}` |
| `.map()` over server data inside a scrolling `Screen` | the screen becomes a `List` screen (`Screen scroll={false}`) |
| `List` inside a scrolling `Screen` (nested scroll) | short lists use standalone `ListItem`s in a `Section` |
| hover-only controls (reveal on hover, tooltips) | visible controls, swipe actions or a context menu |
| fields hidden by the keyboard | fields inside `Form`, or a `formSheet` route; `Screen` adjusts keyboard insets |
| CSS grid, `position: absolute`, `vh`, `%` widths | `Grid`, `Row`, `Stack` and flex |
| manual `z-index` overlays | `Sheet`, `Dialog`, `Menu` pieces |
| `<form onSubmit>` | a `Button onPress={handleSubmit(onSubmit)}` |
| `useEffect` with `window` listeners (resize, scroll) | `useSizeClass()`; scroll effects live inside pieces |
| `toLocaleDateString('ar-SA')` | `formatDate` from `src/logic/format.ts` (references/rtl.md) |
| relative image URLs (`/images/x.png`) | `require('@/assets/x.png')` or an absolute URL |
| Tailwind gradients and tints | `KpiCard`, `alpha()`, `gradientCss()` from tokens |
| `ml-*`, `left-*`, `text-left` | logical props through pieces (references/rtl.md) |

## Template: a converted screen

Use this as the golden structure until the owner approves one.

```tsx
// src/screens/dashboard/StudentDashboardScreen.tsx
import { useRouter } from 'expo-router';
import {
  EmptyState, Grid, KpiCard, ListItem, Screen, Section, Skeleton, Stack, useToast,
} from '@/pieces';
import { useMarkAssignmentDone, useStudentDashboard } from '@/logic/dashboard';
import { formatDate, formatNumber } from '@/logic/format';
import { useLanguage } from '@/logic/i18n';

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();
  const { data, isLoading, isRefetching, refetch } = useStudentDashboard();
  const markDone = useMarkAssignmentDone();

  return (
    <Screen
      title={t('dashboard.title')}
      icon="graduation-cap"
      largeTitle
      actions={[{ icon: 'bell', label: t('dashboard.notifications'), onPress: () => router.push('/notifications') }]}
      onRefresh={refetch}
      refreshing={isRefetching}
    >
      {isLoading || !data ? (
        <Stack gap={4}>
          <Skeleton height={96} />
          <Skeleton height={240} />
        </Stack>
      ) : (
        <Stack gap={6}>
          <Grid columns={{ compact: 2, regular: 4 }} gap={4}>
            <KpiCard label={t('dashboard.attendance')} value={`${formatNumber(data.attendance)}%`} icon="check-circle" />
            <KpiCard label={t('dashboard.average')} value={formatNumber(data.average)} icon="trending-up" />
          </Grid>

          <Section
            title={t('dashboard.assignments')}
            action={{ label: t('common.viewAll'), onPress: () => router.push('/assignments') }}
          >
            {data.assignments.length === 0 ? (
              <EmptyState icon="clipboard-check" title={t('dashboard.noAssignments')} />
            ) : (
              data.assignments.slice(0, 5).map((assignment) => (
                <ListItem
                  key={assignment.id}
                  title={assignment.title}
                  subtitle={formatDate(assignment.dueAt)}
                  icon="file-text"
                  href={`/assignments/${assignment.id}`}
                  menu={[
                    {
                      label: t('assignments.markDone'),
                      icon: 'check',
                      onPress: () =>
                        markDone.mutate(assignment.id, {
                          onSuccess: () => toast.show({ title: t('assignments.done'), tone: 'success' }),
                        }),
                    },
                  ]}
                />
              ))
            )}
          </Section>
        </Stack>
      )}
    </Screen>
  );
}
```

```tsx
// src/app/(tabs)/home/index.tsx
export { default } from '@/screens/dashboard/StudentDashboardScreen';
```
