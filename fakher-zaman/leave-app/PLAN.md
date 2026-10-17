# Plan: Leave Requests Screen — Part 1

> Note: this is the implementation plan as originally approved, before the
> Android edge-to-edge safe-area fix was added afterward (see `CHECKLIST.md`
> and `App.tsx`/`LeaveRequestsScreen.tsx`, which now also use
> `react-native-safe-area-context` — an approved, one-off exception to the
> "no new packages" rule below, added to fix the Undo button rendering behind
> the Android gesture-nav bar).

## Context

The `leave-app` Expo project currently only has the default template `App.tsx`
placeholder. This is the first real feature: a single screen listing leave
requests that a manager can approve or reject, with a confirmation step on
reject and a one-level undo. The project's own `CLAUDE.md` is strict: core
React Native components only, no new npm packages, TypeScript strict mode,
function components, `StyleSheet.create` for styles, and small/focused
components. `src/` doesn't exist yet — this is the "first non-trivial piece
of app logic" that justifies creating it. Generic `AGENTS.md` guidance
mentions Expo Router for navigation, but that's a template-wide suggestion
for multi-screen apps; `expo-router` isn't installed, adding it would violate
the "no new packages" rule, and Part 1 is a single screen, so navigation is
out of scope — `App.tsx` will render the screen directly.

## Files to create

- `src/types/leave.ts` — `LeaveStatus` union and `LeaveRequest` type.
- `src/data/seedLeaveRequests.ts` — the four starting requests from the brief.
- `src/components/LeaveRequestCard.tsx` — one card: name, dates, status text,
  and (only when pending) Approve/Reject buttons. This is the piece that
  repeats, so it's the one that earns its own file.
- `src/screens/LeaveRequestsScreen.tsx` — title, summary line, the list of
  cards, the Undo button, all state, and the Alert confirmation logic.

## Files to change

- `App.tsx` — replace the placeholder with `<LeaveRequestsScreen />`.

## Data model

```ts
type LeaveStatus = 'pending' | 'approved' | 'rejected';

type LeaveRequest = {
  id: string;        // stable id, independent of name (names aren't guaranteed unique)
  name: string;
  dates: string;      // display string as given, e.g. "3-5 Mar" — no date parsing needed for Part 1
  status: LeaveStatus;
};
```

Seed data (ids `'1'`–`'4'`): Ali Khan (3-5 Mar, pending), Sara Ahmed
(10-11 Mar, pending), Omar Raza (17-21 Mar, pending), Hina Malik (24 Mar,
approved).

The Pending/Approved/Rejected counts are **derived** from `requests` via
`useMemo` (a `reduce` over the array, recomputed only when `requests`
changes), not kept as separate counter state — that guarantees the numbers
can never drift out of sync with the cards, which is what requirement 1
("the numbers must change when a request changes") is really asking for.

```ts
const counts = useMemo(
  () => requests.reduce(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    { pending: 0, approved: 0, rejected: 0 }
  ),
  [requests]
);
```

## How the Undo history is stored

A stack of **entries**, where each entry holds an array of per-request
changes (not a single `{id, prevStatus}` pair). Part 1 only ever produces
one change per entry, but this shape is what lets a future "Approve All"
style bulk action (Part 2) push one entry covering many requests and have a
single Undo tap revert all of them together:

```ts
type StatusChange = { requestId: string; previousStatus: LeaveStatus };
type UndoEntry = { changes: StatusChange[] };
const [history, setHistory] = useState<UndoEntry[]>([]);
```

- On Approve, or on confirmed Reject: capture the request's current status
  *before* changing it, and push `{ changes: [{ requestId, previousStatus }] }`
  onto the end of `history`, then update that request's status. (A future
  bulk action would instead push one entry with multiple `changes`.)
- On Undo: take the **last** entry in `history` (newest action), apply every
  `{ requestId, previousStatus }` pair in its `changes` array back onto
  `requests`, then remove that entry from the array (pop). This naturally
  gives "newest first" and restores the pending buttons on affected card(s).
- The Undo button's `disabled` (and `accessibilityState.disabled`) is simply
  `history.length === 0`.

This is a global action log, not per-card history — matches the brief's
"undoes one action, the newest first" (a single ordered timeline), and stays
correct even if a card is acted on, undone, and acted on again (that just
produces a new, independent entry).

## Steps

1. Create `src/types/leave.ts` with `LeaveStatus` and `LeaveRequest`.
2. Create `src/data/seedLeaveRequests.ts` exporting the seed array.
3. Build `LeaveRequestCard`: props `{ request, onApprove, onReject }`.
   - Status text color via three precomputed `StyleSheet.create` variants
     (grey/green/red), picked by `status` — no inline style objects.
   - Approve/Reject `Pressable`s render only `if (request.status === 'pending')`.
   - `accessibilityLabel="Approve leave for {name}"` / `"Reject leave for {name}"`,
     `accessibilityRole="button"` on both.
