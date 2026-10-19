# Contributing to Saudi Expo

Thank you for your interest in contributing to **Saudi Expo**!

Saudi Expo is an open-source agent skill designed to guide AI agents and developers in building Expo / React Native applications that feel native on iOS/iPadOS, adhere to the Saudi Soft design system, and support seamless web and Android deployments.

## Repository Nature

> [!IMPORTANT]
> This repository is a **distributable agent skill**, not an Expo application itself.
> Do **not** run `create-expo-app`, `expo prebuild`, or `shadcn init` in this repository, and do **not** add `package.json`, `app.json`, or `src/` to the repository root.

## Layout & Architecture

```
README.md                         Human install + overview (single source)
LICENSE                           MIT License
SECURITY.md                       Vulnerability reporting policy
CONTRIBUTING.md                   Contribution guide
skills.sh.json                    skills.sh grouping metadata
.claude-plugin/marketplace.json   Claude Code / Skill picker metadata
skills/saudi-expo/
  SKILL.md                        Main agent skill entry
  rules/                          Hand-off and quality checklists
  references/                     Architecture, pieces catalog, tokens, RTL, icons, native modules
  scripts/                        Helper scripts (e.g. check-shared.js)
  evals/                          Evals for testing the skill
```

## Contribution Rules

When proposing changes, please adhere to our core rules:

1. **Behavior in `SKILL.md`**: Keep `SKILL.md` concise (under ~300 lines). Reference detailed tables, recipes, and guides in `references/` and `rules/`.
2. **Token Parity**: `skills/saudi-expo/references/tokens.ts` mirrors `saudi-soft`'s `theme-bridge.css`. Changes to design tokens must keep both aligned.
3. **Verified Facts**: Every Expo or Apple API referenced should be verified against official documentation (`docs.expo.dev`, `developer.apple.com`) or package type definitions. If a detail cannot be verified immediately, mark it with `// verify at use`.
4. **Icons**: When adding icons, provide a mapping for all three targets: an SF Symbol (iOS 16.4+), a Material Symbol (Android), and a Lucide icon (Web).
5. **Scripts**: Scripts in `scripts/` must be pure CommonJS (`require`) with **zero external dependencies** so they can run directly in any consumer project via Node.js.
6. **No Artifact Commits**: Never commit `.env*`, `skills-lock.json`, `.claude/`, or `node_modules/`.

## Pull Request Process

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make sure your changes strictly follow the repository guidelines above.
3. Write clear, imperative commit messages following standard conventional commit guidelines:
   ```bash
   git commit -m "feat(icons): add calendar and clock SF Symbol mappings"
   ```
4. Push your branch to your fork and submit a Pull Request to `main`.
5. Provide a clear description in your PR of what changes were made and why.

Thank you for helping make Saudi Expo better!
