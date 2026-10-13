# Leave App Checklist

Use only React Native core components. Add no packages.

## Starting data

| Name        | Dates    | Starting status |
| ----------- | -------- | --------------- |
| Ali Khan    | 3-5 Mar  | pending         |
| Sara Ahmed  | 10-11 Mar | pending        |
| Omar Raza   | 17-21 Mar | pending        |
| Hina Malik  | 24 Mar   | approved        |

## 1. Header

- [ ] The title shows at the top.
- [ ] Under it, one line of counts in this format: `Pending: 3 · Approved: 1 · Rejected: 0`
- [ ] On first load the counts read Pending 3, Approved 1, Rejected 0.
- [ ] The counts update on every Approve, Reject, Approve all and Undo.

## 2. Request cards

- [ ] Each request is its own card.
- [ ] Each card shows the name, the dates and the status.
- [ ] Pending status text is grey.
- [ ] Approved status text is green.
- [ ] Rejected status text is red.

## Approve all

- [ ] An Approve all button shows below the title.
- [ ] Tapping it opens an alert asking first: `Approve 2 pending requests?`
- [ ] The number in the alert is the real count of pending requests, for example `Approve 3 pending requests?` on first load.
- [ ] The alert has two buttons: Cancel and Approve.
- [ ] Cancel changes nothing: the statuses and counts stay the same, and nothing is added to the undo history.
- [ ] Confirming sets every pending request to approved, hides their buttons and updates the counts.
- [ ] Requests that were already approved or rejected are not changed.
- [ ] The button is disabled when there are no pending requests.
- [ ] The button has an accessibilityLabel, for example `Approve all pending requests`.

## 3. Approve and Reject buttons

- [ ] A pending card shows two buttons: Approve (green) and Reject (red).
- [ ] Approved and rejected cards show no buttons.
- [ ] Tapping Approve sets the status to approved and hides both buttons.
- [ ] Tapping Reject opens the confirmation alert, and the status changes only after confirming. Both buttons then disappear.

## 4. Reject confirmation

- [ ] The alert title is `Reject leave?`
- [ ] The message uses the real name and dates, for example `Reject Ali Khan's leave for 3-5 Mar?`
- [ ] The alert has two buttons: Cancel and Reject.
- [ ] Cancel changes nothing: the status, buttons and counts stay the same, and nothing is added to the undo history.
- [ ] Reject sets the status to rejected.

## 5. Undo

- [ ] An Undo button shows at the bottom of the screen.
- [ ] One tap undoes one action, newest first.
- [ ] Undo restores the previous status, the card's buttons and the counts.
- [ ] Undo is disabled when there is nothing to undo, including on first load and after everything is undone.
- [ ] A cancelled Reject does not count as an action.
- [ ] After Approve all, one tap on Undo reverts the whole Approve all action, not just one request.
- [ ] That one tap restores every request Approve all changed to its previous status (pending), brings back their buttons and updates the counts.
- [ ] Approve all counts as one action in the history, so a second tap on Undo reverts the action before it.
- [ ] Undo does not touch requests that were already approved or rejected before Approve all.
- [ ] After Undo of Approve all, the Approve all button is enabled again if any request is pending.

## 6. Accessibility

- [ ] Every Approve button has an accessibilityLabel with the name, for example `Approve leave for Ali Khan`.
- [ ] Every Reject button has an accessibilityLabel with the name, for example `Reject leave for Ali Khan`.

## Final checks

- [ ] `npx tsc --noEmit` passes.
- [ ] Nothing was added to `package.json` dependencies.
- [ ] Walk through: approve Ali, reject Sara (confirm), cancel a reject on Omar, then undo twice. Check the counts after each step.
- [ ] Walk through Approve all: reject Ali (confirm), tap Approve all and check the alert says `Approve 2 pending requests?`. Confirm it, then tap Undo once. Both Sara and Omar should be pending again and Ali should still be rejected. Tap Undo again to restore Ali.
- [ ] Approve all is disabled once no request is pending.
