# Tasks: SACRE webhook verify + migrations live check

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 10-40 (log refresh + SDD pack only, no code expected) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single commit on main |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Verification (read-only)

- [ ] 1.1 Re-run `npm run build` in `sacre-shop`, capture exit + tail to `sacre_build.log`
- [ ] 1.2 Run `npx tsc --noEmit`, record exit code
- [ ] 1.3 HMAC vector self-test on `verifyXSignature` logic (valid/forged/missing) via node one-liner
- [ ] 1.4 Live `SELECT` table count on `qirzicgqqmcqlvyqskkv` via PAT (read-only, no secrets in output)

## Phase 2: Fix (only if Phase 1 FAILs)

- [ ] 2.1 Patch the failing file with minimal diff, re-run 1.1-1.3
- [ ] 2.2 Never commit `.env.local` or secrets; never delete untracked personal files

## Phase 3: Delivery

- [ ] 3.1 Move kanban card + comment evidence (SHA, exits, table count) on Linear ORN-140
- [ ] 3.2 Commit SDD pack + refreshed log, push main
- [ ] 3.3 Envelope report (auditor verdict PASS/FAIL + producto next step)
