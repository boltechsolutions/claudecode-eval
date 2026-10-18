# Leave Requests Screen — Part 1 Test Checklist

Derived from `PLAN.md`. Check these once Part 1 is implemented.

## Build / types

- [x] `npx tsc --noEmit` passes clean (strict mode, no `any`).
- [x] No new npm packages were added — only React Native core components used.

## Initial render

- [x] Header shows `Pending: 3 · Approved: 1 · Rejected: 0` on first load.
- [x] All 4 seed rows render: Ali Khan (3-5 Mar, pending), Sara Ahmed (10-11 Mar, pending),
      Omar Raza (17-21 Mar, pending), Hina Malik (24 Mar, approved).
- [x] Pending cards show grey status text; the approved card (Hina Malik) shows green
      status text.
- [x] Pending cards show Approve and Reject buttons; Hina Malik's card shows neither.
- [x] Undo button is disabled on first load (history is empty).

## Approve flow

- [x] Tapping Approve on a pending card (e.g. Sara Ahmed) turns its status text green
      and relabels it "approved".
- [x] Both Approve and Reject buttons disappear from that card immediately after.
- [x] Header counts update correctly (e.g. `Pending: 2 · Approved: 2 · Rejected: 0`).
- [x] Undo button becomes enabled after the first Approve.
- [x] Rapid double-tap on Approve does not double-count or push two undo entries.

## Reject flow

- [x] Tapping Reject on a pending card shows an alert titled exactly "Reject leave?".
- [x] Alert message uses the real name and dates, e.g. "Reject Omar Raza's leave for
      17-21 Mar?".
- [x] Alert has exactly two buttons: Cancel and Reject.
- [x] Tapping Cancel changes nothing — status, buttons, and header counts are unchanged.
- [x] Tapping Reject turns the card's status text red, relabels it "rejected", and both
      buttons disappear.
- [x] Header counts update correctly after a confirmed reject.
- [x] Rapid double-tap on Reject does not show two alerts or double-count.

## Undo flow

- [x] Undo reverts the most recent action first (LIFO — newest first).
- [X] After undo, the reverted card returns to pending with its Approve/Reject buttons
      visible again.
- [X] Header counts revert to match the pre-action state.
- [X] Multiple sequential undos work in the correct newest-to-oldest order across a mix
      of approve and reject actions.
- [X] Undo button is disabled again once the history is empty.
- [X] Undo does nothing to Hina Malik's seeded "approved" status (it was never a user
      action, so it's not in the undo history).

## Accessibility

- [x] Every Approve button has `accessibilityLabel` of the form "Approve leave for
      {name}" (e.g. "Approve leave for Ali Khan").
- [x] Every Reject button has `accessibilityLabel` of the form "Reject leave for {name}".
- [x] Approve/Reject buttons expose `accessibilityRole="button"`.
- [x] Undo button's `accessibilityState.disabled` matches its actual disabled state.

## Edge cases

- [x] Two requests with the same name (if added later) do not cross-talk — all logic
      keys off `id`, not `name`.
- [x] Undoing back to the very first state matches the original seed data exactly.

## Platform-specific

- [x] iOS: Approve, Reject (with alert), and Undo all work as described.
- [x] Android: Approve, Reject (with alert), and Undo all work as described; alert shows
      with Android's default (unstyled) button appearance.
- [x] Web (`expo start --web`): confirm the known gap — `Alert.alert` does not fire, so
      Reject silently does nothing (no popup, no state change). Approve and Undo still
      work normally on web.

# Leave Requests Screen — Part 2 Test Checklist

Derived from `PLAN.md` Part 2. Check these once Part 2 is implemented.

## Build / types

- [x] `npx tsc --noEmit` passes clean (strict mode, no `any`), including the `UndoAction`
      shape change (`{ requestId, previousStatus }` → `{ entries: UndoEntry[] }`).
- [x] No new npm packages were added — only React Native core components used. (The only
      `package.json` diff is `expo run:android` rewriting the `android`/`ios` scripts to
      `expo run:android`/`expo run:ios`; no dependency was added or changed.)

## Approve all — placement and initial state

- [x] "Approve all" button renders directly below the "Leave Requests" title and above
      the `Pending: … · Approved: … · Rejected: …` summary line.
- [x] On first load (3 pending), "Approve all" is enabled (not greyed out).

## Approve all — happy path

- [x] Tapping "Approve all" turns all currently-pending cards (Ali Khan, Sara Ahmed,
      Omar Raza) green and relabels each "approved" in one tap.
- [x] Approve/Reject buttons disappear from all three cards immediately after.
- [x] Header updates to `Pending: 0 · Approved: 4 · Rejected: 0` in one update.
- [x] Hina Malik's seeded "approved" card is visually unchanged and untouched.
- [x] "Approve all" button becomes disabled immediately after, since no pending rows
      remain.
- [x] Undo button becomes/remains enabled after "Approve all".

## Approve all — single-tap undo

- [x] After "Approve all" with 3 pending rows, tapping Undo once reverts all three rows
      back to pending (status text grey, Approve/Reject buttons reappear) — not one row
      per Undo tap.
- [x] Header reverts to `Pending: 3 · Approved: 1 · Rejected: 0` after that single Undo
      tap.
- [x] After that single Undo, the Undo button's enabled/disabled state matches whatever
      history remains (disabled if history is now empty).

## Approve all — partial pending set

- [x] Reject one pending row first (e.g. Omar Raza, confirm the alert), leaving 2
      pending. Then tap "Approve all": only the remaining pending rows (Ali Khan, Sara
      Ahmed) turn approved; the already-rejected row is untouched.
- [x] Tapping Undo once after that reverts only the two rows "Approve all" changed; the
      earlier reject remains in place (not reverted by that same Undo tap).
- [x] A second Undo tap then reverts the earlier reject back to pending.

## Approve all — single pending row

- [x] With exactly one pending row remaining (approve/reject the others individually
      first), tapping "Approve all" approves that one row and behaves identically to
      tapping its own Approve button: one Undo tap reverts just that row.

## Approve all — zero pending

- [x] Once there are zero pending rows (via any combination of Approve/Reject/Approve
      all), "Approve all" is disabled and does nothing if pressed — no change to
      requests, no new Undo history entry.

## Undo stack ordering across mixed actions

- [x] Perform a mix of single actions and one "Approve all" (e.g. Approve one row →
      Approve all the remaining pending rows → Reject another row), then Undo
      repeatedly. Confirm each Undo reverts exactly one prior action, newest first, and
      that the "Approve all" step is reverted as a whole in a single Undo tap, not
      spread across multiple taps.

## Accessibility

- [x] "Approve all" button exposes `accessibilityRole="button"` and
      `accessibilityLabel="Approve all"`.
- [x] "Approve all" button's `accessibilityState.disabled` matches its actual disabled
      state at every step above.

## Rapid double-tap

- [x] Rapid double-tap on "Approve all" while 2+ rows are pending does not visibly
      double-approve or corrupt request state (all pending rows still end up approved
      exactly once, no crash). A duplicate undo-history batch from a genuine same-tick
      double-tap is a known, accepted limitation (see `PLAN.md` Part 2 Risks) — not a
      blocking failure.

## Platform-specific

- [x] iOS: "Approve all" and the single-tap undo-of-batch behavior work as described.
- [x] Android: same.
- [x] Web (`expo start --web`): "Approve all" and its Undo work normally on web (this
      feature does not use `Alert.alert`, so it is unaffected by the known web Alert
      gap).
