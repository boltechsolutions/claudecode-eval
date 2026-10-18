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

# Leave Requests Screen — Part 2

## Context

Part 1 is complete: individual Approve/Reject/Undo, with `history: UndoAction[]` as a
flat LIFO stack of single-row undo entries (`{requestId, previousStatus}`). Part 2 adds
an "Approve all" button, below the title, that approves every currently-pending request
in one tap — and the existing Undo button must revert that *entire* action in a single
tap, not one tap per row. This requires history entries to represent a batch of rows,
not just one, so `handleUndo` needs exactly one implementation regardless of batch size.

## Files

- `src/types/leave.ts` — edit. Replace `UndoAction = { requestId: string; previousStatus:
  LeaveStatus }` with a batch shape:
  `UndoEntry = { requestId: string; previousStatus: LeaveStatus }` and
  `UndoAction = { entries: UndoEntry[] }`.
- `src/screens/LeaveRequestsScreen.tsx` — edit. `handleApprove`/`doReject` push a 1-entry
  batch instead of a flat object; new `handleApproveAll` approves every pending row and
  pushes one N-entry batch; `handleUndo` reverts every entry in the last batch in one
  call; new `approveAllDisabled = pending === 0`; new "Approve all" `Pressable` rendered
  between the title and `LeaveSummary`.
- `CHECKLIST.md` — edit. Append a "Part 2 Test Checklist" section (see below).

No changes to `LeaveSummary.tsx`, `LeaveRequestCard.tsx`, or `App.tsx`.

## Steps

1. In `src/types/leave.ts`, swap `UndoAction` for the batch shape above.
2. In `LeaveRequestsScreen.tsx`, update `handleApprove` and `doReject` to push
   `{ entries: [{ requestId: id, previousStatus: 'pending' }] }` instead of the old flat
   object — no other change to their logic.
3. Add `handleApproveAll`:
   ```ts
   function handleApproveAll() {
     const pendingIds = requests
       .filter((request) => request.status === 'pending')
       .map((request) => request.id);

     if (pendingIds.length === 0) {
       return;
     }

     setRequests((current) =>
       current.map((request) =>
         request.status === 'pending' ? { ...request, status: 'approved' } : request
       )
     );

     setHistory((current) => [
       ...current,
       { entries: pendingIds.map((id) => ({ requestId: id, previousStatus: 'pending' as const })) },
     ]);
   }
   ```
   `pendingIds` is captured from `requests` already in scope at render time — the same
   closure convention `handleApprove`/`handleRejectPress` already use. The `setRequests`
   guard (`status === 'pending'`) makes the status change idempotent no matter how many
   times it fires. The early return means no empty-entries batch is ever pushed, and the
   seeded pre-approved row (Hina Malik, never `pending`) can never be touched or recorded.
4. Replace `handleUndo`'s body with a batch-aware version:
   ```ts
   function handleUndo() {
     if (history.length === 0) {
       return;
     }

     const lastAction = history[history.length - 1];
     const revertMap = new Map(lastAction.entries.map((entry) => [entry.requestId, entry.previousStatus]));

     setRequests((current) =>
       current.map((request) =>
         revertMap.has(request.id) ? { ...request, status: revertMap.get(request.id) as LeaveStatus } : request
       )
     );
     setHistory((current) => current.slice(0, -1));
   }
   ```
   One implementation reverts a 1-entry batch (ordinary Approve/Reject) or an N-entry
   batch (Approve all) identically — no branching on batch size. `undoDisabled` stays
   `history.length === 0`, unchanged.
5. Add `const approveAllDisabled = pending === 0;` alongside the existing
   `pending`/`approved`/`rejected` derivations.
6. Render the new button between the title and `LeaveSummary`:
   ```tsx
   <Text style={styles.title}>Leave Requests</Text>
   <Pressable
     style={[styles.approveAllButton, approveAllDisabled && styles.approveAllButtonDisabled]}
     accessibilityRole="button"
     accessibilityLabel="Approve all"
     accessibilityState={{ disabled: approveAllDisabled }}
     disabled={approveAllDisabled}
     onPress={handleApproveAll}>
     <Text style={styles.approveAllButtonText}>Approve all</Text>
   </Pressable>
   <LeaveSummary pending={pending} approved={approved} rejected={rejected} />
   ```
   New styles, reusing the same green already used for "approved"/approve actions
   (`#1a7f37`) and the same disabled grey the Undo button already uses (`#cccccc`):
   ```ts
   approveAllButton: {
     backgroundColor: '#1a7f37',
     borderRadius: 6,
     paddingVertical: 12,
     alignItems: 'center',
     marginBottom: 10,
   },
   approveAllButtonDisabled: { backgroundColor: '#cccccc' },
   approveAllButtonText: { color: '#ffffff', fontWeight: '600' },
   ```
