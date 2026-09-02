# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first because the mapping loop targets an array sorted in ascending chronological order. Additionally, deleting an expense deletes the wrong item due to sorting index changes.

**What I changed:** Swapped the sorting function parameter targets to handle descending order (`dateValue(b.date) - dateValue(a.date)`) and rendered `sortedExpenses`. Added an explicit `.findIndex()` evaluation pass to safely resolve original source state offsets when running `onDeleteAt` and `onUpdateAt`.

## Bug 2

**How to reproduce:** Attempt to input a fractional division split weight (like 33.33) inside the Custom % field inputs.

**What is wrong:** The input handler forcefully evaluated state strings as native Numbers on every single keypress stroke. This intercepted trailing periods or fractional text entries, locking user configuration actions.

**What I changed:** Changed custom percentage rows to controlled `text` inputs tracking raw layout string states while actively modifying values. Implemented localized state casting array sweeps inside the parent initialization boundaries prior to executing the `percentsSumTo100` utility function check.

---

## Bug 3

**How to reproduce:** Create a transaction expense using matching members list datasets and observe identification references.

**What is wrong:** Type mapping mismatches exist where string value keys tracking identification criteria get forced into numerical casting sequences arbitrarily, fragmenting cross-referencing properties inside data tables.

**What I changed:** Hardened select array boundaries using fallback evaluations (`isNaN() ? id : Number(id)`) to keep database validation values cleanly matched across data states.

## Bug 4

**How to reproduce:** Create an expense of $10.00 and split it equally between 3 people.

**What is wrong:** The `splitEqual` function divides the money using `.toFixed(2)` on each loop pass. This gives each person $3.33, accumulating to $9.99 total. This drops a penny from the ledger balance, violating the constraint that a closed trip group shouldn't drop or invent currency.

**What I changed:** Rewrote `splitEqual` and `splitByPercent` to evaluate distributions using integer-based penny units. Extracted total remainder units using a remainder modifier loop and safely distributed remaining fractional values across the array matrix entries.

---

## Bug 5

**How to reproduce:** Add or edit an expense so the app writes to `localStorage`, then refresh the page (or close and reopen the tab). The list is sorted newest-first right after that first save, but stops being sorted correctly on the next load.

**What is wrong:** `loadState` only converts date strings into real `Date` objects the very first time the app runs, when `localStorage` is still empty. Every load after that just runs `JSON.parse` on whatever was saved and returns it directly — but `persistState` had already turned those `Date` objects back into plain ISO strings when it saved them. So from the second load onward, `expense.date` is a string, and `dateValue()` in `format.js` just hands that string straight back instead of converting it into something comparable. Subtracting two of those strings in the sort comparator produces `NaN`, so the comparator effectively does nothing and the list falls back to whatever order it happened to already be in.

**What I changed:** Made `dateValue()` always return `new Date(date).getTime()`, so it works whether it's given a `Date` object or a string. Also updated `loadState` to run the existing `hydrate()` step on data coming back from `localStorage`, not just on the very first run, so `expense.date` is consistently a real `Date` object no matter how many times the page has reloaded.

## Bug 6

**How to reproduce:** Type something into the search box (or pick a category, or a "Paid by" person) so the expense list is showing fewer than all the expenses. Delete or edit one of the visible rows, then clear the filter and check what actually changed.

**What is wrong:** `ExpenseList` receives the already-filtered list of expenses as its `expenses` prop, and was finding each row's "original index" by searching inside that same filtered array. But the delete/update actions in the reducer apply that index to the full, unfiltered `state.expenses` array. Whenever a filter has removed even one expense from the visible list, the index no longer points at the same expense in the underlying data, so the wrong expense gets deleted or edited.

**What I changed:** Switched deletes and updates to identify the target expense by its `id` instead of its position in an array. `ExpenseList` now passes `expense.id` straight through to `onDeleteAt`/`onUpdateAt`, and the reducer's `DELETE_EXPENSE`/`UPDATE_EXPENSE` cases now filter/map by `id` instead of splicing an index. That removes the dependency on array position entirely, so sorting or filtering upstream can't desync it again.

