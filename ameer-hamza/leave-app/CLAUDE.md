# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

`leave-app` is a freshly scaffolded Expo app (blank TypeScript template) — no app features exist yet.

- Versions: Expo SDK **57** (`expo ~57.0.27`), React Native 0.86, React 19.2, TypeScript 6 (`strict`, extends `expo/tsconfig.base`). Versioned docs: https://docs.expo.dev/versions/v57.0.0/
- Package manager is **npm** (`package-lock.json`, no `bun.lock`), so use `npx`, not `bunx`.
- `ios/` and `android/` are gitignored (Continuous Native Generation).

## Commands

npm scripts: `npx expo start`.
TypeScript: `npx tsc --noEmit`.

## Folder Structure
- App start from root file App.tsx.
- screens should be in the app/ folder.
- components should be in the components/ folder.

## Coding Conventions

- use TypScript must
- Use only react native core components. Means no used any other library.
- use accessibilityLabel

## Never do

- Never used any other package means used the already installed packages.
- Never force pushed in git.
- Never read the .env file