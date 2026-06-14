# Codex Reference

This is the working reference for editing the Cooperfile website.
Read this file before changing routes, auth, billing, review generation, dashboard UI, admin UI, or public review pages.

## Product Purpose

Cooperfile is a SaaS review-funnel platform for local businesses.

Core promise:

- Help businesses collect more Google reviews.
- Reduce customer friction with copy-ready review scripts.
- Improve Google Business Profile strength and local SEO visibility.
- Give each business a public review page customers can use in seconds.

Main user flow:

1. A client signs up or logs in.
2. New clients start on the Free plan by default.
3. The client can upgrade to a paid plan through Cashfree.
4. The client creates one or more business review links.
5. The app creates starter review scripts immediately.
6. The client can regenerate richer scripts with OpenAI.
7. Customers open `/review/[slug]`, select a star rating, get two AI-written review options, copy one, and continue to Google.
8. Clicks to Google are tracked on the client dashboard and admin dashboard.

## Stack

- Framework: Next.js 15 App Router
- Language: TypeScript
- UI: React 19, Tailwind CSS, local `components/ui`
- Database: MongoDB with Mongoose
- Auth: custom JWT cookie sessions plus optional Google OAuth
- Billing: Free tier plus Cashfree subscriptions for paid tiers
- AI: OpenAI Responses API with Zod structured output
- QR: `qrcode`

Primary commands:

- `npm run dev` starts the Next.js dev server.
- `npm run build` builds the app.
- `npm run lint` is configured, but this project uses Next 15 where `next lint` may require attention if Next removes that command.

## Important Files

| Path | Purpose |
| --- | --- |
| `app/` | App Router pages, layouts, and API route handlers |
| `components/` | UI components for auth, dashboard, billing, admin, public review pages |
| `lib/` | auth, db, billing helpers, validators, integration helpers |
| `lib/services/` | domain/business logic used by routes and pages |
| `models/` | Mongoose schemas |
| `types/index.ts` | shared enums and domain types |
| `middleware.ts` | route protection and auth redirects |
| `tailwind.config.ts` | Tailwind theme tokens and animation utilities |
| `app/globals.css` | global design tokens and custom utility classes |

Keep this separation:

- Route handlers own HTTP parsing, auth checks, status codes, and JSON/redirect responses.
- Services own domain logic and database writes.
- Models own persistence shape and indexes.
- Components own presentation and client-side interactions.
- Shared constants and domain types belong in `types/index.ts` or focused `lib/*` modules.

## Environment Variables

Do not commit real secrets. `.env.example` documents the required variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAILS`
- `CASHFREE_ENVIRONMENT`
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `CASHFREE_WEBHOOK_SECRET`

Security-sensitive notes:

- `JWT_SECRET` signs the `review_funnel_session` cookie.
- `ADMIN_EMAILS` grants admin role even if the database role is not `admin`.
- Cashfree webhook verification uses `CASHFREE_WEBHOOK_SECRET`, falling back to `CASHFREE_SECRET_KEY`.

## Routes

Public and marketing:

- `/`
- `/terms-and-conditions`
- `/privacy-policy`
- `/refunds-and-cancellations`
- `/refund-policy`
- `/shipping-and-delivery`
- `/contact-us`
- `/review/[slug]`

Auth:

- `/login`
- `/signup`
- `/admin/login`

Client dashboard:

- `/dashboard`
- `/dashboard/billing`
- `/dashboard/billing/confirm`
- `/dashboard/clients/new`
- `/dashboard/clients/[clientId]`

Admin:

- `/admin`

API:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/[clientId]`
- `PATCH /api/clients/[clientId]`
- `DELETE /api/clients/[clientId]`
- `POST /api/clients/[clientId]/generate-reviews`
- `POST /api/review/[slug]/generate`
- `POST /api/review/[slug]/click`
- `POST /api/billing/contact`
- `POST /api/billing/free`
- `POST /api/billing/checkout`
- `GET|POST /api/billing/return`
- `POST /api/billing/webhook`
- `POST /api/admin/subscriptions`
- `POST /api/admin/clients`
- `DELETE /api/admin/clients/[clientId]`
- `DELETE /api/admin/users/[userId]`

