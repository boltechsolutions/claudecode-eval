# Leave Requests Screen — Part 1

## Context

The repo is a brand-new Expo/React Native app (SDK 57, RN 0.86.3) with only the stock
template in `App.tsx` and no `src/` directory yet. This is the first real feature:
a single-screen leave-approval list for a manager to approve/reject pending requests,
with running counts, a confirm-before-reject flow, and a one-step LIFO undo.

No router is installed (`expo-router` is not a dependency, and `index.ts` registers
`App` directly via `registerRootComponent`). CLAUDE.md forbids adding any package, so
Part 1 stays router-free and lives directly under `src/` (not `src/app/`) per the
folder map's fallback rule: "everything else... outside `src/app/`." A router can be
introduced later if/when multiple screens actually exist.

## Files

- `src/types/leave.ts` — new. `LeaveStatus = 'pending' | 'approved' | 'rejected'`,
  `LeaveRequest = { id: string; name: string; dates: string; status: LeaveStatus }`,
  `UndoAction = { requestId: string; previousStatus: LeaveStatus }`.
- `src/data/seedLeaveRequests.ts` — new. The 4 seed rows from the spec (Ali Khan 3-5 Mar
  pending, Sara Ahmed 10-11 Mar pending, Omar Raza 17-21 Mar pending, Hina Malik 24 Mar
  approved), each given a stable `id`.
- `src/components/LeaveSummary.tsx` — new. Renders `Pending: X · Approved: Y · Rejected: Z`
  from counts passed in as props (counts are derived in the screen, not stored).
- `src/components/LeaveRequestCard.tsx` — new. Renders name/dates/status text (grey/green/red
  by status) and, only when `status === 'pending'`, the Approve/Reject `Pressable`s with
  `accessibilityLabel="Approve leave for {name}"` / `"Reject leave for {name}"` and
  `accessibilityRole="button"`.
- `src/screens/LeaveRequestsScreen.tsx` — new. Owns all state: the `LeaveRequest[]` list,
  the undo stack (`UndoAction[]`), derives the three counts each render, renders title +
  `LeaveSummary` + `FlatList` of `LeaveRequestCard` + an Undo `Pressable` pinned at the
  bottom (disabled when the undo stack is empty).
- `App.tsx` — edit. Replace the placeholder body with `<LeaveRequestsScreen />` inside a
  `SafeAreaView`.

## Steps

1. Add `src/types/leave.ts` with the types above.
2. Add `src/data/seedLeaveRequests.ts` with the 4 rows, typed as `LeaveRequest[]`.
3. Build `LeaveRequestCard`: props `{ request, onApprove, onReject }`. Status text color
   via a small lookup (`pending: grey, approved: green, rejected: red`) — colors defined
   once as style constants, not inline per-render objects. Approve button calls
   `onApprove(request.id)` directly. Reject button calls `onReject(request.id)`, but the
   confirmation `Alert.alert` lives in the screen (card stays dumb/presentational) — card
   just reports intent.

   Actually: put the `Alert.alert` call in the screen's `handleRejectPress(id)`, triggered
   by the card's `onReject` prop, so the card has no business logic — easier to keep
   small per CLAUDE.md's "keep components small and focused."

