# CLAUDE.md

## Purpose

This file is the working architecture guide for the `review machine tool` codebase.

Use it as the first reference before making product, billing, auth, or API changes.

This project is a SaaS review-funnel platform for businesses:

- Clients sign up, choose a paid plan, and create review links.
- Each review link belongs to one business profile and exposes curated review suggestions to end customers.
- End customers open a public review page, copy a suggested review, and continue to the business's Google review URL.
- Admins use a separate control panel to manage client plans, create clients manually, and track platform metrics.

The app is opinionated around one core product promise:

- help businesses collect more Google reviews,
- improve Google Business Profile strength,
- improve local SEO visibility,
- reduce friction with a one-click review flow.

## Stack

- Framework: Next.js 15 App Router
- Language: TypeScript
- UI: React + Tailwind CSS + local `components/ui`
- Database: MongoDB via Mongoose
- Auth: custom JWT cookie auth + optional Google OAuth
- Billing: Cashfree subscriptions
- AI generation: OpenAI Responses API
- Validation: lightweight runtime validators in `lib/validators.ts` plus Zod for structured OpenAI output

## High-Level Architecture

The app is split into four product surfaces:

| Surface | Routes | Who uses it | Purpose |
| --- | --- | --- | --- |
| Marketing site | `/` and legal pages | Public | explain product, pricing, compliance pages |
| Client auth | `/login`, `/signup` | Client users | sign up and sign in |
| Client app | `/dashboard/**` | Client users | billing, review link creation, review generation, link management |
| Admin app | `/admin/login`, `/admin/**` | Admin users | platform control, manual plan updates, revenue and usage visibility |

The app uses App Router route groups:

- `app/(auth)` for public auth pages
- `app/(dashboard)` for client pages
- `app/(admin)` for admin pages
- `app/api/**` for all API routes

## Core Folders

| Path | Responsibility |
| --- | --- |
| `app/` | pages, layouts, route handlers |
| `components/` | client and server UI building blocks |
| `lib/` | auth, billing, db, validators, integration helpers |
| `lib/services/` | business logic layer used by routes and pages |
| `models/` | Mongoose schemas |
| `types/` | shared domain types and enums |
| `middleware.ts` | route protection and auth-based redirects |

## Request Flow Pattern

Most features follow the same pattern:

1. Page or client component triggers an API call.
2. Route handler validates auth and input.
3. Route calls a service in `lib/services`.
4. Service talks to MongoDB and external providers if needed.
5. Route returns JSON or redirects.

This is the important separation to keep:

- route handlers own HTTP concerns,
- services own domain logic,
- models own persistence shape,
- components own presentation.

## Auth Architecture

Primary auth code lives in:

- `lib/auth.ts`
- `lib/auth-redirect.ts`
- `middleware.ts`
- `app/api/auth/**`
- `lib/google-auth.ts`

### Session model

- Session cookie name: `review_funnel_session`
- Cookie payload: `userId`, `email`, `role`
- Session format: signed JWT using `JWT_SECRET`
- Session lifetime: 7 days

### Roles

There are only two roles:

- `client`
- `admin`

Admin role is resolved in two ways:

- user document role is `admin`, or
- user email is listed in `ADMIN_EMAILS`

This means `ADMIN_EMAILS` is security-sensitive and effectively acts as a role override.

### Route protection rules

`middleware.ts` enforces:

- unauthenticated users hitting `/dashboard/**` go to `/login`
- unauthenticated users hitting `/admin/**` go to `/admin/login`
- admins are redirected away from `/dashboard/**` to `/admin`
- non-admins are redirected away from `/admin/**` to `/dashboard`
- authenticated users are redirected away from `/login`, `/signup`, and `/admin/login`

`lib/auth-redirect.ts` also sanitizes `next` parameters so post-login redirects stay local and role-safe.