## Auth Rules

Core files:

- `lib/auth.ts`
- `lib/auth-redirect.ts`
- `lib/google-auth.ts`
- `middleware.ts`
- `app/api/auth/**`

Session cookie:

- Name: `review_funnel_session`
- Format: JWT signed with `JWT_SECRET`
- Payload: `userId`, `email`, `role`
- TTL: 7 days
- HTTP-only, `sameSite: "lax"`, secure in production

Roles:

- `client`
- `admin`

Admin resolution:

- Database `role` is `admin`, or
- normalized email exists in comma-separated `ADMIN_EMAILS`

Middleware behavior:

- Unauthenticated `/dashboard/**` goes to `/login`.
- Unauthenticated `/admin/**` except `/admin/login` goes to `/admin/login`.
- Admins are redirected away from `/dashboard/**` to `/admin`.
- Clients are redirected away from `/admin/**` to `/dashboard`.
- Authenticated users are redirected away from `/login`, `/signup`, and `/admin/login`.

Use the right guard:

- Client pages: `requireClientUser()`
- Admin pages: `requireAdminUser()` or trusted admin layout protection
- Client APIs: `requireApiUser()`
- Admin APIs: `requireApiAdminUser()`

Post-login redirects must stay local and role-safe through `resolveSafePostAuthRedirect`.

## Data Models

### User

Defined in `models/User.ts`.

Important fields:

- identity: `email`, `password`, `googleId`, `name`, `image`, `phone`
- role: `role`
- plan: `subscriptionTier`, `subscriptionInterval`, `subscriptionStatus`, `subscriptionAutoRenew`
- period: `subscriptionCurrentPeriodStart`, `subscriptionCurrentPeriodEnd`
- pending checkout: `pendingSubscriptionTier`, `pendingSubscriptionInterval`
- Cashfree: `cashfreeCustomerId`, `cashfreeSubscriptionId`, `cashfreeCfSubscriptionId`, `cashfreeSubscriptionStatus`
- payment trace: `lastPaymentAt`

### Client

Defined in `models/Client.ts`.

Represents one business review funnel and public page.

Important fields:

- owner: `userId`
- public identity: `slug`
- business data: `businessName`, `city`, `sector`, `industry`, `businessDescription`
- expiry: `expiresAt`, `expiryMode`
- outbound destination: `googleReviewLink`
- analytics: `clickCount`

Indexes:

- `slug` unique
- `userId`
- `expiresAt`
- compound `{ userId: 1, createdAt: -1 }`

### Review

Defined in `models/Review.ts`.

Represents one suggested review script for a client.

Important fields:

- `clientId`
- `category`
- `text`

Indexes:

- `clientId`
- compound `{ clientId: 1, category: 1 }`

### BillingEvent

Defined in `models/BillingEvent.ts`.

Used for Cashfree webhook idempotency.

Important fields:

- `eventKey` unique
- `eventType`
- raw `payload`

## Shared Domain Enums

Defined in `types/index.ts`.

Business sectors:

- `Hotel`
- `Hostel`
- `Restaurant`
- `Cafe`
- `Doctor Clinic`
- `Education`
- `Fitness Gym`
- `Salon Spa`
- `Retail Shop`
- `Real Estate`
- `General Business`

Review categories:

- `General`
- `Study Environment`
- `Safety`
- `Food`
- `Service Quality`
- `Staff & Support`
- `Cleanliness`
- `Comfort`
- `Treatment Experience`
- `Ambience`
- `Value`

Subscription tiers:

- `none`
- `free`
- `tier_1`
- `tier_2`
- `tier_3`

Subscription statuses:

- `inactive`
- `pending`
- `active`
- `past_due`
- `expired`
- `cancelled`

Client expiry modes:

- `subscription`
- `custom`

When changing enum values, update:

- `types/index.ts`
- related Mongoose enum fields
- validation in `lib/validators.ts`
- UI labels/dropdowns
- AI schema/category logic if review categories change

## Billing Model

Billing config lives in `lib/billing.ts`.

Current public plans:

