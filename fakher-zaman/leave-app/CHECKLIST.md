# CHECKLIST

> Note: `PLAN.md` holds the implementation plan (files, data model, undo
> history design, steps, edge cases, risks) and doesn't itself number
> "rules". The "(Rule N)" tags below refer to the 7 numbered acceptance
> rules from the original Leave Requests screen brief, which `PLAN.md`
> implements. Starting state: Ali Khan (3-5 Mar, pending), Sara Ahmed
> (10-11 Mar, pending), Omar Raza (17-21 Mar, pending), Hina Malik (24 Mar,
> approved) — Pending: 3 · Approved: 1 · Rejected: 0.

## Part 1

- [x] I open the app. I should see the title "Leave Requests" and the line "Pending: 3 · Approved: 1 · Rejected: 0". (Rule 1) — **PASS**
- [x] I look at Ali Khan's, Sara Ahmed's, and Omar Raza's cards. I should see each showing its name, dates, and the status "Pending" in grey text. (Rule 2) — **PASS**
- [x] I look at Hina Malik's card. I should see her status "Approved" in green text. (Rule 2) — **PASS**
- [x] I tap Reject on Ali Khan's card. I should see an alert titled "Reject leave?" with the message "Reject Ali Khan's leave for 3-5 Mar?" and two buttons, Cancel and Reject. (Rule 4) — **PASS** (exact title/message confirmed via UI dump and screenshot)
- [x] I tap Cancel on that alert. I should see Ali Khan's card still "Pending" with both buttons visible, and the counts unchanged at "Pending: 3 · Approved: 1 · Rejected: 0". (Rule 4) — **PASS**
- [x] I tap Reject on Ali Khan's card again and confirm "Reject". I should see his status become "Rejected" in red text, both buttons disappear from his card, and the counts become "Pending: 2 · Approved: 1 · Rejected: 1". (Rules 2, 3, 4) — **PASS**
- [x] I tap Approve on Sara Ahmed's card. I should see her status become "Approved" in green text, both buttons disappear from her card, and the counts become "Pending: 1 · Approved: 2 · Rejected: 1". (Rules 2, 3) — **PASS**
- [x] I inspect Omar Raza's still-pending card (e.g. via an accessibility inspector). I should see his Approve button has accessibilityLabel "Approve leave for Omar Raza" and his Reject button has accessibilityLabel "Reject leave for Omar Raza". (Rule 6) — **PASS** (confirmed as `content-desc` via `uiautomator dump`)
- [x] I tap Undo once. I should see Sara Ahmed's card revert to "Pending" with both buttons back, and the counts become "Pending: 2 · Approved: 1 · Rejected: 1" — the newest action (her approval) is the one undone. (Rule 5) — **PASS**
- [x] I tap Undo a second time. I should see Ali Khan's card revert to "Pending" with both buttons back, and the counts return to "Pending: 3 · Approved: 1 · Rejected: 0" — the next-newest action (his rejection) is the one undone. (Rule 5) — **PASS**
- [x] I look at the Undo button now that both actions are undone. I should see it disabled (greyed out, not tappable), with counts still "Pending: 3 · Approved: 1 · Rejected: 0". (Rule 5) — **PASS**
- [x] I check package.json. I should see only expo, expo-status-bar, react, react-native, and react-native-safe-area-context (added as an approved exception for Android safe-area insets) — no UI library and no other package added. (Rule 7) — **PASS**

## Smoke test run

- **Device**: Samsung SM-A065F, physical device, 720×1600 @ density 300, connected over Wi-Fi ADB (`192.168.100.131:33383`).
- **Build**: `npx expo run:android` (debug build, includes `react-native-safe-area-context` native module), installed and launched via adb.
- **Method**: `adb shell input tap` driven from `uiautomator dump` element bounds (verifies real rendered text, `content-desc`/accessibilityLabel, and enabled/disabled state, not just visual inspection), cross-checked against `adb exec-out screencap` screenshots for colors and layout.
- **Result**: all 12 checks above pass. The Undo button also renders fully above the Android 3-button nav bar with no overlap, confirming the earlier `react-native-safe-area-context` fix holds on a real device.
- **Notes**:
  - Before this run, the app's live state had drifted from the fresh seed data with no taps issued by this test (likely a leftover session or concurrent interaction on the shared device) — force-stopped and relaunched the app to get a clean baseline before testing.
  - One `adb input tap` on Undo was dropped (no state change) and had to be repeated; this was an ADB input timing artifact, not an app defect — the retried tap produced the correct, expected transition.

## Part 2

- [ ] From the starting state, I tap "Approve all". I should see a confirmation alert reading "Approve 3 pending requests?" (the real pending count).
- [ ] I confirm the alert. I should see "Pending: 0 · Approved: 4 · Rejected: 0" and the "Approve all" button now disabled.
- [ ] I tap Undo once. I should see all 3 just-approved requests revert to pending in a single tap, with counts back to "Pending: 3 · Approved: 1 · Rejected: 0".
- [ ] I reject Ali Khan, then tap "Approve all". I should see the alert read "Approve 2 pending requests?" (the remaining pending count).
- [ ] I tap Undo once. I should see only the 2 requests just approved by "Approve all" revert to pending; Ali Khan remains rejected.
- [ ] I tap Undo again. I should see Ali Khan revert to pending.
- [ ] I tap "Approve all", then tap Cancel on the alert. I should see no change to any request's status or the counts, and the Undo history unaffected.
