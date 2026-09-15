# Proposal: SACRE webhook verify + migrations live check

## Intent

HEAD claims webhook HMAC fix + green build, but `sacre_build.log` on disk still shows `BUILD_EXIT=1` and the live DB table count is UNVERIFIED. Verify before closing ORN-140.

## Scope

### In Scope
- Re-run `npm run build` + `tsc --noEmit`, refresh `sacre_build.log`
- Self-test HMAC `verifyXSignature` vector (valid/forged/missing)
- Live table count on project `qirzicgqqmcqlvyqskkv` via PAT (read-only SELECT)
- Comment evidence on Linear ORN-140 mirror

### Out of Scope
- New checkout features, F2 catalog, admin UI, photo/copy polish (F5)
- Applying migrations to live DB (needs human `LGTM`; separate change)
- Secret rotation or MP dashboard callback registration

## Capabilities

### New Capabilities
- `webhook-verification`: evidence pack proving MP webhook HMAC + idempotency + build green

### Modified Capabilities
- None

## Approach

Read-only verification first: build, typecheck, HMAC vector via node one-liner, live `SELECT` count. Fix only if verification FAILs; any code change gets its own delta spec.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/api/webhooks/mercadopago/route.ts` | Modified (only if FAIL) | HMAC/idempotency corrections |
| `sacre_build.log` | Modified | Refresh with tonight's run |
| `openspec/changes/sacre-webhook-verify/` | New | This SDD pack |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Build needs network (fonts) | Med | Log shows cause; don't mask as code FAIL |
| Live DB unreachable without creds | Low | PATs exist in Hermes env; read-only query |

## Rollback Plan

Verification writes no prod state. If a fix commit is needed and breaks CI, `git revert` the fix commit; webhook keeps prior committed behavior.

## Dependencies

- Node 20+, `node_modules` present; Supabase PAT (Hermes env)

## Success Criteria

- [ ] `npm run build` EXIT=0 with log on disk
- [ ] `tsc --noEmit` EXIT=0
- [ ] HMAC accepts valid vector, rejects forged/missing
- [ ] Live table count recorded (number, not inferred)
- [ ] ORN-140 carries comment with SHAs + exits
