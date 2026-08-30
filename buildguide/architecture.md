# AccessArt Architecture

The build shape. Decisions and their rationale live in [decisions.md](decisions.md); this doc is the technical map. Follows the PlanEase pattern (single code-based API, plain ESM Lambdas, DynamoDB, Cognito, typed one-file clients) with its two known drift flaws fixed: gateway in IaC, all deployed source in-repo.

## Surfaces

| Surface | Tech | Audience |
|---|---|---|
| `web/` | React 18 + TS + Vite + Tailwind + TanStack Query | Marketing pages, marketplace browse, buyer flows, artist desktop tools, **admin module** (operator role only) |
| `mobile/` | Expo (React Native, TS), EAS Build/Submit/Update | iOS + Android. Artist-first (easy upload: camera → S3 → draft → story + price → live), full buyer rent/swap/buy flows |
| `backend/functions/accessart-api/` | Node ESM Lambda, no framework | The single API behind `api.accessart.net` |

All surfaces consume the same API with the same envelope contract and a hand-written typed client per surface (`web/src/api/client.ts`, `mobile/src/api/client.ts`) — kept in sync by hand, shapes immutable once shipped (CLAUDE.md rule 2).

## Request flow

```
app.accessart.net / iOS / Android
        │  Bearer JWT (Cognito)
        ▼
API Gateway HTTP API — ONE catch-all route: ANY /{proxy+}  (defined in infra/)
        │  REQUEST Lambda authorizer (JWT verify, multi-pool by iss claim)
        ▼
accessart-api Lambda
  index.mjs  → app.mjs (code router: ordered path checks; public above identity, authed below)
  ctx = { event, method, path, qs, body, user }
  routes/*.mjs → stores/*.mjs (DynamoDB DocumentClient) 
```

Stage model (PlanEase pattern): one set of Lambdas with `:prod` / `:staging` aliases; gateway `$default` stage → `api.accessart.net`, `staging` stage → `staging-api.accessart.net`, stage var `lambdaAlias`. Remember the HTTP API v2 gotcha: non-default stages prefix `rawPath` with `/staging` — `shared/http.mjs#getPath` strips it.

## Auth & roles

- Cognito user pool(s), hosted UI at `auth.accessart.net`, social sign-in providers (Google/Apple required for the mobile apps; Apple Sign-In is mandatory when offering social login on iOS).
- The JWT proves identity only. **Authorization is a data question**: `users` row carries a roles set — `buyer`, `artist`, `venue`, `operator` (future: `delivery_agent`) — resolved in `shared/identity.mjs` per request (planease-crm pattern). Admin module unlocks for `operator`.
- One person can hold many roles (an artist who rents others' work and owns a café is one user).

## Data model (starting sketch — refine before first deploy)

DynamoDB pay-per-request, staging twins (`staging_*`). Table names via `config.json` env vars. Everything belongs to a **market**; feed/discovery keys are market-partitioned so one hot city never bottlenecks others.

| Table | Keys (sketch) | Holds |
|---|---|---|
| `markets` | `market_id` | Cities/regions as data. Row 1: SEQ/Brisbane. Currency, timezone, launch state |
| `users` | `user_id` (GSI: email, handle) | Person + roles set + artist profile config (handle, banner, accent, section order) |
| `artworks` | `artwork_id` (GSI: `artist_id`, `market_id#status`) | The piece: images, story, dimensions, price, rent price, status, current custody |
| `posts` | `post_id` (GSI: `artist_id`, `market_id#created`) | Social layer: artist posts/process content; feeds read market partition |
| `follows` | `follower_id` + `artist_id` | Social graph |
| `venues` | `venue_id` (GSI: `market_id`) | Café/office walls: capacity, location, deal terms, QR slugs |
| `placements` | `venue_id` + `artwork_id` | What hangs where, since when — the physical layer |
| `rentals` | `rental_id` (GSI: `renter_id`, `artwork_id`) | The pay-as-you-go state machine: custody/status fields only (no carrier data), swap events append, credit ledger toward purchase |
| `orders` | `order_id` | Purchases (incl. rent-to-own conversions), Stripe refs |
| `payouts` | `payout_id` (GSI: `payee_id`) | Artist/venue earnings ledger → Stripe Connect transfers |
| `trails` | `trail_id` (GSI: `market_id`) | Ordered venue routes, art-walk events |

Money fields are `{ amount_cents, currency }`. Timestamps UTC ISO-8601.

## Payments

Stripe: consumer card-on-file with weekly/periodic pay-as-you-go rental charges; Stripe Connect (Express) accounts for artist and venue payouts. The `payouts` ledger is the source of truth; Stripe transfers reconcile against it. Physical goods/services only — no Apple IAP exposure.

## Media

Artist uploads go device → S3 direct via presigned URLs issued by the API (`POST /uploads/presign`), then a draft `artworks`/`posts` row references the keys. Image variants (feed, card, zoom, OG share card) generated async. OG share-card rendering per artwork page is a launch feature (social pillar: reach on social, convert on owned pages).

## Deploy

- **Frontend web**: Amplify, `main` → prod, `staging` branch → staging.
- **Mobile**: EAS Build (cloud iOS/Android builds — no Mac), EAS Submit to stores, EAS Update for OTA JS updates, TestFlight/internal track for betas.
- **Backend**: GitHub Actions OIDC (no static keys): zip → `update-function-code` → merge `config.json` env over console secrets → `publish-version` → move alias → smoke test. Env-symmetry check between prod/staging blocks in CI.
- **Infra**: API Gateway, authorizer wiring, and table definitions in `infra/` (IaC — the PlanEase gap, closed). Nothing exists only in the console.

## Build order (v1)

1. Backend skeleton + health route + infra template + deploy pipeline (walking skeleton to staging).
2. Auth (Cognito + identity layer + roles) and `users`/`markets`.
3. Artist upload flow end-to-end (mobile camera → S3 → draft → publish) + artist page on web (`/@handle`).
4. Feed + follows (the SEE layer) + per-artwork pages with OG share cards.
5. Rent (Stripe card-on-file, custody states) → swap → buy with credit ledger.
6. Venues + placements + QR slugs; trails; admin module throughout as views over the same API.
