# TEMP — Homepage & Registration (Working Draft)

> Temporary working notes for the next phase. Promote the final version into `PLAN.md` / `/docs` once implemented and this file can be deleted.

## Goal

Public marketing homepage at `/` + working `/register` page so the signup funnel (Homepage → Register → Dashboard) works end-to-end.

## Confirmed decisions

- `/` is public for everyone — signed in or not. `/dashboard` stays the app entry for authenticated users.
- Primary CTA "Start free trial" → `/register`; secondary CTA "Sign in" → `/login`.
- Pricing/plans section = 3 static tiers (Starter / Growth / Enterprise), cosmetic marketing copy labeled "billing coming soon". No payment wiring.
- Registration = minimal 3-field form: `companyName`, `email`, `password`. Reuses existing shared `registerSchema` + `registerThunk`. Full company-details form deferred to the billing phase (Phase 11).
- `/checkout` ships as placeholder ("Coming soon").

## Files

New:

- `apps/web/src/pages/LandingPage.tsx` — composes all landing sections
- `apps/web/src/components/landing/Hero.tsx`
- `apps/web/src/components/landing/Features.tsx`
- `apps/web/src/components/landing/HowItWorks.tsx`
- `apps/web/src/components/landing/About.tsx`
- `apps/web/src/components/landing/Plans.tsx`
- `apps/web/src/components/landing/Footer.tsx`
- `apps/web/src/pages/Register.tsx`
- `apps/web/src/components/auth/RegisterForm.tsx`

Modified:

- `apps/web/src/app/app.tsx` — add `/` (public LandingPage, outside `AppLayout`) and `/register` (inside `PublicRoute`); ensure logged-out users land on `/`
- `apps/web/src/app/i18n/resources/en.ts`, `ta.ts` — add `landing` + `auth.register*` keys under `translation`

## Conventions (AGENTS.md)

- Page container: `<Container fluid p={0}>`; `<Stack gap="xs">`; grids `gutter="sm">`.
- Zod validation on submit via `safeParse()` — no HTML5 validation attributes.
- All copy via `useTranslation()` (en + ta).
- lucide-react icons, Mantine components, reuse `Logo`. No `.js` import extensions.

## Verification

- `pnpm typecheck` — 0 errors across shared/web/api.
- `pnpm test` — existing suites pass.
- Manual: `/` renders signed-in + signed-out; `/register` → `/dashboard`; logout returns to `/`.

## Open questions

- Terms-acceptance checkbox on register? (deferred)
- Email verification? (deferred to billing phase)
- SEO/SSR for the marketing page? (Vite SPA is client-rendered; revisit if the site needs search indexing)