7. `npx tsc --noEmit` — fix any type errors (the `UndoAction` shape change touches every
   call site in `handleApprove`/`doReject`/`handleUndo`).

### How the undo history changes

Before: `history` is a flat array of `{requestId, previousStatus}`, one entry per row
action; `handleUndo` reverts exactly one row per tap. After: `history` is an array of
`{entries: [...]}` batches — ordinary Approve/Reject still push one batch each, just now
wrapping a single-element array; Approve All pushes one batch whose `entries` lists every
row it changed. `handleUndo` always pops the *last batch* and reverts every entry in it
in one call, so a 3-row Approve All undoes in exactly one Undo tap, while interleaved
single actions and batches still unwind newest-first (LIFO order is unaffected — only
what one "unit" reverts has changed).

## Edge cases

- Zero pending at press time: "Approve all" is disabled via `approveAllDisabled`;
  `handleApproveAll`'s internal early-return is defense-in-depth if ever invoked anyway.
- Exactly one pending row: produces a 1-entry batch, structurally identical to what
  `handleApprove` would push for that row — undoes identically in one tap.
- Mixed interleaving (single → batch → single → Undo×3): reverts newest-first regardless
  of batch size, no special-casing required.
- Seeded pre-approved row (Hina Malik): never `pending`, so never in `pendingIds`, never
  flipped, never recorded in any `UndoAction.entries` — untouched by Approve All or Undo.
- Rapid double-tap on "Approve all": left as-is, matching the existing inherited
  Approve/Reject limitation (the `setRequests` guard keeps actual request state correct
  either way; only a duplicate history batch could theoretically be pushed on a genuine
  same-tick double-fire) — documented, not fixed, consistent with Part 1's own un-fixed
  double-tap-to-history edge case.

## Risks

- **Batch-sized double-tap race** (accepted, not fixed): a genuine same-tick double-tap
  on "Approve all" could push two identical-looking history batches; request state itself
  stays correct regardless. Documented in the Part 2 checklist as a known limitation.
- **Type shape ripple**: `UndoAction`'s new shape has exactly one consumer file
  (`LeaveRequestsScreen.tsx`) — no test files or other references exist elsewhere in the
  repo, so the change is contained.
- **No automated regression protection**: no test framework is installed (per the
  no-new-package rule), so verification is the manual checklist walkthrough only — re-run
  Part 1's checklist alongside Part 2's, since the `UndoAction` shape change touches
  `handleApprove`/`doReject` as well as the new code.

## How to test

1. `npx tsc --noEmit` — must pass clean.
2. `npx expo start --android` / `--ios` / `--web` (Approve All has no `Alert` dependency,
   so it's unaffected by the known web Alert gap):
   - 3 pending at load → "Approve all" enabled. Tap it → all 3 turn green "approved" in
     one tap, header becomes `Pending: 0 · Approved: 4 · Rejected: 0`, Hina Malik
     unchanged, "Approve all" becomes disabled, Undo becomes enabled.
   - Tap Undo once → all 3 revert to pending together (not one at a time), header back to
     `Pending: 3 · Approved: 1 · Rejected: 0`.
   - Reject one row first (confirm the alert), then "Approve all" the remaining two, then
     Undo twice → first Undo reverts only the two-row batch, second Undo reverts the
     earlier reject — confirms newest-first ordering across mixed batch sizes.
   - With exactly one pending row left, "Approve all" behaves identically to tapping that
     row's own Approve button.
   - Rapid double-tap "Approve all" with 2+ pending rows: all pending rows end up approved
     exactly once, no crash (per the accepted/documented limitation above).
   - `accessibilityRole="button"`, `accessibilityLabel="Approve all"`, and
     `accessibilityState.disabled` all track `approveAllDisabled` correctly at each step.
