#!/usr/bin/env node
// check-shared.js — Saudi Expo shared-file checker.
// CommonJS, zero dependencies. Runs from the consumer app's root (process.cwd()).
//
// Shared files are every file under the screens, pieces, logic and route folders except
// web files (`*.web.*`, or a plain file overridden by a `.native` sibling) and DOM
// components (files that start with 'use dom').
// They run on iOS and Android, so they must not use web-only UI or browser APIs.
// Route folders (src/app and app) use the same denylist as screens.
//
// Usage:
//   node path/to/saudi-expo/scripts/check-shared.js
//   node path/to/saudi-expo/scripts/check-shared.js --screens src/screens --pieces src/pieces --logic src/logic --routes src/app
//   node path/to/saudi-expo/scripts/check-shared.js --json
//
// Exit codes: 0 = clean, 1 = problems found, 2 = usage error or nothing to scan.
// Silence one line only with a reason:  // check-shared-ignore: <reason>

const fs = require("fs")
const path = require("path")

const SOURCE_EXTS = ["ts", "tsx", "mjs", "js", "jsx"] // Expo SDK 58 Metro order
const PLATFORMS = ["ios", "android", "native", "web"]
const IGNORE_MARK = "check-shared-ignore"

const DOM_TAGS = [
  "div", "span", "p", "a", "button", "img", "input", "textarea", "select", "option",
  "form", "label", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "table",
  "thead", "tbody", "tfoot", "tr", "td", "th", "section", "article", "header",
  "footer", "nav", "main", "aside", "svg", "path", "iframe", "video", "audio",
  "canvas", "br", "hr", "strong", "em", "small", "code", "pre", "blockquote",
  "figure", "dialog",
]

const WEB_MODULES = [
  { test: (s) => s === "lucide-react" || s.startsWith("lucide-react/"), fix: "use the Icon piece with a shared icon name (references/icons.md)" },
  { test: (s) => s.startsWith("@radix-ui/"), fix: "use the matching piece; Radix belongs in .web.tsx files" },
  { test: (s) => s === "react-router-dom" || s === "react-router", fix: "use Link / useRouter / useLocalSearchParams from expo-router" },
  { test: (s) => s === "sonner", fix: "use the Toast piece (useToast)" },
  { test: (s) => s === "framer-motion" || s === "motion" || s.startsWith("motion/"), fix: "drop decorative motion; meaningful motion goes inside a piece (react-native-reanimated)" },
  { test: (s) => s === "react-dom" || s.startsWith("react-dom/"), fix: "react-dom is web-only; move the code to a .web.tsx file" },
  { test: (s) => s === "next-themes", fix: "read the color scheme with useColorScheme from react-native" },
  { test: (s) => s.startsWith("@/components/ui/") || s === "@/components/ui", fix: "shadcn components belong in .web.tsx piece files; import pieces instead" },
]

const SCREEN_PLATFORM_MODULES = [
  "@expo/ui", "expo-glass-effect", "expo-symbols", "expo-blur", "expo-image",
  "react-native-svg", "react-native-reanimated", "@react-native-community/datetimepicker",
  "@expo/vector-icons",
]

const RN_UI_NAMES = new Set([
  "View", "Text", "ScrollView", "FlatList", "SectionList", "VirtualizedList", "Pressable",
  "TouchableOpacity", "TouchableHighlight", "TouchableWithoutFeedback", "Image",
  "ImageBackground", "TextInput", "Switch", "Modal", "ActivityIndicator", "Button",
  "RefreshControl", "KeyboardAvoidingView", "SafeAreaView", "StatusBar", "StyleSheet", "Alert",
])

function usage() {
  return [
    "Usage: node check-shared.js [--screens <dir>]... [--pieces <dir>]... [--logic <dir>]... [--routes <dir>]... [--json]",
    "Defaults (relative to the current directory): --screens src/screens --pieces src/pieces --logic src/logic --routes src/app --routes app",
    "Passing any folder flag replaces all defaults. A missing default folder is skipped.",
  ].join("\n")
}

