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