| Internal Tier | Public Name | Monthly | Yearly | Active Link Limit | Review Capacity |
| --- | --- | --- | --- | --- | --- |
| `free` | Free | `INR 0` | `INR 0` | 1 | 10 scripts per month |
| `tier_1` | Starter | `INR 199` | `INR 1990` | 1 | 200 per link per month, 2400 yearly |
| `tier_2` | Growth | `INR 499` | `INR 4990` | 5 | 500 per link per month, 6000 yearly |
| `tier_3` | Scale | `INR 999` | `INR 9990` | unlimited | unlimited |

Important invariant:

- UI can show `Free`, `Starter`, `Growth`, and `Scale`.
- Database/API values must stay `free`, `tier_1`, `tier_2`, `tier_3`.
- Only `tier_1`, `tier_2`, and `tier_3` enter Cashfree checkout. Use `PaidSubscriptionTier` for paid billing code.

Subscription access helpers:

- `hasActiveSubscription(user)` means status is `active` and period end is future.
- `hasSubscriptionAccess(user)` means status is `active` or `cancelled` and period end is future.

This distinction is deliberate. Cancelled users keep access until the paid period ends.

Client creation checks:

- `assertCanCreateClientForUser` requires normalized status `active`.
- `canCreateClientForTier` enforces active link limits.
- Existing cancelled-but-still-paid users have access, but creation currently depends on summary status being `active`.

Client link expiry:

- `expiryMode: "subscription"` means link expiry follows the owner's subscription period end.
- `expiryMode: "custom"` means explicit expiry, but it cannot be later than subscription end.
- Public pages expire if owner subscription access is gone, even if the client document still exists.

## Cashfree Flow

Core files:

- `components/billing/billing-page-client.tsx`
- `app/api/billing/contact/route.ts`
- `app/api/billing/checkout/route.ts`
- `app/api/billing/return/route.ts`
- `app/api/billing/webhook/route.ts`
- `lib/services/cashfree-service.ts`
- `lib/services/billing-service.ts`

Flow:

1. Client visits `/dashboard/billing`.
2. Client enters a 10-digit phone number.
3. Client chooses a tier and monthly/yearly interval.
4. UI calls `POST /api/billing/checkout`.
5. Server creates a Cashfree subscription.
6. Server stores pending tier/interval and Cashfree IDs on the user.
7. Cashfree checkout redirects to `/api/billing/return`.
8. Return route normalizes query/body params and redirects to `/dashboard/billing/confirm`.
9. Confirmation page can fetch remote state, but webhook is the source of truth.
10. `/api/billing/webhook` verifies signature, handles idempotency, and updates subscription state.

Cashfree details:

- API version is `2025-01-01`.
- Sandbox/production base URL is selected from `CASHFREE_ENVIRONMENT`.
- Checkout uses Cashfree JS SDK from `https://sdk.cashfree.com/js/v3/cashfree.js`.
- Webhook signature checks `timestamp + rawBody` with HMAC SHA-256.
- Duplicate webhook events are stored in `BillingEvent` and ignored.

Webhook behavior:

- `SUBSCRIPTION_PAYMENT_SUCCESS`: activates the user.
- `SUBSCRIPTION_STATUS_CHANGED` with `ACTIVE`: activates and can preserve the current period for pending changes.
- `SUBSCRIPTION_STATUS_CHANGED` with cancelled/expired statuses: degrades to `cancelled` or `expired`.
- `SUBSCRIPTION_PAYMENT_FAILED` and `SUBSCRIPTION_PAYMENT_CANCELLED`: marks `past_due`.

Upgrade behavior:

- Starting a new checkout stores pending tier/interval.
- Existing paid access is preserved until Cashfree confirms the new checkout.

## Review Link Lifecycle

Core files:

- `components/clients/client-form.tsx`
- `components/dashboard/client-card.tsx`
- `app/api/clients/**`
- `lib/services/client-service.ts`
- `lib/services/review-service.ts`
- `lib/services/ai-service.ts`
- `app/review/[slug]/page.tsx`
- `components/reviews/**`

Creation flow:

1. Client submits business data.
2. `validateClientInput` trims and validates fields.
3. `createClientForUser` checks subscription and plan capacity.
4. A unique slug is generated from business name and city.
5. Expiry is resolved from subscription end or requested custom expiry.
6. Client document is created.
7. Starter reviews are generated locally with `buildStarterReviews`.
8. Public page is available at `/review/[slug]`.

Update flow:

- `PATCH /api/clients/[clientId]` validates input.
- `updateClientForUser` requires subscription access.
- Business data, expiry, and Google review link are updated.
- Updating a client does not regenerate reviews automatically.

Delete flow:

- Client delete also deletes all reviews with that `clientId`.
- Admin delete follows the same cleanup rule.

Review generation:

- Starter reviews come from templates in `lib/services/review-service.ts`.
- AI regeneration is triggered by `POST /api/clients/[clientId]/generate-reviews`.
- AI uses OpenAI Responses API with structured Zod output.
- Model defaults to `gpt-5.4-mini` unless `OPENAI_MODEL` is set.
- AI output must be 20 to 50 reviews, category in `REVIEW_CATEGORIES`, text 60 to 320 characters.
- Regeneration deletes existing reviews for that client and inserts the new batch.

Public page:

- `/review/[slug]` calls `getPublicClientBySlug`.
- If owner access is inactive or link is expired, render `ExpiredReviewBoard`.
- If active, render `PublicReviewBoard` with the business data.
- The customer selects a 1-5 star rating.
- The UI calls `POST /api/review/[slug]/generate`.
- The API verifies the public link is still active and calls `generateCustomerReviewOptions`.
- OpenAI returns exactly two rating-aware review options.
- The customer chooses one option, copies it, and opens the client Google review link.
- The click action posts to `/api/review/[slug]/click` and increments `clickCount`.

## Admin Features

Core files:

- `app/(admin)/admin/layout.tsx`
- `app/(admin)/admin/page.tsx`
- `components/admin/admin-shell.tsx`
- `components/admin/admin-dashboard-client.tsx`
- `lib/services/admin-service.ts`
- `app/api/admin/**`

Admin capabilities:

- View user, client, review, click, MRR, and ARR metrics.
- Grant a plan to a client user.
- Revoke a client's plan.
- Manually create a review link for an existing owner email.
- Delete any client link and its reviews.
- Delete a client user and all owned client links/reviews.

Revenue math:

- Monthly plans contribute monthly price to MRR.
- Yearly plans contribute `yearlyPrice / 12` to MRR.
- ARR uses full annualized value.

Admin plan changes:

- Granting a paid tier uses `applySuccessfulSubscriptionForUser`.
- Revoking sets tier to `none`, status to `inactive`, clears period fields, and sets Cashfree status to `ADMIN_REVOKED`.

## Validation Rules

Core file: `lib/validators.ts`.

Email:

- Trimmed and lowercased.
- Must match basic email regex.

Password:

- At least 8 characters.

Phone:

- Exactly 10 digits.

Client input:

- `businessName`, `city`, and `googleReviewLink` required.
- Google review link is normalized with `normalizeExternalUrl`.
- Sector must be in `BUSINESS_SECTORS` if supplied.
- Business description max is 600 characters.
- Expiry date must parse as a date.

Billing selection:

- Tier must be a paid tier, not `none`.
- Interval must be `monthly` or `yearly`.

## Design System Notes

Main styling files:

- `tailwind.config.ts`
- `app/globals.css`
- `components/ui/*`

Visual direction:

- Brand is teal/cyan with dark hero surfaces.
- Body background uses `paper` / `--surface-base`.
- App surfaces use tonal cards, subtle borders, ambient shadows, and restrained gradients.
- Marketing and public review headers use `hero-gradient` and `premium-grid`.
- Dashboard surfaces prefer `surface-card`, `surface-card-elevated`, `ghost-border`, `card-hover`, `data-pulse`.

Tailwind theme tokens:

- `ink`: `#191c1e`
- `paper`: `#f7f9fb`
- `brand`: `#0d9488`
- `brand.dark`: `#0f766e`
- `brand.light`: `#ccfbf1`
- `brand.muted`: `#99f6e4`
- `accent`: `#06b6d4`

