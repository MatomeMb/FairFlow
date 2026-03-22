# KYC Integration — Sumsub

## Provider

Sumsub (https://sumsub.com)

Replaces: Smile ID (required enterprise onboarding — not self-serve)

## Environment variables

SUMSUB_APP_TOKEN      — from Sumsub dashboard → API Keys

SUMSUB_SECRET_KEY     — from Sumsub dashboard → API Keys

SUMSUB_WEBHOOK_SECRET — from Sumsub dashboard → Webhooks

SUMSUB_FLOW_NAME      — must match flow name in Sumsub dashboard (merchant-kyc)

## Flow

1. Merchant clicks Start Verification
2. Frontend calls POST /v1/merchant/kyc/start
3. Backend calls Sumsub createApplicant + generateAccessToken
4. Sumsub SDK renders inline in dashboard
5. Merchant completes ID verification
6. Sumsub fires POST /v1/merchant/kyc/callback (applicantReviewed)
7. Backend verifies x-payload-digest signature
8. kyc_status updated → payouts unlocked → email sent

## Local testing with ngrok

1. ngrok http 3000
2. Copy https URL → SUMSUB_CALLBACK_URL in .env
3. Restart backend
4. In Sumsub dashboard → Flows → Webhooks → update URL to match ngrok

## Sandbox approval testing

Sumsub dashboard → Applicants → find test applicant → Actions → Approve

This fires the applicantReviewed webhook with reviewAnswer: GREEN

## Admin manual approval (beta bridge)

PATCH /v1/admin/kyc/approve/:merchantId

Authorization: Bearer $ADMIN_SECRET_KEY

Requires: kyc_status === 'pending' (no longer requires kyc_data or bank fields)
