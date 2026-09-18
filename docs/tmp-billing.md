# TEMP — Billing Page & Subscription (Later — Phase 11)

> Temporary working notes. Billing is deferred; this doc is the parking lot for the checkout + subscription effort. Depends on the Phase 10 homepage/registration funnel.

## Goal

Replace the static pricing tiers on the homepage with real subscription management: payment checkout, webhooks, plan-based access, trial-expiry gating, and a billing portal.

## Parked pieces (not started)

- Stripe checkout session creation (`POST /subscription/checkout`) + success/cancel URL handling.
- Payment webhook routing (`POST /subscription/webhook`) -> subscription status transitions.
- Full company-details registration form (phone, address, city, state, zip, country) to capture billing-ready data.
- `subscription_status` enum: `trial` / `active` / `past_due` / `cancelled` / `expired` (sketched in `PLAN.md` §9.1).
- `requireActiveSubscription` guard middleware + frontend `SubscriptionGuard` + `/checkout` redirect.
- Trial badge in `AppLayout` (days remaining).
- Plan-based module access; upgrade/downgrade; billing portal; invoice email.
- Wire homepage pricing tiers to real Stripe plan IDs.

## DB changes (from PLAN.md §9.1, not yet migrated)

Extend `companies`:

- `phone`, `address`, `city`, `state`, `zip_code`, `country`
- `trial_started_at`, `trial_ends_at`, `subscription_status`
- Reserve `stripe_customer_id`, `stripe_subscription_id`

## Status

Not started. `/checkout` placeholder page ships with Phase 10. Full plan lives under PLAN.md Phase 11.