### Auth endpoints

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/auth/signup` | `POST` | email/password signup, creates client user, sets auth cookie, redirects to billing |
| `/api/auth/login` | `POST` | email/password login, sets auth cookie, returns role-aware redirect |
| `/api/auth/logout` | `POST` | clears auth cookie |
| `/api/auth/google` | `GET` | starts Google OAuth |
| `/api/auth/google/callback` | `GET` | exchanges code, verifies Google ID token, upserts user, sets auth cookie |

### Important auth invariants

- Admin and client experiences are intentionally separated.
- Client routes should use `requireClientUser` or `requireApiUser`.
- Admin routes should use `requireAdminUser` or `requireApiAdminUser`.
- Login/logout responses are deliberately `no-store` to avoid stale auth state in the browser.

## Data Model

### `User`

Defined in `models/User.ts`.

Key fields:

- identity: `email`, `password`, `googleId`, `name`, `image`, `phone`
- role: `role`
- billing state: `subscriptionTier`, `subscriptionInterval`, `subscriptionStatus`, `subscriptionAutoRenew`
- billing period: `subscriptionCurrentPeriodStart`, `subscriptionCurrentPeriodEnd`
- pending change state: `pendingSubscriptionTier`, `pendingSubscriptionInterval`
- payment tracing: `lastPaymentAt`, `cashfreeSubscriptionId`, `cashfreeCfSubscriptionId`, `cashfreeSubscriptionStatus`

### `Client`

Defined in `models/Client.ts`.

Represents one review funnel / public review page for one business.

Key fields:

- ownership: `userId`
- sharing: `slug`
- business data: `businessName`, `city`, `sector`, `industry`, `businessDescription`
- link rules: `expiresAt`, `expiryMode`
- destination: `googleReviewLink`
- analytics: `clickCount`

### `Review`

Defined in `models/Review.ts`.

Represents one curated review suggestion attached to a client.

Key fields:

- `clientId`
- `category`
- `text`

### `BillingEvent`

Defined in `models/BillingEvent.ts`.

Used for webhook idempotency.

Key fields:

- `eventKey`
- `eventType`
- raw `payload`

## Plan Model

Shared billing config lives in `lib/billing.ts`.

Public plan names:

- `tier_1` -> `Starter`
- `tier_2` -> `Growth`
- `tier_3` -> `Scale`

Current pricing and limits:

| Internal Tier | Public Name | Monthly | Yearly | Active Link Limit | Review Capacity |
| --- | --- | --- | --- | --- | --- |
| `tier_1` | Starter | `₹199` | `₹1990` | 1 | 200 per link |
| `tier_2` | Growth | `₹499` | `₹4990` | 5 | 500 per link |
| `tier_3` | Scale | `₹999` | `₹9990` | unlimited | unlimited |

Important invariant:

- UI labels may say `Starter`, `Growth`, and `Scale`, but database/API tier values stay `tier_1`, `tier_2`, and `tier_3`.

## Subscription State Rules

These rules are spread across:

- `lib/billing.ts`
- `lib/services/billing-service.ts`
- `app/api/billing/webhook/route.ts`
- `app/(dashboard)/dashboard/billing/confirm/page.tsx`

### Access model

There is an important distinction between:

- `hasActiveSubscription(user)`
- `hasSubscriptionAccess(user)`

`hasActiveSubscription` means:

- status is `active`
- current period end is in the future

`hasSubscriptionAccess` means:

- status is `active` or `cancelled`
- current period end is still in the future

This is deliberate.

It allows a user who turned off renewal or was marked cancelled remotely to keep access until the paid period actually ends.

### Client link expiry model

Each client link has:

- `expiryMode = subscription`
- or `expiryMode = custom`

Rules:

- subscription-mode links follow the owner's subscription period end
- custom links can expire earlier than the subscription
- custom links cannot expire later than the current subscription end
- public review links are considered expired if the owner no longer has subscription access, even if the client document still exists

## Billing and Cashfree Flow

### Main flow

1. Client opens `/dashboard/billing`
2. Client enters a 10-digit phone number
3. Client chooses a tier and interval
4. Frontend calls `POST /api/billing/checkout`
5. App creates a Cashfree subscription and stores pending subscription details on the user
6. Cashfree sends customer back to `/api/billing/return`
7. Return route redirects to `/dashboard/billing/confirm`
8. Confirm page fetches Cashfree subscription state
9. Real source of truth is still the Cashfree webhook on `/api/billing/webhook`
10. Webhook activates, updates, or degrades subscription state

### Billing endpoints

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/billing/contact` | `POST` | saves billing phone number |
| `/api/billing/checkout` | `POST` | validates plan + phone, creates Cashfree subscription, stores pending state |
| `/api/billing/return` | `GET`, `POST` | normalizes Cashfree redirect payload and forwards to billing confirm page |
| `/api/billing/webhook` | `POST` | verifies Cashfree signature and updates subscription state |

### Cashfree integration details

Primary code:

- `lib/services/cashfree-service.ts`

The app currently uses:

- API version: `2025-01-01`
- base URL from `CASHFREE_ENVIRONMENT`
- `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` for API requests
- `CASHFREE_WEBHOOK_SECRET` for webhook verification

