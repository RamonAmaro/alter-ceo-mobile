# AGENTS.md — alter-ceo

## Project Overview

alter-ceo is a cross-platform application built with **Expo (SDK 55)** + **React Native 0.83** + **TypeScript (strict)** targeting **iOS, Android, and Web** (all 3 platforms mandatory). The app uses **Expo Router** for file-based routing and targets the **Spanish market** (Spain).

## Tech Stack

- **Runtime**: Expo ~55, React Native 0.83, React 19
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (file-based, typed routes)
- **State Management**: Zustand (global state) — do NOT use React Context for global state
- **Styling**: `StyleSheet.create()` from React Native — no styled-components, no NativeWind, no Tailwind
- **Fonts**: Montserrat (static weights via `@expo-google-fonts/montserrat`), Nexa-Heavy, TTOctosquares-Black (loaded via expo-font)
- **Typography**: Centralized via `ThemedText` component (`src/components/themed-text.tsx`) + `Typography` scale in `src/constants/theme.ts`
- **Package Manager**: Yarn

## Rules

All detailed coding rules, patterns, and conventions are organized in `.Codex/rules/`:

| Rule File | Scope |
|---|---|
| `language-rules.md` | Language rules: pt-BR (dev), English (code), Spanish (UI) |
| `architecture.md` | File structure, component organization, navigation, safe area, import order |
| `naming-conventions.md` | Naming patterns for files, components, hooks, stores, types, constants |
| `typescript-patterns.md` | TypeScript best practices: strict mode, generics, discriminated unions, narrowing |
| `react-native-patterns.md` | React Native patterns: components, hooks, lists, images, keyboard, modals, refs |
| `functional-code.md` | Functional & immutable code: pure functions, no mutation, explicit data flow |
| `state-management.md` | Zustand, selectors, services, hooks vs functions |
| `styling.md` | StyleSheet, ThemedText, fonts, theme system, icons, flexbox |
| `performance.md` | Rendering optimization, FlatList, images, animations, memory, bundle size, async |
| `cross-platform.md` | iOS, Android & Web compatibility — mandatory 100% cross-platform support (3 platforms) |
| `animations.md` | Animated API, native driver, patterns (fade, slide, stagger), no LayoutAnimation |
| `error-handling.md` | Error handling, loading states, security |
| `git-conventions.md` | Commit messages, conventional commits, branch naming |

**All rules are mandatory. Cross-platform compatibility (iOS + Android + Web) is a non-negotiable requirement for all 3 platforms.**