Global CSS tokens:

- `--surface-base`
- `--surface-low`
- `--surface-card`
- `--surface-container`
- `--surface-high`
- `--surface-highest`
- `--on-surface`
- `--on-surface-variant`
- `--outline`
- `--outline-variant`
- `--gradient-primary`
- `--gradient-primary-hover`
- `--gradient-dark`

Component conventions:

- Use local `Button`, `Input`, `Textarea`, and `Badge` where practical.
- Prefer consistent rounded-xl controls already used in the app.
- Keep responsive layouts with `flex-wrap`, `min-w-0`, and `overflow-x-hidden` patterns used in existing shells.
- Do not introduce a separate UI framework unless explicitly requested.
- Do not replace existing manual SVG icons wholesale unless doing a specific icon cleanup.

Existing visual caveat:

- The app already uses decorative glow/orb-like backgrounds in some hero/admin sections. If changing those areas, keep the result polished and avoid making the palette even more one-note.

## Editing Rules For This Codebase

Before editing:

- Read this file.
- Check related service, route, model, and component files before changing behavior.
- Check `CLAUDE.md` too if the change touches billing, auth, or broader architecture, because it contains another project-specific architecture guide.

While editing:

- Keep business rules in services, not duplicated inside UI components.
- Keep API routes thin.
- Preserve auth role separation between client and admin surfaces.
- Preserve Cashfree webhook verification and idempotency.
- Preserve client/review cleanup when deleting clients.
- Preserve `tier_1`/`tier_2`/`tier_3` internal values.
- Preserve public expired-link behavior.
- Avoid leaking `.env` values or real secrets into docs, logs, or UI.
- Prefer updating shared helpers/constants over scattering duplicate logic.

When adding a feature:

- Add or update domain types first if the feature changes persisted shape or API payloads.
- Update validators for any new submitted fields.
- Update services for database and external-provider behavior.
- Update route handlers to call those services.
- Update UI components last.
- Add focused tests if the repo gains a test setup or if the user asks for test coverage.

When changing billing:

- Update `lib/billing.ts` first.
- Then update billing UI labels and admin revenue calculations.
- Then check webhook behavior and subscription period logic.
- Be careful with active vs access semantics.

When changing review categories or sectors:

- Update `types/index.ts`.
- Update `SECTOR_CATEGORY_MAP` and `CATEGORY_TEMPLATES` in `review-service.ts`.
- Update OpenAI structured schema impact in `ai-service.ts`.
- Update form dropdowns and public display if needed.

When changing auth:

- Update both `lib/auth.ts` and `middleware.ts` if role/session behavior changes.
- Keep `auth-redirect.ts` role-safe.
- Keep auth responses `no-store`.
- Keep Google OAuth state and nonce validation.

When changing public review UX:

- Verify manual copy fallback still works.
- Keep click tracking fire-and-forget so it does not block the user.
- Keep `window.open` tied to user interaction to avoid popup blockers.

## Known Implementation Details To Remember

- Next App Router dynamic params are typed as `Promise<{ ... }>` in this codebase.
- Several server pages use `export const dynamic = "force-dynamic"` where auth or fresh DB data matters.
- Mongoose connection is cached in `lib/db.ts`.
- `resolveAppOrigin` respects forwarded host/proto for deployed checkout return URLs.
- `normalizeExternalUrl` adds `https://` if a URL has no protocol.
- `detectSector` and `detectIndustry` infer defaults from business-name keywords.
- The dashboard QR download is client-side and generated from the current browser origin.
- `getPublicClientBySlug` returns an expired payload instead of null when the link exists but access is not valid.

## Verification Checklist

For documentation-only changes:

- Confirm the new markdown renders and has no real secrets.

For code changes:

- Run `npm run build` when practical.
- If build is too expensive, run the narrowest relevant command and explain what was not run.
- Manually check impacted pages in the browser for UI changes.
- For billing changes, test both configured and missing-Cashfree states.
- For auth changes, test client login, admin login, and redirect behavior.
- For public review changes, test active link, expired link, copy fallback path, and click tracking.
