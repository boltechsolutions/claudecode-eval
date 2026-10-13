# leave-app checklist

## Build
- [x] App.tsx renders LeaveRequestsScreen (template text removed)
- [x] app/LeaveRequestsScreen.tsx: types, seed data, reducer, Reject alert, layout
- [x] components/LeaveTable.tsx: header (Name | Dates | Status) + rows
- [x] components/ActionButton.tsx: approve (green) / reject (red) / neutral variants, disabled state
- [x] Seed data: Ali Khan, Sara Ahmed (approved), Omar Raza, Hina Malik (pending)
- [x] Pending rows show Approve (green) + Reject (red)
- [x] Reject shows alert "Reject leave?" / "Reject <name>'s leave for <dates>" with Cancel + Reject
- [x] Undo button at bottom: one tap = one action, newest first; disabled when history empty
- [x] No storage: restart shows fresh data
- [x] Accessibility labels on Approve / Reject / Undo
- [x] Only core React Native components, no new packages

## Verify
- [x] npx tsc --noEmit passes
- [x] Android JS bundle builds (npx expo export --platform android)
- [x] Launch: 4 rows, Sara Approved, 3 Pending with buttons, Undo disabled
- [x] Reject Ali → correct alert text; Cancel changes nothing
- [x] Reject Ali → Reject → row Rejected, Undo enabled
- [x] Alert uses correct name/dates for Omar and Hina
- [x] Approve Omar, Reject Hina, Undo ×2 → Hina reverted first, then Omar; Undo disabled again
- [x] Reload app → fresh seed data

## Approve all — Build
- [x] History entries are grouped (`{ changes: [...] }`): one entry per user action
- [x] Reducer `approveAll` approves every pending request as ONE history entry; no-op when none pending
- [x] Undo reverts every change in the last entry (Approve all undone in one tap)
- [x] "Approve all" button (green) below the title, disabled when 0 pending
- [x] Alert "Approve N pending requests?" with real count (singular "request" when N = 1), Cancel + Approve
- [x] accessibilityLabel/Hint on Approve all; Undo hint updated
- [x] No new packages

## Approve all — Verify
- [x] npx tsc --noEmit passes
- [x] Android JS bundle builds (npx expo export --platform android)
- [x] Reducer test: Approve Ali → Approve all → Undo → Omar + Hina pending together, Ali still approved
- [x] Reducer test: second Undo → back to seed data, history empty
- [x] Reducer test: Reject Hina → Approve all → Undo → Ali + Omar pending, Hina still rejected
- [x] Reducer test: Approve all with 0 pending → state unchanged, no history entry
- [x] On device: alert text shows real count; Cancel changes nothing; button disabled after all approved
