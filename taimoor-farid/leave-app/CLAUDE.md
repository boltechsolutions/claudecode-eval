# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project rule: React Native core only

- Use only React Native core components and APIs (`View`, `Text`, `Pressable`, `FlatList`, `StyleSheet`, etc.). Do not add any UI library.
- Do not add any other package either. Do not run `npx expo install`, `npm install`, `bun add`, or similar, and do not edit the dependencies in `package.json`.
- If a task seems to need a new package, build it with core components or ask the user first.

This rule overrides the AGENTS.md guidance to prefer Expo modules or install packages.

## Current state of this app

- Still the untouched Expo blank-TypeScript template: `index.ts` calls `registerRootComponent(App)` and `App.tsx` is the single placeholder screen. There are no tests, no lint config and no `lint`/`test` scripts in `package.json`.
- Package manager is npm (`package-lock.json`, no `bun.lock`), so use `npx`, not `bunx`.
- Stack: Expo SDK 57, React 19.2, React Native 0.86, TypeScript 6 with `strict: true` (extends `expo/tsconfig.base`).
- `expo-router` is **not** installed and there is no `src/app/`. The Expo Router guidance in AGENTS.md does not apply yet. Because of the no-new-packages rule above, do not add it without asking the user; until then, screens hang off `App.tsx`.
- `app.json` pins portrait orientation and a light UI style. `ios/` and `android/` do not exist (Continuous Native Generation), so configure native behavior in `app.json`.

## Commands

- `npm start` (`expo start`), `npm run ios`, `npm run android`, `npm run web`
- Typecheck: `npx tsc --noEmit`
- `npx expo lint` is listed in AGENTS.md, but it would prompt to install ESLint packages, which the no-new-packages rule forbids. Ask the user before running it.

## Repository layout

- This app lives at `taimoor-farid/leave-app/` inside a larger git repo (root `claudecode-eval/`) that holds one sibling folder per contributor. The earlier commits touch `ameer-hamza/leave-app/` (a leave-requests screen, `LeaveTable`/`ActionButton` components, checklist and session-prompt files), which is a separate app, not part of this one.
- Branches are per-ticket (`TICKET-<n>-<Name>`). The main branch used for PRs is `TICKET-100-Ameer-Hamza`.