4. Build `LeaveRequestsScreen`:
   - `useState` for `requests` (seeded) and `history` (empty `UndoEntry[]`).
   - `useMemo` for `counts` (see Data model), title + summary line
     (`Pending: {n} · Approved: {n} · Rejected: {n}`) reads from it.
   - `FlatList` (core RN component) over `requests`, `keyExtractor` on `id`,
     rendering `LeaveRequestCard`.
   - `handleApprove(id)`: push a one-change undo entry, set status to `'approved'`.
   - `handleReject(id)`: call `Alert.alert('Reject leave?', \`Reject ${name}'s leave for ${dates}?\`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => doReject(id) }])`.
   - `doReject(id)`: push a one-change undo entry, set status to `'rejected'`.
   - `handleUndo()`: pop last history entry, apply every change in its
     `changes` array back onto `requests`.
   - Undo `Pressable` at the bottom: `disabled={history.length === 0}`,
     `accessibilityState={{ disabled: history.length === 0 }}`,
     `accessibilityLabel="Undo last action"`.
5. Update `App.tsx` to render `LeaveRequestsScreen` (drop the placeholder
   `View`/`Text`/`StatusBar` content, or keep `StatusBar` and nest the screen
   under it).
6. Typecheck and manually test (see below).

## Edge cases