## Bug 7

**How to reproduce:** Open the Balances panel with the demo data loaded. Ben has paid more than his share overall — the panel should show he's owed money — but it says he "owes" instead, and whoever is actually in debt is shown as being owed.

**What is wrong:** `computeBalances` and `settle.js` both use the same convention: a positive balance means the group owes that person, a negative balance means they owe the group. `BalancesPanel`'s two conditional branches have that backwards, so every balance in the UI is labeled with the opposite of what's true.

**What I changed:** Swapped the contents of the `bal > 0.005` and `bal < -0.005` branches so a positive balance renders as "is owed" and a negative balance renders as "owes," matching the convention the balance and settle-up math already use.

## Bug 8

**How to reproduce:** With the demo data, work out the settle-up suggestions (or just look at the Settle up panel) — Carlos and Diya both still have an outstanding balance, but there's no payment between them listed, even though the panel says everyone should be at $0.00 after the suggested payments.

**What is wrong:** `suggestSettlements` walks debtors and creditors in parallel, with a branch for when the amount a debtor owes exactly matches what a creditor is owed. That branch just advances past both of them without recording a transfer — it's the one case in the loop that doesn't push anything to the `transfers` array. Any time a debt and a credit happen to line up exactly, that payment disappears from the list.

**What I changed:** Added a `transfers.push(...)` call to the equal-amounts branch, the same as the other two branches already do, recording a transfer for the full amount before moving both pointers forward.

## Bug 9

**How to reproduce:** Open the Filter panel and pick any specific person from the "Paid by" dropdown. The expense list immediately shows "No expenses match these filters," even for a person who clearly paid for several things.

**What is wrong:** `state.expenses[].paidBy` is stored as a number, but a `<select>` element's `onChange` always hands back a string through `e.target.value`, regardless of what type the option's `value` was set to. So the `paidBy` filter state is always a string, and the filter's `e.paidBy !== paidBy` check ends up comparing a number to a string, which is always `true` — every expense gets filtered out the moment a specific person is selected.

**What I changed:** Compared `String(e.paidBy)` against the filter state instead of comparing the raw number against the string, so the types match. The "Anyone" option still works as before since it relies on `paidBy === ""`.

## Bug 10

**How to reproduce:** Try to edit an expense's amount directly in the list by clicking into the amount field and typing a new number.

**What is wrong:** The input's `onChange` handler reads `e.value`, which doesn't exist on a DOM change event — the value lives at `e.target.value`. So typing in the field never updates the component's draft state, and the save-on-blur logic never has anything new to save.

**What I changed:** Changed `setDraft(e.value)` to `setDraft(e.target.value)`.

## Bug 11

**How to reproduce:** Look at the "Uber to airport" expense in the demo data — Diya paid $60 for it but isn't one of the people it's split between (only Aisha and Ben are). Diya's balance should show her fully reimbursed, but she's short by a third of the fare.

**What is wrong:** `computeBalances`'s main loop already handles this case correctly on its own — it credits the payer the full amount, then only subtracts a share from people who are actually in the split. But there's a second block right after it that fires whenever the payer isn't a key in `shares`, and it subtracts `amount / splitWith.length` from the payer's balance anyway, as if they were also on the split. That directly contradicts the rule that someone who pays for others without being part of the bill should get that money back in full.

**What I changed:** Removed that extra block. The main loop already produces the correct result whether or not the payer is included in the split, so nothing needs to compensate for it afterward.

## Bug 12

**How to reproduce:** Add a new member using the "Add member" field in the Summary panel, without adding or editing any expense afterward. The new person doesn't appear in the "Paid so far" breakdown.

**What is wrong:** The `perPerson` calculation in `SummaryCards` is wrapped in a `useMemo` that only lists `expenses` as a dependency, even though the function itself reads `members`. Adding a member changes `members` but not `expenses`, so React doesn't know to recompute, and the breakdown keeps using the stale member list until some unrelated expense change forces a recalculation.

**What I changed:** Added `members` to the `useMemo` dependency array alongside `expenses`.
i want to push thi