Webhook verification:

- request must include `x-webhook-signature`
- request must include `x-webhook-timestamp`
- signature is verified against `timestamp + rawBody`

Webhook idempotency:

- handled via `BillingEvent`
- duplicate events are ignored

Current webhook behavior:

- `SUBSCRIPTION_PAYMENT_SUCCESS` activates the user
- `SUBSCRIPTION_STATUS_CHANGED` can activate, cancel, or expire the user depending on remote status
- `SUBSCRIPTION_PAYMENT_FAILED` and `SUBSCRIPTION_PAYMENT_CANCELLED` degrade the user to `past_due`

### Upgrade behavior

Pending upgrades are designed not to remove current access immediately.

When a paid user starts another checkout:

- pending tier and interval are stored,
- current access is preserved if the existing paid period is still valid,
- access only changes permanently when confirmation/webhook succeeds.

## Review Link Lifecycle

Core files:

- `lib/services/client-service.ts`
- `lib/services/review-service.ts`
- `lib/services/ai-service.ts`
- `app/review/[slug]/page.tsx`

### Client creation flow

1. Client user submits a business form.
2. `POST /api/clients` validates input.
3. Billing service checks plan capacity.
4. App creates a unique slug.
5. App resolves expiry based on subscription period or custom date.
6. App creates a `Client`.
7. App generates starter review suggestions locally from templates.
8. Public page becomes available at `/review/[slug]`.

### Review generation flow

Starter content:

- generated locally by `buildStarterReviews` in `lib/services/review-service.ts`
- category templates vary by business sector

AI regeneration:

- handled by `POST /api/clients/[clientId]/generate-reviews`
- calls `generateReviewsForClient` in `lib/services/ai-service.ts`
- uses OpenAI Responses API with structured Zod parsing
- deletes existing reviews for that client and replaces them with newly generated ones

### Public review page behavior

`app/review/[slug]/page.tsx`:

- fetches public client availability
- shows `ExpiredReviewBoard` if subscription is inactive or link expired
- otherwise rotates reviews by category and renders `PublicReviewBoard`

The click tracking endpoint is:

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/review/[slug]/click` | `POST` | increments click count for outbound Google review flow |

## Client APIs

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/clients` | `GET` | list current user's clients |
| `/api/clients` | `POST` | create a new client review link |
| `/api/clients/[clientId]` | `GET` | fetch one client |
| `/api/clients/[clientId]` | `PATCH` | update client details |
| `/api/clients/[clientId]` | `DELETE` | remove client and its reviews |
| `/api/clients/[clientId]/generate-reviews` | `POST` | regenerate review bank with OpenAI |

