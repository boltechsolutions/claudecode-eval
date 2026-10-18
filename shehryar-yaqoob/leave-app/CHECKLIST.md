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
