# Plan — Proper Mobile Number Input

- Status: Approved
- Decisions: no new dependencies (auto-format + validation); display format = digits/spaces only (no forced grouping); auto-add `+1` for bare 10-digit numbers; apply to both customer and agent forms.

---

## 1. Shared validation

File: `packages/shared/src/schemas/index.ts`

- Add a reusable phone validator:
  - Optional leading `+`.
  - Strip all non-digits and require **7–15 digits** (E.164 range).
  - Error message: `"Enter a valid phone number"`.
- Apply to:
  - `createCustomerSchema.mobile` (replaces `z.string().min(7, ...)`).
  - `createAgentSchema.phone` (replaces `z.string().min(7, ...)`).
- Backwards compatible: separator characters (`(`, `)`, `-`, `.`, spaces) are stripped before counting, so existing stored values like `404-555-0191` and `+1 555-0192` still validate.

## 2. Phone utils

New file: `apps/web/src/lib/format/phone.ts`

- `sanitizePhoneInput(value)`: keep only digits, spaces, and `+`. Strips `(`, `)`, `-`, `.`.
- `digitsOnly(value)`: remove all non-digit characters.
- `isUsTenDigit(value)`: true if the stripped value has exactly 10 digits and no leading `+`.
- `normalizeOnBlur(value)`: if `isUsTenDigit`, prepend `+1 `; otherwise return unchanged.
  - `4045550192` → `+1 4045550192`
  - `+1 404 555 0192` → unchanged
  - `+44 7911 123456` → unchanged (international already has `+`)

## 3. Reusable component

New file: `apps/web/src/components/shared/PhoneInput.tsx`

- Wraps Mantine `TextInput`.
- HTML attributes on the input: `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`.
- Props mirror existing inputs:
  - `value: string`
  - `onChange(value: string)`
  - `label?: string`
  - `placeholder?: string`
  - `error?: string`
  - `withAsterisk?: boolean`
- Behavior:
  - On change: apply `sanitizePhoneInput` (digits/spaces only — no forced grouping).
  - On blur: apply `normalizeOnBlur` (+1 injection for bare 10-digit input).

## 4. Wire into forms

- `apps/web/src/components/customers/Form.tsx` (mobile field, ~line 264): swap `TextInput` → `PhoneInput`.
- `apps/web/src/components/agents/Form.tsx` (phone field, ~line 98): swap `TextInput` → `PhoneInput`.
- Keep the existing shared-schema `safeParse` flow on submit (validation stays in `@whosonsite/shared` per AGENTS.md).

## 5. Search consistency

File: `apps/web/src/components/customers/List.tsx` (~line 21)

- Compare digit-only forms with `digitsOnly` so a search for `4045550191` matches a stored `(404) 555-0191`.

## 6. Tests and verification

- New unit test: `apps/web/src/test/lib/format-phone.test.ts` (jsdom harness already configured).
- Cover: `sanitizePhoneInput` filtering, `digitsOnly`, and `normalizeOnBlur` 10-digit `+1` behavior.
- Run:
  1. `pnpm typecheck` — 0 errors across all packages.
  2. `pnpm test` — web and api suites pass.

## Files touched

| Action | File                                            |
| ------ | ----------------------------------------------- |
| Edit   | `packages/shared/src/schemas/index.ts`          |
| Add    | `apps/web/src/lib/format/phone.ts`              |
| Add    | `apps/web/src/components/shared/PhoneInput.tsx` |
| Edit   | `apps/web/src/components/customers/Form.tsx`    |
| Edit   | `apps/web/src/components/agents/Form.tsx`       |
| Edit   | `apps/web/src/components/customers/List.tsx`    |
| Add    | `apps/web/src/test/lib/format-phone.test.ts`    |
