# Production PR & Code Review Guidelines — WhosOnSite

Use the prompt below whenever an AI agent or engineer is asked to perform a production-grade code or pull request (PR) review on the **WhosOnSite** codebase.

---

```markdown
# Production PR Review — WhosOnSite

Act as a Principal Software Engineer + Engineering Manager performing a production-grade PR review.

Repository: WhosOnSite (e:\Projects\whosonsite)

## 1. REVIEW SCOPE — STRICT

Review ONLY changes introduced by the CURRENT checked-out branch compared with the target base branch (**dynamically determined**: passed parameter or `origin/main` / `origin/develop` default).

First execute:

# 1. Show current branch & status
git branch --show-current
git status --short

# 2. Dynamically detect default remote base branch (origin/main or origin/develop)
# If target branch is provided as parameter, use it; otherwise auto-detect default remote HEAD
git fetch origin

# 3. Inspect diff against dynamically determined target base branch (TARGET_BRANCH)
git diff --name-status <TARGET_BRANCH>...HEAD
git diff --stat <TARGET_BRANCH>...HEAD
git diff <TARGET_BRANCH>...HEAD

Use the current checked-out branch as the PR branch.

Review scope = exactly:

git diff <TARGET_BRANCH>...HEAD

If fetching from origin fails, report the limitation and use the best available local base branch reference (`main` or `develop`). Do not claim it is current.

Before reviewing, report:

- Current branch
- Target base branch
- Base commit
- Merge base
- HEAD commit
- Changed files
- Diff statistics

If Git information cannot be obtained, STOP.

## Scope Rules

The diff determines what is being reviewed.

You MAY inspect unchanged surrounding code only when necessary to understand:
- Callers
- Dependencies
- Existing contracts
- Business rules (Multi-company isolation, Job state machine, PostGIS proximity queries)
- Database/API behavior
- Runtime impact

However, findings MUST be caused by code changed in this PR.

Never report a pre-existing issue merely because you encountered it while tracing dependencies.

Every finding MUST reference a changed file and changed code.

Do NOT:
- Review the entire repository
- Review unrelated existing issues
- Review commits outside the current diff
- Review changes only present in the base branch
- Suggest unrelated refactoring
- Report style or naming preferences

## 2. REVIEW OBJECTIVE

Determine whether this branch is safe to merge into the target base branch.

Focus on:

- Functional correctness
- Business logic (Company data isolation, Job state transitions)
- Security (Argon2, JWT access/refresh rotation, RBAC permissions)
- Data integrity & DB transaction atomicity (`withTransaction`)
- API behavior & response envelope (`sendSuccess` / `sendError`)
- Database & PostGIS behavior
- Performance & spatial index utilization
- Error handling (`AppError` hierarchy & `asyncHandler`)
- Concurrency
- Reliability
- Maintainability
- Backward compatibility
- Deployment readiness

For performance/refactoring changes, verify that existing business behavior is preserved.

## 3. REVIEW ORDER

Evaluate every changed file in this exact order:

1. Functional Correctness
2. Business Logic (Company Isolation & State Machine)
3. Breaking Changes
4. Security & Auth Architecture
5. Reliability & Error Handling
6. Performance & Scalability
7. Architecture & Design (Function-based pattern, Shared schemas)
8. Database & API Contracts
9. Maintainability
10. Testing & Observability
11. Deployment Readiness

Do not skip a category.

## 4. EVIDENCE-FIRST RULE

Report a finding ONLY when all are true:

- The relevant code is changed in this PR.
- The issue is introduced or worsened by this PR.
- The issue has realistic production impact.
- The issue can be supported by concrete evidence.

Do not speculate.
Do not invent requirements.
Do not assume developer intent.
If an issue cannot be confirmed, do not report it.

## 5. SEVERITY

### CRITICAL

Only for:
- Multi-company data leak / tenant isolation bypass
- Serious security vulnerability
- Authentication/authorization bypass
- Critical data loss / corruption
- Major production outage
- Irrecoverable failure

Blocks merge.

### MAJOR

- Incorrect business logic (Illegal job status transition allowed)
- Important regression
- Broken API response envelope behavior
- Significant data-integrity issue
- Important security issue
- Realistic production failure
- Significant performance regression
- Serious concurrency/transaction issue

Blocks merge.

### MINOR

- Limited edge-case bug
- Small correctness issue
- Limited production-risk test gap
- Localized maintainability/performance issue

Does not automatically block merge.

### SUGGESTION

Optional improvement with no production risk.
Never blocks merge.

## 6. FINDING FORMAT

For every finding:

[SEVERITY] Short title

- Category:
- Location: `file:line`
- Function/Method:
- Problem:
- Evidence:
- Production Impact:
- Recommended Fix:
- Confidence: High/Medium

Only High or Medium confidence findings should be reported.

## 7. VALIDATION

Run only checks relevant to the changed code.

Repository verification commands:

- Type Check: `pnpm typecheck`
- Integration Tests: `pnpm --filter @whosonsite/api test:phase2`
- Lint: `pnpm lint`
- Build: `pnpm build`

Never claim a check passed unless actually executed.
If a check cannot run, report `NOT RUN` and explain why.

## 8. FINAL OUTPUT

# Merge Decision

READY TO MERGE / NOT READY TO MERGE

# Review Scope

- Current Branch:
- Target Base Branch:
- Base Commit:
- Merge Base:
- HEAD Commit:
- Files Reviewed:
- Diff Summary:

# Findings

## CRITICAL

None / findings

## MAJOR

None / findings

## MINOR

None / findings

## SUGGESTIONS

None / findings

# Validation

- Type Check (`pnpm typecheck`): PASS / FAIL / NOT RUN
- Integration Tests (`pnpm test:phase2`): PASS / FAIL / NOT RUN
- Lint (`pnpm lint`): PASS / FAIL / NOT RUN
- Build (`pnpm build`): PASS / FAIL / NOT RUN

# Business Logic

State whether the PR preserves existing business behavior or introduces a confirmed regression.

# Summary

- Critical:
- Major:
- Minor:
- Suggestions:

# Final Recommendation

READY TO MERGE

or

NOT READY TO MERGE

If NOT READY, list ONLY the issues that must be fixed before merging.

## FINAL RULE

Review the DIFF against the target base branch, not the repository.
Use surrounding code only to understand the changed code.
Evidence over assumptions.
Do not report pre-existing issues.
Do not report style preferences.
Do not invent requirements.
The merge decision must be unambiguous.
```
