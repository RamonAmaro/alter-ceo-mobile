# CLAUDE.md — alter-ceo

## Project Overview

alter-ceo is a mobile application built with **Expo (SDK 55)** + **React Native 0.83** + **TypeScript (strict)** targeting iOS, Android, and Web. The app uses **Expo Router** for file-based routing and targets the **Spanish market** (Spain).

## Language Rules

- **Code** (variables, functions, components, comments, commits): always in **English**
- **User-facing text** (labels, messages, placeholders, errors, toasts): always in **Spanish (es-ES)**
- Never display Portuguese or any other language to the user

## Tech Stack

- **Runtime**: Expo ~55, React Native 0.83, React 19
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (file-based, typed routes)
- **State Management**: Zustand (global state) — do NOT use React Context for global state
- **Styling**: `StyleSheet.create()` from React Native — no styled-components, no NativeWind, no Tailwind
- **Fonts**: Montserrat, Nexa-Heavy, TTOctosquares-Black (loaded via expo-font)
- **Package Manager**: Yarn

## Navigation

- **Navigation type**: Bottom Tab navigation (Tab Bar) for main app screens
- **Library**: Expo Router `Tabs` layout inside `(app)/`
- **Tab bar** is rendered only in the `(app)` group — auth screens have no tab bar

## Safe Area

- **Every screen** must account for safe area insets (notch, status bar, home indicator, tab bar)
- Use `react-native-safe-area-context` (`SafeAreaView` or `useSafeAreaInsets`) — never hardcode padding for notch/status bar
- The bottom tab bar already handles its own safe area, so screens inside tabs should handle **top inset** but do NOT add extra bottom padding for the tab bar — the tab navigator handles that
- For screens **outside** the tab navigator (modals, auth screens), handle both top and bottom insets
- Prefer `useSafeAreaInsets()` hook over `SafeAreaView` when you need fine-grained control over individual edges

```tsx
// Standard pattern for a tab screen
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* content */}
    </View>
  );
}
```

## Architecture & File Structure

```
src/
├── app/                    # Expo Router pages & layouts
│   ├── _layout.tsx         # Root layout (providers, font loading)
│   ├── (app)/              # Authenticated routes (Tab navigator)
│   │   ├── _layout.tsx     # Tab layout with bottom tab bar
│   │   ├── home.tsx        # Screen file (thin — imports from components/)
│   │   └── components/     # Components used ONLY by this screen group
│   │       ├── premium-chart.tsx
│   │       └── glass-card.tsx
│   └── (auth)/             # Auth routes (Stack, no tab bar)
├── components/             # Shared/reusable UI components (used across 2+ screens)
├── stores/                 # Zustand stores (global state)
├── services/               # API calls, external integrations
├── utils/                  # Pure utility/helper functions
├── hooks/                  # Custom React hooks (only when truly needed)
├── constants/              # Design tokens, config values
├── contexts/               # React Contexts (only for dependency injection, NOT global state)
└── types/                  # Shared TypeScript types/interfaces
assets/
├── fonts/
└── images/
```

### Component Organization Rules

- **Always break down** screens into small, focused sub-components. Each component should have a single responsibility
- **Screen files** (e.g., `home.tsx`) should be thin orchestrators — they compose sub-components, not implement UI details
- **Page-local components**: If a component is used only within one screen/group, place it in a `components/` folder next to the screen file (e.g., `src/app/(app)/components/premium-chart.tsx`)
- **Shared components**: If a component is used across 2+ screens, move it to `src/components/`
- **Max ~150 lines per file**. If a file grows beyond this, split it into sub-components
- **One component per file. One responsibility per function**

```
# Example: Home screen broken into sub-components
src/app/(app)/
├── home.tsx                     # Thin screen — composes sub-components
└── components/
    ├── cerebro-card.tsx         # "El Cerebro ALTER CEO" card
    ├── rentability-card.tsx     # Rentabilidad card
    ├── machines-card.tsx        # Sala de Máquinas + chart
    ├── premium-chart.tsx        # SVG chart component
    ├── reunion-card.tsx         # Grabar Reunión card
    ├── glass-card.tsx           # Reusable glass card wrapper
    └── chat-input-bar.tsx       # Bottom chat input
```

## Naming Conventions

- **Files & folders**: `kebab-case` — e.g., `user-profile.tsx`, `auth-store.ts`, `format-date.ts`
- **Components**: `PascalCase` exports in `kebab-case` files — e.g., `user-card.tsx` exports `UserCard`
- **Hooks**: `camelCase` with `use` prefix — file: `use-auth.ts`, export: `useAuth`
- **Stores (Zustand)**: file: `auth-store.ts`, export: `useAuthStore`
- **Utils**: file: `format-currency.ts`, export: `formatCurrency`
- **Types/Interfaces**: `PascalCase` — e.g., `UserProfile`, `AuthState`
- **Constants**: `UPPER_SNAKE_CASE` — e.g., `MAX_RETRY_COUNT`, `API_BASE_URL`

