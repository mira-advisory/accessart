# AccessArt — House Rules

AccessArt (accessart.net) is a social-media-shaped, multi-sided art marketplace: artists get seen (feeds online, café walls and art trails physically), consumers **rent** art pay-as-you-go, **swap** whenever, and **buy** what they love. Read [buildguide/decisions.md](buildguide/decisions.md) for the product and architecture decisions, and [buildguide/research/README.md](buildguide/research/README.md) for the market evidence. The architecture deliberately follows the PlanEase pattern (see the `planease` / `planease-crm` repos) with its known flaws fixed.

## Repo layout

```
backend/functions/accessart-api/   THE Lambda — index.mjs, app.mjs, routes/, stores/, shared/
web/                               React + Vite + TS — marketing, marketplace, admin module
mobile/                            Expo (React Native) — iOS + Android apps
infra/                             IaC for API Gateway, authorizer, tables (nothing console-only)
buildguide/                        decisions, architecture, research — the spec of record
```

## Rules

0. **HARD RULE — everything is prefixed `aa`.** Every named AWS resource belonging to this project takes the `aa` prefix: the Lambda is `aa-api`, tables are `aa_*` (`aa_waitlist`, `aa_staging_waitlist`), buckets/queues/log groups `aa-*`. The API's domain is `api.accessart.net`. Never create an unprefixed resource. Two documented exceptions only: the CloudFormation stack is named `accessart`, and its auto-generated IAM roles start `accessart-*` — because the `accessart-iam` deploy grant on the `claude-code` user is scoped to `role/accessart-*` (do not "fix" this without also changing that policy in the console).
1. **Single code-based API.** Every route is dispatched in code in `backend/functions/accessart-api/app.mjs`. Adding a route NEVER means editing API Gateway — the gateway has one catch-all `ANY /{proxy+}` route defined in `infra/`. Public routes resolve above identity resolution; authed routes below.
2. **API response shapes are immutable once shipped.** Envelopes: `{ ok, data }` for items, `{ ok, items, next_key }` for lists, `{ ok:false, error, message }` for errors. Frontends hand-mirror types; breaking a shape breaks three surfaces at once.
3. **Everything deployed has source here.** A folder is a deployable Lambda only if it contains `config.json`. No console-only Lambdas, no console-only gateway routes (both happened in PlanEase; neither happens here).
4. **Multi-tenant invariants.** Roles, not apps: one user record with a roles set (`buyer`, `artist`, `venue`, `operator`); admin is a role-gated module, not a separate product. Markets as data: nothing geographic is hardcoded — artworks, venues, trails and feeds belong to a `markets` row; a new city is an insert, not a deploy. Money always carries a currency code; timestamps are UTC.
5. **Experience principles.** Artist surfaces are expressive and customisable within the design system (their page is *theirs*); commerce components (artwork card, price, rent/buy/swap actions) are identical everywhere. Never let customisation touch commerce components.
6. **Logistics is custody, not carriers.** Rentals/swaps track custody and hand-over status fields only. No carrier integrations or rate engines (decisions.md #7).
7. **Payments are physical-goods only.** Stripe (+ Stripe Connect payouts to artists/venues). Never introduce a digital-only purchasable in the mobile apps — it would trigger Apple IAP.
8. **Frontends never `fetch` directly.** Each surface has one hand-written typed API client file; components consume it via TanStack Query hooks.
9. **Secrets never in the repo** — not in `config.json`, not in `.env` committed files. Lambda env blocks in `config.json` are non-secret config only; secrets are set in the console and enumerated by key name.
10. **Prod/staging parity.** Staging twins for tables and stages; env keys must stay symmetric between stages (checked in CI once deploys exist).

## Working style

- Plain Node ESM `.mjs` in the backend, no framework. React + TS everywhere else.
- TypeScript must compile clean before pushing web/mobile changes.
- Buildguide docs are the spec of record; update them when decisions change, in the same commit as the change.
