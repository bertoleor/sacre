# Webhook Verification Specification

## Purpose

Evidence that the Mercado Pago webhook receiver is authentic, idempotent, and shippable before ORN-140 closes.

## Requirements

### Requirement: HMAC Signature Enforcement

The system MUST reject any webhook call whose `x-signature` does not validate against `MERCADOPAGO_WEBHOOK_SECRET`.

#### Scenario: Valid signature processed

- GIVEN a POST with correct `x-signature`, `x-request-id`, `data.id`
- WHEN `verifyXSignature` runs
- THEN it returns true and the request continues

#### Scenario: Forged signature rejected

- GIVEN a POST with wrong `v1` or unknown secret
- WHEN the route runs
- THEN it returns 401 and never touches the DB

#### Scenario: Missing headers rejected

- GIVEN no `x-signature`, `x-request-id`, or `data.id`
- WHEN the route runs
- THEN it returns 401 (missing signature) or 400 (bad JSON)

### Requirement: Single Body Read

The system MUST read the request body exactly once per call.

#### Scenario: No double-read 500

- GIVEN any POST to the webhook route
- WHEN the handler parses JSON
- THEN no second `request.text()`/`json()` call exists in code

### Requirement: Idempotent Payment Application

The system MUST NOT duplicate order updates or notifications for a repeated `paymentId`.

#### Scenario: Duplicate delivery

- GIVEN an order already stored with same `payment_id` + `payment_status`
- WHEN the same notification arrives again
- THEN the handler returns early with 200 and inserts nothing

### Requirement: Reproducible Green Build

The system MUST pass `npm run build` and `tsc --noEmit` with exit 0 on a clean checkout.

#### Scenario: Nightly rebuild

- GIVEN committed `main` at recorded SHA
- WHEN CI-equivalent build + typecheck run
- THEN both exit 0 and the log file matches the SHA
