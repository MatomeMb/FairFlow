# ADR-002: Paystack as the payment provider

**Status:** Accepted  
**Date:** March 2026

## Context

Payments are in ZAR for South African merchants and consumers; webhooks must confirm paid orders reliably.

## Decision

Use Paystack (paystack-sdk, webhook route /webhooks/paystack with HMAC-SHA512 verification).

## Consequences

**Positive:** ZAR-native flows and SA-focused operations.

**Negative:** International expansion may require an additional payment rail later.

## Alternatives considered

Stripe (broader globally, weaker SA fit for beta) and Ozow (EFT-first).
