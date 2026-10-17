# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start      # start the dev server
npx tsc --noEmit    # typecheck
```

## Folder map

- `App.tsx` — root component, registered via `index.ts`. Currently the default Expo template placeholder screen.
- `src/` — intended home for app code (components, hooks, utils, screens). Does not exist yet; create it when adding the first non-trivial piece of app logic.
- `assets/` — static images used by `app.json` (app icon, splash icon, adaptive icon layers, favicon).

## Code style

- TypeScript strict mode (`expo/tsconfig.base` + `"strict": true`).
- Function components with hooks only — no class components.
- Style with `StyleSheet.create`, not inline style objects or other styling libraries.
- Never use `any`; type everything explicitly or let TypeScript infer.
- Keep components small and focused — split out a new component rather than growing one file.

## Never do

- Never add any UI library or any other npm package. Only React Native core components (project rule).
- Never read `.env`.
- Never run `git push --force` or push to `main`.
- Never merge pull requests.
