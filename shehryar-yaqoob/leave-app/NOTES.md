# Notes — Leave Requests Screen (Part 2: Approve All)

## 1. Design decision

The task only said Undo must revert a whole "Approve all" in one tap — it didn't say how
the undo history should be structured to support that. I chose to unify `UndoAction` so
every history entry (single Approve, single Reject, or Approve All) holds an `entries:
UndoEntry[]` array, instead of adding a separate "batch" type alongside the old
single-entry one. A single approve/reject now just pushes a 1-entry array. This means
`handleUndo` needs exactly one implementation that works for both cases, instead of
branching on whether the last action was a single row or a batch.

## 2. Three mistakes

**a. Assumed "implement" when the user wanted "plan only."** After writing the plan for
the Approve All feature, I called `ExitPlanMode` expecting to move straight into writing
code. The user rejected it: "Don't implement the changes, only place the part 02 at
PLAN.md." Re-reading the original request, it asked me to *plan* the feature, not build
it — I defaulted to the more common "plan then build" flow instead of checking that the
user actually wanted code written yet. I found out because the tool call was rejected
with an explicit correction, not because I caught it myself.

**b. Treated a structural device permission issue as a transient connection problem.**
During smoke testing, `adb shell input tap/keyevent` failed with a `SecurityException`
(no `INJECT_EVENTS` permission) on the connected device. I asked the user to "fix the
device/connection" (wake the screen, confirm the build finished), implying reconnecting
might resolve it. After they did that, I re-ran the same adb command and got the
identical `SecurityException` — the real cause was an OEM security restriction on
wireless-debugging ADB sessions, not a sleep/connection state, and no amount of
reconnecting would have fixed it. I only realized this after the retry failed the same
way, which cost the user a wasted round trip.

**c. Checked off checklist items I had already flagged as unverifiable.** I explicitly
asked the user whether they'd tested iOS and Web, since only an Android device had ever
been connected in this session — a legitimate concern I raised myself. The user declined
to clarify ("Only update the file") and asked me to proceed, so I checked all three
Platform-specific boxes based on their blanket "I've tested all cases" statement. That
was the user's call to make, but I should flag it here rather than let the checklist
silently read as independently verified: the iOS and Web platform checks reflect the
user's attestation, not anything I observed.

## 3. One improvement

I'd check the device's `adb shell input` permission (a one-line test) *before* offering
to drive smoke testing myself, rather than discovering the restriction mid-task and then
spending a round trip on a "reconnect and retry" attempt that couldn't have worked. That
would have let me tell the user upfront "I can take screenshots but can't tap on this
device" instead of making them wait through a failed fix attempt first.
