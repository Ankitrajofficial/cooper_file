# AI Review Funnel System for Google Business Profiles

A production-ready SaaS starter built with Next.js App Router, Tailwind CSS, MongoDB, Mongoose, session-based auth, and the OpenAI API.

## Setup

1. Copy `.env.example` to `.env`.
2. Add your MongoDB connection string, `JWT_SECRET`, and `OPENAI_API_KEY`.
3. To enable Google signup/login, also add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. In Google Cloud Console, add the app domain and set the authorized redirect URI to `/api/auth/google/callback`.
5. Install dependencies with `npm install`.
6. Run the dev server with `npm run dev`.

## File Structure

```text
.
|-- app
|   |-- (auth)
|   |   |-- login/page.tsx
|   |   `-- signup/page.tsx
|   |-- (dashboard)
|   |   `-- dashboard
|   |       |-- clients
|   |       |   |-- [clientId]/page.tsx
|   |       |   `-- new/page.tsx
|   |       |-- layout.tsx
|   |       `-- page.tsx
|   |-- api
|   |   |-- auth
|   |   |   |-- login/route.ts
|   |   |   |-- logout/route.ts
|   |   |   |-- google/route.ts
|   |   |   |-- google/callback/route.ts
|   |   |   `-- signup/route.ts
|   |   |-- clients
|   |   |   |-- [clientId]
|   |   |   |   |-- generate-reviews/route.ts
|   |   |   |   `-- route.ts
|   |   |   `-- route.ts
|   |   `-- review
|   |       `-- [slug]/click/route.ts
|   |-- review/[slug]/page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   |-- not-found.tsx
|   `-- page.tsx
|-- components
|   |-- auth/auth-form.tsx
|   |-- clients/client-form.tsx
|   |-- dashboard
|   |   |-- client-card.tsx
|   |   |-- dashboard-shell.tsx
|   |   `-- logout-button.tsx
|   |-- reviews
|   |   |-- public-review-board.tsx
|   |   `-- review-card.tsx
|   `-- ui
|       |-- badge.tsx
|       |-- button.tsx
|       |-- input.tsx
|       `-- textarea.tsx
|-- lib
|   |-- services
|   |   |-- ai-service.ts
|   |   |-- client-service.ts
|   |   `-- review-service.ts
|   |-- auth.ts
|   |-- db.ts
|   |-- google-auth.ts
|   |-- utils.ts
|   `-- validators.ts
|-- models
|   |-- Client.ts
|   |-- Review.ts
|   `-- User.ts
|-- types/index.ts
|-- middleware.ts
`-- package.json
```

## Major Files

- `app/(dashboard)/dashboard/page.tsx`
  - Main authenticated dashboard with analytics cards and client listing.
- `app/review/[slug]/page.tsx`
  - Public-facing review funnel page that groups reviews by category.
- `app/api/clients/[clientId]/generate-reviews/route.ts`
  - Secure AI generation endpoint for client-specific review scripts.
- `lib/services/ai-service.ts`
  - OpenAI integration for structured review generation.
- `lib/services/client-service.ts`
  - Business logic for CRUD, slug generation, analytics, and public page lookup.
- `lib/auth.ts`
  - JWT session helpers for cookies, route protection, and authenticated pages.
- `models/*.ts`
  - Mongoose schemas for `User`, `Client`, and `Review`.

## Feature Coverage

- Email/password signup and login
- Google signup/login with secure OAuth callback handling
- Session-based auth using signed JWT cookies
- Multi-client dashboard with create, edit, delete
- Public slug-based review pages
- Categorized review scripts with copy + open Google action
- AI-generated review batches with local SEO prompts
- Starter review templates for new clients
- Click analytics via outbound review tracking