## Code Style Rules

### General

- Use **ESLint + Prettier** for formatting and linting
- Max file length: ~150 lines. If a file grows beyond this, split it
- One component per file. One responsibility per function
- Prefer `const` over `let`. Never use `var`
- Use explicit return types on exported functions
- Use `interface` for object shapes, `type` for unions/intersections

### Components

- Keep components small and focused — split early
- **Never** process/transform data inside JSX or component body — move logic to `utils/`
- Props must be typed with an `interface` named `ComponentNameProps`
- Avoid inline styles — always use `StyleSheet.create()`
- Destructure props in the function signature

```tsx
// Good
interface UserCardProps {
  name: string;
  role: string;
}

export function UserCard({ name, role }: UserCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{formatUserName(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ... },
  name: { ... },
});
```

### State Management

- **Zustand** for all global/shared state (auth, user, settings, etc.)
- **Local `useState`** only for UI-local state (form inputs, toggles, modals)
- Do NOT use React Context for state management — Context is only for dependency injection (e.g., theme provider from libraries)
- Zustand stores go in `src/stores/` with the naming pattern `<domain>-store.ts`

```ts
// src/stores/auth-store.ts
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  signIn: async (email, password) => {
    // call API via services/
    set({ isAuthenticated: true });
  },
  signOut: () => set({ isAuthenticated: false }),
}));
```

### Hooks vs Functions

- **Avoid creating hooks for everything**. Prefer plain functions with single responsibilities
- Use hooks **only** when you genuinely need React lifecycle (useEffect, useState, useCallback, etc.)
- Business logic, data transformation, formatting, validation → **plain functions in `utils/`**
- API calls → **plain async functions in `services/`**

```ts
// BAD — unnecessary hook
function useFormatPrice(value: number) {
  return useMemo(() => `€${value.toFixed(2)}`, [value]);
}

// GOOD — plain utility function
function formatPrice(value: number): string {
  return `€${value.toFixed(2)}`;
}
```

### Styling

- Always use `StyleSheet.create()` at the bottom of the component file
- Theme colors/spacing come from `src/constants/theme.ts`
- Use the existing spacing scale: `spacing.half` (2), `spacing.one` (4), `spacing.two` (8), `spacing.three` (16), `spacing.four` (24), `spacing.five` (32), `spacing.six` (64)
- Support both light and dark mode using the theme system

### Data Processing & Utils

- All data transformation, formatting, filtering, sorting → `src/utils/`
- Each util file should have a single responsibility
- Utils must be pure functions (no side effects)
- Always write utils as named exports, not default exports

### Services

- All API/backend calls go in `src/services/`
- Each service file groups related endpoints (e.g., `auth-service.ts`, `user-service.ts`)
- Services return typed data, handle HTTP errors internally
- Never call APIs directly from components — always go through services

## Import Order

1. React / React Native
2. Expo packages
3. Third-party libraries
4. `@/` aliased local imports (components, stores, utils, etc.)
5. Relative imports (same module)

## Error Handling

- Display user-facing errors in **Spanish**
- Log technical errors in **English**
- Never show raw error messages to users — always provide friendly Spanish messages
- Handle loading and error states in every screen that fetches data

## Git & Commits

- Commit messages in **English**
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `test:`
- Keep commits small and focused

## Cross-Platform Compatibility (iOS & Android)

- Always verify that styles and APIs work on **both iOS and Android**
- **Shadows**: Use `shadowColor/shadowOffset/shadowOpacity/shadowRadius` for iOS and `elevation` for Android — use `Platform.select()` when both are needed
- **`overflow: "hidden"` + `borderRadius`**: Works on both, but test nested views on Android (may need `borderRadius` on parent AND child)
- Prefer **Expo APIs** over bare RN modules — they handle platform differences internally
- Never use platform-specific imports (e.g., `.ios.tsx`) without providing the counterpart (`.android.tsx`)
- Test gradients (`expo-linear-gradient`), blur effects, and animations on both platforms — rendering can differ
- When using `Platform.OS` checks, always handle both `"ios"` and `"android"` cases explicitly
- Avoid iOS-only styling properties (`backdrop-filter`, `textDecorationStyle: "dotted"` on Android < API 28, etc.)

## Performance

- Use `React.memo` only when there's a proven render issue — don't pre-optimize
- Use `FlatList` instead of `ScrollView` + `.map()` for lists
- Avoid anonymous functions in `renderItem` and event handlers inside lists
- Minimize re-renders by keeping state as close to where it's needed as possible

## Security

- Never store sensitive data (tokens, passwords) in plain AsyncStorage — use expo-secure-store
- Validate all user inputs before sending to API
- Never log sensitive information (tokens, passwords, personal data)

## Testing (when applicable)

- Unit tests for utils and stores
- Prefer testing behavior over implementation details
- Test files next to source: `format-date.test.ts` alongside `format-date.ts`
