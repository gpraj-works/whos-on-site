---
name: code-review
description: >-
  Production-grade PR and code review runbook for WhosOnSite.
  Use when asked to perform a code review, PR review, or audit changes on a branch.
---

# WhosOnSite Production PR Review Skill

This skill provides the principal engineer & engineering manager review protocol for evaluating code changes in WhosOnSite before merging into a target base branch.

---

## Instructions & Dynamic Branch Selection

When performing a code review, follow the exact protocol defined in [docs/REVIEW.md](../../../docs/REVIEW.md).

### Dynamic Branch Selection Steps:

1. **Detect Current & Target Base Branch Dynamically**:
   - `CURRENT_BRANCH=$(git branch --show-current)`
   - `TARGET_BRANCH="${1:-$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@refs/remotes/@@' || echo 'origin/main')}"`
   - `git fetch origin`

2. **Inspect Branch Diff**:
   - `git status --short`
   - `git diff --stat "$TARGET_BRANCH...HEAD"`
   - `git diff "$TARGET_BRANCH...HEAD"`

3. **Evaluate WhosOnSite Specific Guidelines**:
   - **Company Scoping**: Ensure every query filters by `companyId`.
   - **State Machine**: Ensure status transitions obey allowed state machine paths.
   - **Transactions**: Ensure multi-table writes are wrapped in `withTransaction`.
   - **Response Envelope**: Ensure controllers use `sendSuccess` / `sendError`.
   - **Type Safety**: Ensure shared schemas are used from `@whosonsite/shared`.

4. **Run Validation Commands**:
   - `pnpm typecheck`
   - `pnpm --filter @whosonsite/api test:phase2`

5. **Output Final Decision**:
   - Output `READY TO MERGE` or `NOT READY TO MERGE` with formatted findings against `$TARGET_BRANCH`.
