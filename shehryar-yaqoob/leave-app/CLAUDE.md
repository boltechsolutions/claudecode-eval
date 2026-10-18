# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- Start: `npx expo start` (`--android` / `--ios` / `--web` variants)
- Typecheck: `npx tsc --noEmit`

## Folder map

- `App.tsx` — entry point, registered in `index.ts` via `registerRootComponent`
- `src/` — all app code: Expo Router screens in `src/app/` (`_layout.tsx` = navigator), everything else (components, hooks, utils) alongside it, outside `src/app/`. Doesn't exist yet — create it when the first screen/component is added.
- `assets/` — app icons and splash images

## Code style

- TypeScript strict mode — no `any`
- Function components + hooks only, no class components
- Style with `StyleSheet.create`, not inline style objects
- Keep components small and focused; split out a new component rather than growing one

## Never do

- Never add a UI library or any other npm package — use only React Native core components (`View`, `Text`, `Pressable`, `FlatList`, `SafeAreaView`, `ScrollView`, `Alert`, etc.)
- Never read `.env` files
- Never `git push --force`, and never push to `main`
- Never merge pull requests