## Admin APIs

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/admin/subscriptions` | `POST` | manually assign or revoke a user's plan |
| `/api/admin/clients` | `POST` | manually create a client for an owner email |

Admin data aggregation lives in `lib/services/admin-service.ts`.

It computes:

- total client users
- total managed links
- active subscribers
- total reviews
- total review clicks
- estimated MRR
- active ARR

Revenue math:

- monthly plans count at their monthly value
- yearly plans are normalized to monthly value for MRR using `yearlyPrice / 12`
- yearly plans count at full yearly value for ARR

## External Integrations

### MongoDB

Code:

- `lib/db.ts`
- `models/**`

Behavior:

- Mongoose connection is cached globally
- all services call `connectToDatabase()` before queries

### OpenAI

Code:

- `lib/services/ai-service.ts`

Used for:

- generating 20 to 50 review suggestions per client

Important behavior:

- requires `OPENAI_API_KEY`
- model defaults to `gpt-5.4-mini`
- uses structured parsing to enforce category and text constraints

### Google OAuth

Code:

- `lib/google-auth.ts`
- `app/api/auth/google/route.ts`
- `app/api/auth/google/callback/route.ts`

Behavior:

- OAuth state and nonce are stored in cookies
- callback exchanges code for ID token
- token is verified against Google's JWKS
- user is created or updated locally

### Cashfree

Code:

- `lib/services/cashfree-service.ts`
- `app/api/billing/**`

Used for:

- subscription checkout
- subscription return redirect handling
- webhook-based subscription truth

## Key UI Surfaces

### Client dashboard

Main routes:

- `/dashboard`
- `/dashboard/billing`
- `/dashboard/billing/confirm`
- `/dashboard/clients/new`
- `/dashboard/clients/[clientId]`

Key components:

- `components/dashboard/dashboard-shell.tsx`
- `components/dashboard/client-card.tsx`
- `components/billing/billing-page-client.tsx`
- `components/clients/client-form.tsx`
- `components/reviews/review-card.tsx`

### Admin panel

Main routes:

- `/admin/login`
- `/admin`

Key components:

- `components/admin/admin-shell.tsx`
- `components/admin/admin-dashboard-client.tsx`

Admin capabilities today:

- view platform metrics
- inspect client users
- inspect plan status
- inspect total links, clicks, reviews, revenue estimates
- manually add a client to an existing owner
- manually grant or revoke subscription access

### Marketing and legal

Routes:

- `/`
- `/terms-and-conditions`
- `/privacy-policy`
- `/refunds-and-cancellations`
- `/shipping-and-delivery`
- `/contact-us`

These pages matter for payment compliance and website whitelisting.

## Environment Variables

Current expected env vars from `.env.example`:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | signs session JWT cookie |
| `OPENAI_API_KEY` | OpenAI integration |
| `OPENAI_MODEL` | OpenAI model override |
| `NEXT_PUBLIC_APP_URL` | public app base URL, also used in payment return handling |
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `ADMIN_EMAILS` | comma-separated admin override emails |
| `CASHFREE_ENVIRONMENT` | `sandbox` or `production` |
| `CASHFREE_APP_ID` | Cashfree API client id |
| `CASHFREE_SECRET_KEY` | Cashfree API secret |
| `CASHFREE_WEBHOOK_SECRET` | Cashfree webhook verification secret |

## Important Invariants and Gotchas

Keep these in mind before changing anything:

- Internal subscription ids stay `tier_1`, `tier_2`, `tier_3` even if UI naming changes.
- Admin and client panels are intentionally separate products with separate protected entry points.
- `ADMIN_EMAILS` can promote a normal user into admin behavior even if the stored role is not updated.
- Public review pages depend on both client expiry and owner subscription access.
- Subscription access is more permissive than raw active status because cancelled users can remain valid until paid period end.
- Billing upgrade flows should not wipe current access during pending checkout.
- Cashfree webhook handling is the long-term truth source; the return page is only a user-facing confirmation bridge.
- Webhook handlers must stay idempotent.
- `review_funnel_session` auth cookie and API auth responses are designed around no-store behavior to avoid stale login/logout UI.
- Phone validation for billing currently expects exactly 10 digits.
- AI regeneration replaces all existing review rows for that client.

## Where To Make Changes

### If you want to change pricing or plan names

Start in:

- `lib/billing.ts`
- `types/index.ts`
- any billing/admin UI that displays plan names

### If you want to change subscription rules

Start in:

- `lib/billing.ts`
- `lib/services/billing-service.ts`
- `app/api/billing/webhook/route.ts`
- `app/(dashboard)/dashboard/billing/confirm/page.tsx`

### If you want to change auth

Start in:

- `lib/auth.ts`
- `lib/auth-redirect.ts`
- `middleware.ts`
- `app/api/auth/**`

### If you want to change public review behavior

Start in:

- `lib/services/client-service.ts`
- `lib/services/review-service.ts`
- `components/reviews/**`
- `app/review/[slug]/page.tsx`

### If you want to change AI review generation

Start in:

- `lib/services/ai-service.ts`
- `lib/services/review-service.ts`

### If you want to change admin metrics or manual controls

Start in:

- `lib/services/admin-service.ts`
- `components/admin/admin-dashboard-client.tsx`
- `app/api/admin/**`

## Suggested Improvement Backlog

These are the highest-leverage areas for future work:

1. Add explicit server-side enforcement for per-link review capacity if product rules require hard limits.
2. Add richer billing audit trails beyond webhook idempotency storage.
3. Add automated tests around auth redirects, billing state transitions, and public link expiry rules.
4. Move repeated JSON response patterns into small shared helpers.
5. Add stronger admin authorization beyond email allowlisting if the product grows.
6. Improve observability for webhook failures, payment mismatches, and AI generation errors.
7. Add real pagination and filtering to the admin panel once user count grows.
8. Consider background job handling for AI generation and webhook reconciliation if traffic increases.

## Quick Mental Model

If you only remember one thing, remember this:

- users own subscription state,
- clients are review-link records owned by users,
- reviews belong to clients,
- admins can override user plans,
- public review pages are valid only while both the client link and the owner subscription window are valid,
- Cashfree owns billing truth,
- MongoDB is the app state source of record,
- OpenAI only generates review content, not billing or access decisions.