function parseArgs(argv) {
  const roles = { screens: [], pieces: [], logic: [], routes: [] }
  let json = false
  let custom = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") return { help: true }
    if (arg === "--json") { json = true; continue }
    const role = arg.replace(/^--/, "")
    if (role in roles) {
      const value = argv[i + 1]
      if (!value || value.startsWith("--")) return { error: `Missing folder after ${arg}` }
      roles[role].push(value)
      custom = true
      i++
      continue
    }
    return { error: `Unknown argument: ${arg}` }
  }
  if (!custom) {
    roles.screens.push("src/screens")
    roles.pieces.push("src/pieces")
    roles.logic.push("src/logic")
    roles.routes.push("src/app")
    roles.routes.push("app")
  }
  return { roles, json, custom }
}

function walk(dir, out) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const ent of entries) {
    if (ent.name === "node_modules" || ent.name.startsWith(".")) continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, out)
    else if (/\.(ts|tsx|mjs|js|jsx)$/.test(ent.name) && !ent.name.endsWith(".d.ts")) out.push(full)
  }
  return out
}

// Split "Button.ios.tsx" into { base: "Button", platform: "ios", ext: "tsx" }.
function splitName(fileName) {
  const parts = fileName.split(".")
  const ext = parts.pop()
  let platform = null
  if (parts.length > 1 && PLATFORMS.includes(parts[parts.length - 1])) platform = parts.pop()
  return { base: parts.join("."), platform, ext }
}

// Blank out comments, keep strings and line breaks so positions stay true.
function stripComments(src) {
  let out = ""
  let i = 0
  let quote = null
  while (i < src.length) {
    const c = src[i]
    const next = src[i + 1]
    if (quote) {
      out += c
      if (c === "\\") { out += next || ""; i += 2; continue }
      if (c === quote || (c === "\n" && quote !== "`")) quote = null
      i++
      continue
    }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i++ }
      continue
    }
    if (c === "/" && next === "*") {
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { out += src[i] === "\n" ? "\n" : " "; i++ }
      out += "  "
      i += 2
      continue
    }
    if (c === "'" || c === '"' || c === "`") quote = c
    out += c
    i++
  }
  return out
}

function lineStarts(text) {
  const starts = [0]
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1)
  return starts
}

function position(starts, index) {
  let lo = 0
  let hi = starts.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (starts[mid] <= index) lo = mid
    else hi = mid - 1
  }
  return { line: lo + 1, col: index - starts[lo] + 1 }
}

