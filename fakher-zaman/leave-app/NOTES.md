# Review Notes — TICKET-103-fakher-zaman vs main (TICKET-100-Ameer-Hamza)

Scope: `git diff TICKET-100-Ameer-Hamza...HEAD` (merge-base `794a805`), reviewed
against `CLAUDE.md`, `CHECKLIST.md`, `PLAN.md`, and `AGENTS.md`, all under
`fakher-zaman/leave-app/`. No code was changed for this review.

## Rules broken

**None broken silently.** One rule is broken on its literal text but with
documented, user-granted authorization:

- `CLAUDE.md` line 28: *"Never add any UI library or any other npm package.
  Only React Native core components (project rule)."*
  `react-native-safe-area-context` was added as a direct dependency
  (`package.json`, `package-lock.json`) to fix the Undo button rendering
  behind the Android gesture-nav bar.
  - The rule text itself carries **no exception clause**.
  - `transcripts/part1.md` (~line 836-839) shows the agent explicitly
    stopped and asked the user how to proceed before installing it; the
    user chose "Add react-native-safe-area-context (Recommended)".
  - `PLAN.md` and `CHECKLIST.md` both retroactively document it as "an
    approved, one-off exception."
  - Net: authorized, but worth flagging because the authorization lives
    only in the transcript/self-written docs, not in `CLAUDE.md` — a
    future reader of `CLAUDE.md` alone would see an absolute rule with no
    sign it was ever relaxed.

## Checklist lines not covered by code

None found. Every checked line in `CHECKLIST.md` (Part 1: title/summary,
per-status card colors, Reject confirmation copy, Cancel no-op, Reject/Approve
transitions + counts, accessibility labels, grouped/sequential Undo,
disabled-Undo state, package list; Part 2: dynamic "Approve N pending
requests?" copy, Approve-all bulk transition + disabled state, grouped Undo
for the bulk action, isolated ordering when mixed with a single reject,
Cancel no-op) is backed by the corresponding logic in
`src/screens/LeaveRequestsScreen.tsx` and `src/components/LeaveRequestCard.tsx`.

## Packages added

- `react-native-safe-area-context` `~5.7.0` — the only package beyond the
  stock Expo template (`expo`, `expo-status-bar`, `react`, `react-native`,
  `@types/react`, `typescript`). Installed via `npx expo install` (correct
  method per `AGENTS.md`). See "Rules broken" above.

## Other observations (outside the three asks, worth a sanity check)

1. **Deletion of `ameer-hamza/leave-app/`.** This branch removes the
   entire sibling directory (`CLAUDE.md`, `checklist.md`, `App.tsx`,
   `components/`, session-prompt transcripts — 9 files, ~2000 lines) in
   commit `354db9a "chore: remove leave-app project directory"`, before
   `fakher-zaman/leave-app/` is created fresh in `e0d7577`. This is
   consistent with a per-engineer-folder convention (fakher's work lives
   under his own folder), but it does delete a teammate's (Ameer Hamza's)
   committed work as part of this branch's history. Confirm this is
   intentional/expected before merging into `TICKET-100-Ameer-Hamza`.

2. **`AGENTS.md` Expo Router convention not followed.** `AGENTS.md` says
   "Use Expo Router for all navigation. Routes live in `src/app/`", but
   this app renders `LeaveRequestsScreen` directly from `App.tsx`, with
   screen code under `src/screens/` rather than `src/app/`, and
   `expo-router` isn't installed. `PLAN.md` reasons through this
   explicitly (single-screen app, no navigation needed, and installing
   `expo-router` would itself trip the no-new-packages rule) — a
   reasonable call, but it's a deviation from `AGENTS.md`'s stated
   convention that isn't called out as an "approved exception" the way
   the safe-area-context package is.

3. **Uncommitted staged changes not in this diff.** The working tree has
   staged-but-uncommitted changes — `transcripts/part1.txt` renamed to
   `part1.md`, and a new `transcripts/part2.md` (1128 lines) — which are
   invisible to `git diff main...HEAD` since that compares commits, not
   the working tree. Pure file rename/addition, no code, so it doesn't
   change any finding above, but it'll need a commit before the branch
   diff is final.

## Code-style spot check (`CLAUDE.md`)

- TypeScript strict mode: no `any` anywhere in `src/` or `App.tsx`. ✓
- Function components with hooks only, no class components. ✓
- Styling via `StyleSheet.create` throughout, no inline style objects and
  no other styling library. ✓
- Components are small and split out (`LeaveRequestCard` separate from the
  screen). ✓