4. Build `LeaveSummary`: pure presentational, props `{ pending, approved, rejected }`.
5. Build `LeaveRequestsScreen`:
   - `const [requests, setRequests] = useState<LeaveRequest[]>(seedLeaveRequests)`
   - `const [history, setHistory] = useState<UndoAction[]>([])`
   - Derive `pending`/`approved`/`rejected` counts via `.filter(...).length` on every
     render (no duplicated/derived state to desync).
   - `handleApprove(id)`: functional `setRequests` update — only flips status if the
     current entry is still `'pending'` (guards a double-tap race); on success, push
     `{ requestId: id, previousStatus: 'pending' }` onto `history`.
   - `handleRejectPress(id)`: look up the request by id for its `name`/`dates`, call
     `Alert.alert('Reject leave?', `Reject ${name}'s leave for ${dates}?`, [
     { text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive',
     onPress: () => doReject(id) } ])`.
   - `doReject(id)`: same guarded functional update as approve, pushes
     `{ requestId: id, previousStatus: 'pending' }`.
   - `handleUndo()`: pop the last `history` entry (newest first — `history[history.length
     - 1]`), set that request's status back to `previousStatus`, drop it from `history`.
     Guard: no-op (and button `disabled`) when `history.length === 0`.
   - Render: title `Text`, `LeaveSummary`, `FlatList` (`keyExtractor` on `id`,
     `renderItem` → `LeaveRequestCard`), then the Undo `Pressable`/`Text` footer with
     `accessibilityState={{ disabled: history.length === 0 }}` and real `disabled` prop.
6. Wire `App.tsx` to render the new screen inside `SafeAreaView` (so content clears the
   status bar / notch).
7. `npx tsc --noEmit` — fix any type errors.

## Edge cases

- Double-tapping Approve/Reject before re-render: guarded by checking the request is
  still `'pending'` inside the functional `setRequests` updater, so a second tap after
  the first lands is a no-op and never double-pushes to `history`.
- Reject → Alert → Cancel: no state change, no history entry — confirmed by the plan's
  `onPress` only firing `doReject` on the "Reject" button, not "Cancel".
- Undo with empty history: button is `disabled` (both visually via style and functionally
  via the `disabled` prop) so `handleUndo` can't fire; `accessibilityState.disabled`
  mirrors it for screen readers.
- Undo only reverts actions taken through the UI — Hina Malik's seed status of
  `approved` was never pushed to `history`, so it's correctly never undoable.
- Multiple undos: stack order guarantees newest-first regardless of which name/action
  was undone previously.
- Two requests sharing a name: lookups/keys use `id`, never `name`, so this can't cause
  cross-talk.

## Risks

- **`Alert.alert` is a no-op on web** (confirmed from `react-native-web` source: it's a
  literal empty function there). Since this project supports `expo start --web`, the
  Reject confirmation will not appear on web and `onPress` will never fire there — Reject
  will silently do nothing in a web build. This is a known platform gap inherent to using
  only core RN components (no polyfill allowed per the no-new-package rule) — flagging it
  rather than silently working around it. Primary manual testing should happen on iOS/Android.
- Counts are recomputed from `requests` every render instead of tracked as separate state,
  which avoids a desync bug class but is worth calling out as the deliberate choice.
- Keeping `Alert.alert` logic in the screen (not the card) keeps `LeaveRequestCard` dumb,
  but means the screen owns slightly more logic — acceptable for a single screen in Part 1.

## How to test

1. `npx tsc --noEmit` — must pass clean (strict mode, no `any`).
2. `npx expo start --android` or `--ios` (not `--web`, since Alert won't fire there):
   - Initial render shows `Pending: 3 · Approved: 1 · Rejected: 0`.
   - Tap Approve on Sara Ahmed → her card shows green "approved", both buttons vanish,
     header updates to `Pending: 2 · Approved: 2 · Rejected: 0`.
   - Tap Reject on Omar Raza → alert titled "Reject leave?" with message "Reject Omar
     Raza's leave for 17-21 Mar?", two buttons Cancel/Reject.
     - Tap Cancel → nothing changes, buttons still present, counts unchanged.
     - Tap Reject → card turns red "rejected", buttons vanish, counts become
       `Pending: 1 · Approved: 2 · Rejected: 1`.
   - Tap Undo → reverts Omar Raza to pending (buttons reappear), counts back to
     `Pending: 2 · Approved: 2 · Rejected: 0`.
   - Tap Undo again → reverts Sara Ahmed to pending, counts back to
     `Pending: 3 · Approved: 1 · Rejected: 0`.
   - Tap Undo a third time → button is disabled, nothing happens (history empty — Hina
     Malik's seeded `approved` state is not part of the undo stack).
   - Inspect the Approve/Reject `Pressable`s (via code or an accessibility inspector) to
     confirm each carries `accessibilityLabel` like `"Approve leave for Ali Khan"`.
3. Optionally run `--web` too, to directly observe/confirm the known Alert.alert gap
   described above (Approve still works there; Reject's confirm step does not).