function isDomComponent(src) {
  const head = src.replace(/^(\s*(\/\/[^\n]*|\/\*[\s\S]*?\*\/))*\s*/, "")
  return /^['"]use dom['"]/.test(head)
}

function checkFile(file, role, report) {
  const raw = fs.readFileSync(file, "utf8")
  const rawLines = raw.split("\n")
  const text = stripComments(raw)
  const starts = lineStarts(text)

  const add = (index, rule, message) => {
    const { line, col } = position(starts, index)
    const lineText = rawLines[line - 1] || ""
    if (lineText.includes(IGNORE_MARK) || (rawLines[line - 2] || "").includes(IGNORE_MARK + "-next-line")) {
      report.suppressed.push({ file, line, rule })
      return
    }
    report.problems.push({ file, line, col, rule, message })
  }

  // 1. Web DOM elements in JSX.
  const domRe = new RegExp(`(^|[^\\w$.])<(${DOM_TAGS.join("|")})(?=[\\s>/])`, "g")
  for (const m of text.matchAll(domRe)) {
    add(m.index + m[1].length, "dom-tag", `<${m[2]}> is a web element → use a piece (Stack, Row, Text, Button, Card…)`)
  }

  // 2. className props.
  for (const m of text.matchAll(/\bclassName\s*=/g)) {
    add(m.index, "classname", "className is web styling → pass piece props; styles live inside piece files")
  }

  // 3. Module specifiers.
  const specRe = /(\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)(['"])([^'"\n]+)\2/g
  for (const m of text.matchAll(specRe)) {
    const spec = m[3]
    const at = m.index + m[1].length
    const web = WEB_MODULES.find((w) => w.test(spec))
    if (web) add(at, "web-import", `'${spec}' is web-only → ${web.fix}`)
    if (/\.(ios|android|web|native)(\.(tsx?|jsx?))?$/.test(spec)) {
      add(at, "platform-file-import", `'${spec}' names a platform file → import the base path; Metro picks the platform file`)
    }
    if ((role === "screens" || role === "routes") && SCREEN_PLATFORM_MODULES.some((p) => spec === p || spec.startsWith(p + "/"))) {
      add(at, "platform-ui-in-screen", `'${spec}' is platform UI → use it inside a piece file, import the piece in the screen`)
    }
  }

  // 4. Browser globals and Vite env.
  for (const m of text.matchAll(/(^|[^\w$.])(window|document)\s*\./g)) {
    add(m.index + m[1].length, "browser-global", `${m[2]}. exists only in browsers → move it behind an adapter (x.ts + x.web.ts) or rename the variable`)
  }
  for (const m of text.matchAll(/(^|[^\w$.])(localStorage|sessionStorage)\b/g)) {
    add(m.index + m[1].length, "browser-global", `${m[2]} exists only in browsers → use the storage adapter`)
  }
  for (const m of text.matchAll(/\bimport\.meta\.env\b/g)) {
    add(m.index, "browser-global", "import.meta.env is Vite-only → read process.env.EXPO_PUBLIC_* through the env adapter")
  }

  // 5. Screen and route rules: closed vocabulary of pieces, no platform branches.
  if (role === "screens" || role === "routes") {
    const rnRe = /\bimport\s+(type\s+)?\{([^}]*)\}\s*from\s*(['"])react-native\3/g
    for (const m of text.matchAll(rnRe)) {
      if (m[1]) continue
      const names = m[2]
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n && !n.startsWith("type "))
        .map((n) => n.split(/\s+as\s+/)[0].trim())
      const ui = names.filter((n) => RN_UI_NAMES.has(n))
      if (ui.length) {
        const where = role === "routes"
          ? "route files re-export a screen or host the navigator"
          : "screens build UI from pieces only"
        add(m.index, "rn-ui-in-screen", `${where} → replace ${ui.join(", ")} from react-native with pieces (references/pieces.md)`)
      }
    }
    for (const m of text.matchAll(/\bPlatform\s*\.\s*(OS|select)\b/g)) {
      const where = role === "routes" ? "a route file" : "a screen"
      add(m.index, "platform-branch-in-screen", `Platform.${m[1]} in ${where} → move the difference into a piece, or use a variant file under the variant rule`)
    }
  }
}

// A plain file that has a `.native` sibling (or both `.ios` and `.android`) with the
// same extension never loads on iOS or Android, so it is a web file. This is the
// monorepo case: the Vite app owns `storage.ts`, the Expo app adds `storage.native.ts`.
function nativeOverrides(files) {
  const byKey = new Map()
  for (const file of files) {
    const { base, platform, ext } = splitName(path.basename(file))
    const key = path.join(path.dirname(file), base) + "." + ext
    if (!byKey.has(key)) byKey.set(key, { plain: null, platforms: new Set() })
    const entry = byKey.get(key)
    if (platform) entry.platforms.add(platform)
    else entry.plain = file
  }
  const overridden = new Set()
  for (const { plain, platforms } of byKey.values()) {
    if (plain && (platforms.has("native") || (platforms.has("ios") && platforms.has("android")))) overridden.add(plain)
  }
  return overridden
}

function checkCollisions(files, report) {
  const groups = new Map()
  for (const file of files) {
    const { base, platform, ext } = splitName(path.basename(file))
    const key = path.join(path.dirname(file), base)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ file, platform, ext })
  }
  for (const [, list] of groups) {
    const plain = list.filter((f) => !f.platform)
    if (!plain.length) continue
    const plainIdx = Math.min(...plain.map((f) => SOURCE_EXTS.indexOf(f.ext)))
    for (const f of list) {
      if (f.platform && SOURCE_EXTS.indexOf(f.ext) > plainIdx) {
        const winner = plain.find((p) => SOURCE_EXTS.indexOf(p.ext) === plainIdx)
        report.problems.push({
          file: f.file, line: 1, col: 1, rule: "resolution-collision",
          message: `Metro resolves ${path.basename(winner.file)} before ${path.basename(f.file)}, so this platform file never loads → give every file of the group the same extension`,
        })
      }
    }
  }
}

function checkPieceFolders(dir, report) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith("_") || ent.name.startsWith(".")) continue
    const name = ent.name
    const folder = path.join(dir, name)
    for (const required of [`${name}.types.ts`, `${name}.tsx`]) {
      if (!fs.existsSync(path.join(folder, required))) {
        report.problems.push({
          file: path.join(folder, required), line: 1, col: 1, rule: "piece-structure",
          message: `piece '${name}' is missing ${required} → every piece has a contract (${name}.types.ts) and a default file (${name}.tsx)`,
        })
      }
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) { console.log(usage()); process.exit(0) }
  if (args.error) { console.error(args.error + "\n" + usage()); process.exit(2) }

  const cwd = process.cwd()
  const report = { problems: [], suppressed: [], scanned: [], skipped: { web: 0, dom: 0 } }
  const allFiles = []
  const missing = []

  for (const role of ["screens", "pieces", "logic", "routes"]) {
    for (const rel of args.roles[role]) {
      const dir = path.resolve(cwd, rel)
      if (!fs.existsSync(dir)) {
        missing.push(rel)
        continue
      }
      const files = walk(dir, [])
      allFiles.push(...files)
      const nativeOverridden = nativeOverrides(files)
      let count = 0
      for (const file of files) {
        const { platform } = splitName(path.basename(file))
        if (platform === "web") { report.skipped.web++; continue }
        if (!platform && nativeOverridden.has(file)) { report.skipped.web++; continue }
        if (isDomComponent(fs.readFileSync(file, "utf8"))) { report.skipped.dom++; continue }
        checkFile(file, role, report)
        count++
      }
      if (role === "pieces") checkPieceFolders(dir, report)
      report.scanned.push({ role, dir: rel, files: count })
    }
  }

  if (!report.scanned.length) {
    console.error(`check-shared: nothing to scan. Missing: ${missing.join(", ")}\n${usage()}`)
    process.exit(2)
  }
  if (args.custom && missing.length) {
    console.error(`check-shared: folder not found: ${missing.join(", ")}`)
    process.exit(2)
  }

  checkCollisions(allFiles, report)

  const rel = (f) => path.relative(cwd, f)
  report.problems.sort((a, b) => (a.file !== b.file ? (a.file < b.file ? -1 : 1) : a.line - b.line || a.col - b.col))

  if (args.json) {
    console.log(JSON.stringify({
      scanned: report.scanned,
      skipped: report.skipped,
      suppressed: report.suppressed.map((s) => ({ ...s, file: rel(s.file) })),
      problems: report.problems.map((p) => ({ ...p, file: rel(p.file) })),
    }, null, 2))
  } else {
    const scanned = report.scanned.map((s) => `${s.dir} (${s.files} file(s))`).join(", ")
    console.log(`check-shared: scanned ${scanned}; skipped ${report.skipped.web} web file(s), ${report.skipped.dom} DOM component(s)`)
    if (missing.length) console.log(`check-shared: not present (skipped): ${missing.join(", ")}`)
    for (const p of report.problems) console.log(`${rel(p.file)}:${p.line}:${p.col}  ${p.rule}  ${p.message}`)
    for (const s of report.suppressed) console.log(`${rel(s.file)}:${s.line}  suppressed  ${s.rule}`)
    const files = new Set(report.problems.map((p) => p.file)).size
    if (report.problems.length) console.log(`\n✗ ${report.problems.length} problem(s) in ${files} file(s).`)
    else console.log(`\n✓ No problems.${report.suppressed.length ? ` ${report.suppressed.length} suppressed line(s) listed above.` : ""}`)
  }
  process.exit(report.problems.length ? 1 : 0)
}

main()