- **Undo with nothing to undo**: button disabled; handler also no-ops if
  `history` is empty (defensive, shouldn't be reachable via UI).
- **Reject → Cancel**: no state change, no history entry pushed — the alert's
  Cancel button has no `onPress`.
- **Re-doing an undone action**: after Undo, the card is pending again and
  can be approved/rejected again, creating a fresh, independent history entry.
- **Double-tap race**: once a status leaves `'pending'`, its buttons stop
  rendering on the very next render, so a second tap on the same card can't
  fire after the first commits — no debouncing needed at this scale.
- **Status text color** isn't specified as exact values — using common
  semantic hex (grey `#6b7280`, green `#16a34a`, red `#dc2626`) as a
  reasonable default.

## How to test

- **Typecheck**: `npx tsc --noEmit` (per `CLAUDE.md`).
- **Manual** (`npx expo start`, run on iOS/Android via Expo Go, or `--web`):
  1. Confirm initial line reads `Pending: 3 · Approved: 1 · Rejected: 0`.
  2. Tap Approve on a pending card → status turns green "approved", both
     buttons disappear, summary updates, Undo becomes enabled.
  3. Tap Reject on a pending card → alert shows exact title "Reject leave?"
     and message with the real name/dates; Cancel leaves everything
     unchanged; confirming Reject turns status red "rejected", buttons
     disappear, summary updates.
  4. Approve one card then reject another, then tap Undo twice → actions
     revert most-recent-first, each card returns to pending with its buttons
     back, Undo disables once both are undone.
  5. Inspect code (or an accessibility inspector) to confirm
     `accessibilityLabel`s read "Approve leave for Ali Khan" /
     "Reject leave for Ali Khan", etc.

## Risks

- **`Alert.alert` on web**: react-native-web's support for multi-button
  alerts with distinct `onPress` callbacks has historically been
  inconsistent (may reduce to a single OK dialog). The brief's spec targets
  real alert behavior (iOS/Android); recommend verifying Reject's confirm
  flow manually on a device/simulator, and treating `--web` as best-effort
  for Part 1 — no custom modal workaround is in scope since that would need
  extra non-core logic beyond what's asked.
- **Color choice**: grey/green/red hex values are an assumption since the
  brief doesn't give exact colors; easy to adjust later if the user has a
  palette in mind.

---

# Plan: Leave Requests Screen — Part 2 ("Approve all" + bulk Undo)

`CHECKLIST.md`'s "Part 2" group describes the expected behavior of a new
"Approve all" button with grouped undo. This section designs that feature.
The `UndoEntry = { changes: StatusChange[] }` shape above was deliberately
built so a future bulk action could push one entry covering many requests
and have a single Undo tap revert all of them — this plan confirms that
design holds unmodified.

## Files touched

Only `src/screens/LeaveRequestsScreen.tsx` changes. `src/types/leave.ts`,
`src/components/LeaveRequestCard.tsx`, `src/data/seedLeaveRequests.ts`, and
`App.tsx` are untouched. Checking off `CHECKLIST.md`'s Part 2 boxes is a
separate, later step done after manual verification on a real running app.

## Why the undo data model doesn't need to change

`handleUndo` already pops the **last entry** and, in one `setRequests` pass,
applies every change inside that entry to whichever requests match:

```ts
function handleUndo() {
  if (history.length === 0) return;
  const lastEntry = history[history.length - 1];
  setRequests((current) =>
    current.map((request) => {
      const change = lastEntry.changes.find((c) => c.requestId === request.id);
      return change ? { ...request, status: change.previousStatus } : request;
    })
  );
  setHistory((current) => current.slice(0, -1));
}
```

This is already generic over `changes.length` — whether an entry has 1
change or N, it works unmodified. So "Approve all" only needs to push one
entry whose `changes` array has one `StatusChange` per request that was
pending at the time; bulk undo falls out for free. This is also what makes
`CHECKLIST.md`'s "reject Ali Khan, then Approve all, then Undo twice"
scenario correct: the reject and the bulk-approve are two separate,
independent entries, so popping history once only reverts the newest
(bulk) entry, leaving Ali Khan rejected until a second Undo pops his entry.

## New `handleApproveAll` function

```tsx
function handleApproveAll() {
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  if (pendingRequests.length === 0) return; // defensive; button is disabled in this state

  const count = pendingRequests.length;
  const message = `Approve ${count} pending request${count === 1 ? '' : 's'}?`;

  Alert.alert(
    'Approve all pending requests?',
    message,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve all',
        onPress: () => {
          const changes: StatusChange[] = pendingRequests.map((r) => ({
            requestId: r.id,
            previousStatus: r.status,
          }));
          setHistory((current) => [...current, { changes }]);
          setRequests((current) =>
            current.map((r) => (r.status === 'pending' ? { ...r, status: 'approved' } : r))
          );
        },
      },
    ]
  );
}
```

The checklist pins the exact **message** text (`"Approve 3 pending
requests?"` / `"Approve 2 pending requests?"`) but not the alert title;
`"Approve all pending requests?"` follows Part 1's pattern of a short title
plus a dynamic-detail message. Singular wording (`"Approve 1 pending
request?"`) isn't exercised by the checklist but costs one ternary to get
right. `pendingRequests` is captured once when the button is tapped and
reused inside `onPress`, matching `handleReject`'s existing pattern of
capturing `request` before showing the alert.

## New "Approve all" button

Placed between the summary line and the `FlatList` (title → summary →
Approve all → list → Undo), so the bulk action sits just above the content
it acts on:

```tsx
const approveAllDisabled = counts.pending === 0; // derived, no new state

<Pressable
  style={[styles.approveAllButton, approveAllDisabled && styles.approveAllButtonDisabled]}
  onPress={handleApproveAll}
  disabled={approveAllDisabled}
  accessibilityRole="button"
  accessibilityLabel="Approve all pending requests"
  accessibilityState={{ disabled: approveAllDisabled }}
>
  <Text style={styles.approveAllButtonText}>Approve all</Text>
</Pressable>
```

New styles reuse existing colors (green `#16a34a` from the card's Approve
button, disabled grey `#d1d5db` from `undoButtonDisabled`):

```ts
approveAllButton: {
  backgroundColor: '#16a34a',
  borderRadius: 6,
  paddingVertical: 12,
  alignItems: 'center',
  marginBottom: 16,
},
approveAllButtonDisabled: { backgroundColor: '#d1d5db' },
approveAllButtonText: { color: '#fff', fontWeight: '600' },
```

## Edge cases

- **Zero pending**: button disabled via `approveAllDisabled`; handler also
  no-ops defensively, same pattern as `handleUndo` on empty history.
- **Exactly one pending**: singular message wording, untested by the
  checklist but cheap to get right.
- **Cancel path**: the Cancel button has no `onPress` (same as Reject's
  Cancel), so no `setHistory`/`setRequests` call fires at all.
- **Reject-then-approve-all (Ali Khan scenario)**: `pendingRequests` is
  recomputed from live `requests` each call, correctly excluding anyone
  already rejected; two independent history entries result, undoing in the
  right order.
- **Rapid double-tap**: once confirmed, `counts.pending` recomputes to 0 in
  the same render pass that disables the button, so it can't be re-tapped
  mid-flight — same reasoning Part 1 relied on for per-card buttons
  disappearing after one tap.
- **Mixing individual and bulk actions**: `handleApprove`/`handleReject` are
  untouched, so each user action still pushes its own independent,
  correctly-ordered entry.

## How to test

- **Typecheck**: `npx tsc --noEmit`.
- **Manual**, mapped 1:1 to `CHECKLIST.md`'s Part 2 items:
  1. Fresh load (`Pending: 3 · Approved: 1 · Rejected: 0`) → tap "Approve
     all" → alert message reads exactly "Approve 3 pending requests?".
  2. Confirm → summary reads "Pending: 0 · Approved: 4 · Rejected: 0" and
     "Approve all" is now disabled.
  3. Undo once → all 3 revert to pending with buttons back, summary back to
     "Pending: 3 · Approved: 1 · Rejected: 0".
  4. Reject Ali Khan, tap "Approve all" → alert reads "Approve 2 pending
     requests?".
  5. Confirm, then Undo once → only Sara Ahmed and Omar Raza revert; Ali
     Khan stays "Rejected".
  6. Undo again → Ali Khan reverts to pending.
  7. Tap "Approve all", then Cancel → nothing changes; a subsequent Undo
     still targets whatever the last real action was.
  - Re-spot-check a couple of Part 1's single approve/reject + single-undo
    flows for regressions, since they share state with the new handler.

## Risks

- **`Alert.alert` on web**: same caveat as Part 1 — react-native-web's
  multi-button alert support is historically inconsistent; verify on
  iOS/Android, treat `--web` as best-effort.
- **Layout**: a second full-width button above the list slightly shrinks
  the list's visible area; low risk with 4 seed rows, worth a quick visual
  check on a small screen.
- **No risk to existing undo logic**: `handleUndo` is unmodified; both
  single and bulk actions push to the same `history` stack with the same
  `UndoEntry` shape.
