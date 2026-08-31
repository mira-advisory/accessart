# AccessArt — Product & Architecture Decisions

Decisions made by Ben, captured as they're settled. Newest additions at the bottom of each section.
Last updated: 2026-08-30.

## What AccessArt is

**A social media company for artists: get people to SEE their art, then RENT it, then BUY it.**

- Multi-sided marketplace: **artists**, **consumers**, **cafés/venues** (hang the art), **art tours/trails** (the physical discovery layer across venues).
- The funnel: **see → rent → (swap ↔ swap) → buy**. Rent is the *ongoing state*, not a trial:
  - **Swap** — rotate to a different piece while staying on pay-as-you-go. The retention loop; no lock-in to resent.
  - **Buy** — rental credit rolls into the purchase price.
- **Pay-as-you-go**, no lock-in subscriptions.
- Pricing psychology: **it should feel like they aren't paying.** Small weekly amounts on a card on file (Spotify mental model), swaps included, rent accrues as credit toward ownership. Artists list free; money only flows *to* artists.
- Positioning vs Bluethumb: Bluethumb proves AU online original-art demand but is **too rigid** — buy-only, fixed 38.5% all-in commission, transactional not social, online-only. AccessArt is flexible on every one of those axes. Copy their community-first artist-acquisition tone, contrast everything else.
- Social media is a **first-class pillar**, not a marketing bolt-on: artist onboarding from their existing social presence, share cards, per-artwork link-in-bio pages, venue UGC loops (QR on the wall → artist page).
- Venues are load-bearing for logistics too: pickup, drop-off and **swap nodes** (return to the café, take the next piece home) — the lever that breaks the two-way courier cost curve that kills rental businesses.

## Experience principles

**Artists must feel like they belong; buyers/renters must feel like it's easy.** (Ben, 2026-08-30.) These deliberately pull opposite directions — resolve it the way Instagram does: expressive profiles, uniform commerce.

- **Artist side — expressive, customisable, theirs:** own handle/page (`accessart.net/@artist`) good enough to be their bio link; customisable banner/story/arrangement/accent styling *within a design system*; artist story attached to every artwork (2019 validation: buyers connect to the story); belonging signals — followers, features, photos of their work hanging in real venues, presence on trail maps.
- **Buyer side — opinionated, frictionless, uniform:** no decisions requiring art knowledge; browse feed → tap rent → one clear price; card on file; one-tap swap; purchase credit accrues visibly but automatically; commissions/custody/insurance/payouts invisible backstage. Commerce components (artwork card, price, rent/buy/swap actions) are identical everywhere regardless of how expressive the surrounding artist page is — consistency is what "easy" feels like.

## Brand & landing page (Ben, 2026-08-30)

**Tone: ironic, anti-corporate, subtle but cool — for cool people.** Bluethumb is corporate — AccessArt is the opposite pole. **Aesthetic: post-grunge but grunge** (Ben, 2026-08-30): zine/gig-poster energy — dirty paper + ink black, one loud accent, brutal condensed caps against ironic serif italics, tape/stamps/noise textures — executed with modern typographic restraint so it reads *post*-grunge, not mess. **The angle is walls and canvas** (Ben, 2026-08-30): the whole marketplace collapses into one binary — you either have art or you have walls. A home wall and a café wall are the same door. The landing page is *literally only* this choice, full-screen:

> **ooohhh, i have art.** &nbsp;/&nbsp; **walls.**

(The long setup on the first door, then the deadpan single word — that's the joke, and it's the landing. Hovering a door floods it in colour and reveals "the deal." text — hover is the explanation-on-demand, and **nothing else appears on hover: no symbols, no arrows, no graphics** (Ben). The black triangle sits left-justified on the invisible seam between the doors, clean — no line, no box. The "not a gallery." line lives in the deal copy, not as a stamp.)

**Wordmark: the triangle means access** (Ben, 2026-08-30). The logo is just **▲art** — a straight black triangle, then lowercase "art". No spelled-out "access". The company/domain stays AccessArt / accessart.net; the mark is ▲art.

- Dry wit, lowercase confidence, generous whitespace; the art is the hero, the chrome disappears.
- Never corporate-speak: no "empowering creators", no stock photos, no gradients-and-jargon. "Not a gallery" (straight from the 2019 pitch) is on-brand.
- Subtle > loud: the coolness is in restraint — one good line beats three paragraphs.
- On-target: every line maps to the funnel (see → rent → swap → buy) or a side (artist/buyer/venue).

## Domain

**accessart.net** (purchased 2026-08-30). Subdomain plan mirrors PlanEase:

| Subdomain | Role |
|---|---|
| `accessart.net` | public marketing + marketplace browse |
| `app.accessart.net` | logged-in app (all sides, incl. admin module) |
| `api.accessart.net` / `staging-api.accessart.net` | the single API |
| `auth.accessart.net` | Cognito hosted UI |

## Architecture

Follow the **PlanEase pattern** (see `planease` / `planease-crm` repos), with deliberate deviations noted.

1. **One repo.** Frontend + backend + buildguide together. **No separate CRM repo** — unlike planease-crm, the admin/CRM is a role-gated module inside the same app, same API, same deploy. No token handoff, no second gateway.
2. **Single code-based API.** One API Gateway HTTP API with a catch-all route → one `accessart-api` Lambda (plain Node ESM, no framework), all routes dispatched in code (the planease-crm `app.mjs` pattern). Adding a route is a code edit, never gateway config. Split into group Lambdas only if/when scale demands it.
3. **Multi-tenant by roles and markets, operator-controlled:**
   - **Roles, not apps.** One user record with a roles set: `buyer`, `artist`, `venue`, `operator`. A person can hold several. Admin module unlocks for `operator` (Ben). Authz decided by a role table in the identity layer (planease-crm `identity.mjs` pattern), not JWT groups.
   - **Markets as data, not code.** A `markets` table; SEQ/Brisbane is the first row. Artworks, venues, trails, feeds all belong to a market. New city/country = new row, zero code change. Amounts stored with currency code; timestamps UTC.
   - Discovery/feed partition keys include market so one hot city never bottlenecks others.
4. **Stack:** DynamoDB pay-per-request; Cognito (hosted UI, multi-pool-capable JWT authorizer); React + TS + Vite + Tailwind/shadcn + TanStack Query; one hand-written typed API client file; Amplify for frontend (`main` → prod, `staging` → staging); GitHub Actions OIDC deploys with version-publish + alias move, env-symmetry checks, smoke tests.
5. **Fix PlanEase's known flaws:** API Gateway routes go in **IaC** this time (trivial with one catch-all route + authorizer), and **every deployed Lambda must have source in the repo** — PlanEase ended up with two AWS-only Lambdas with no source on disk. Note: PlanEase's own April 2026 refactor consolidated 11 single-route Lambdas into fewer, fatter, self-routing ones — the code-routing pattern is the destination of that refactor, which is why AccessArt starts there (one Lambda) rather than migrating to it later.
6. **New pieces with no PlanEase precedent:** Stripe (consumer payments + **Stripe Connect payouts to artists and venues**) — shapes the ledger/data model early; QR codes per artwork/venue wall; geo/map features for trails.
7. **Logistics is deliberately deferred, and Ben is not the courier (Ben, 2026-08-30).** Logistics is acknowledged as massive but handled operationally over time — don't build it into v1. **Deliveries are done by third-party delivery agents** (gig platforms, courier partners, owner-drivers — eventually possibly an in-app `delivery_agent` role, making agents a fifth marketplace side), never by Ben and not by employees. The software models delivery as **status/custody fields** on a rental or swap (who holds the artwork, where it moves next, hand-over confirmed, proof-of-delivery photos) so any agent arrangement plugs in. No carrier integrations or rate engines until the operating model settles. References: `research/06-delivery-and-swap-logistics.md` (costs/packaging/insurance) and `research/08-delivery-agents.md` (who does the moving, agent onboarding, gig-platform law). **Not Uber** (Ben, 2026-08-30 — and research confirms Uber prohibits fragile items with a $100 value cap). Stage 1 agents: Airtasker / owner-driver vans (Little Green Truck, Handy Truck) / SEQ art-handler panel; batched trail-run vans at scale; legal advice required before any in-app `delivery_agent` job feed (gig-platform minimum-standards law commenced Aug 2026).

## The money loop (phase 1, settled 2026-08-31)

**Phase 1 scope: artists and people with walls.** Cafés, venues and trails are phase 2; nothing venue-shaped blocks the phase 1 build.

Numbers carried from Ben's ArtX financial model (the Excel in the OneDrive ArtX folder), adjusted by `research/10-finance-payments.md`:

- **Rent: 5% of artwork value per month.** Displayed as $/week (a $500 piece reads "$6/wk"), billed in 4-week blocks via Stripe Billing (weekly card charges lose ~5% to fixed fees; blocks also give clean swap boundaries).
- **Splits:** artist 50% of rent. Direct sales: 15% commission (artist keeps 85%). Rent-to-buy sales: 40% commission, which funds the credit; artist still nets roughly 75% of value all-in on a converted sale. The 40% must be stated plainly in artist terms so it never reads as a gotcha (open: Ben to confirm final wording).
- **Credit, option B (Ben):** rent counts 100% toward buying the piece currently on your wall, capped at 50% of its price. On swap, accrued credit converts at 50% into a portable **art fund**, spendable on any future purchase, same 50% cap at application, 24-month shelf life. Framed as a conditional discount, never stored value (keeps us outside escrow regulation; one legal sign-off required before launch).
- **Swap:** free, included; rate changes to the new piece's rate at the next 4-week block.
- **Risk:** no bonds (they kill "feels like they aren't paying"). Damage waiver funded from the platform's rent share, condition photos at every custody hand-over, brokered fine-art cover behind it.
- **Floors:** min artwork value $100, min rentable piece $250 (research argued $500; holding at $250 for phase 1 home-wall logistics and watching the unit economics).
- **Working assumption:** ~33% of rentals convert to sales (Ben's model).
- **Artist onboarding must capture an ABN or a signed Statement by a supplier** (hobbyist form), or 47% withholding applies. Rental earnings are reportable under the sharing economy reporting regime (lodgments Jan 31 / Jul 31); sales are not.

## Platforms & mobile (Ben, 2026-08-30)

Native iPhone **and** Android apps plus web — artist "easy upload" demands native camera/roll access.

1. **Expo (React Native), one codebase for both stores.** Same React+TS mental model as everything else; real native apps, not wrappers. Lives in `mobile/` in this repo.
2. **EAS Build + EAS Submit** — iOS builds happen in Expo's cloud, so no Mac is needed; TestFlight for betas; **EAS Update** for over-the-air JS updates without store review. Accounts needed: Apple Developer Program (US$99/yr), Google Play Console (US$25 once).
3. **Apple IAP does not apply**: art sales/rentals are physical goods & services — Apple requires external payment (Stripe) for those, like Uber/Etsy. Never sell digital-only perks in-app or IAP rules trigger.
4. **Web stays React + Vite** (`web/`): marketing, browse/marketplace, and the admin module (admin is web-only).
5. All surfaces consume the same single code-based API with the same typed contract; the artist upload flow is mobile-first (camera → S3 presigned upload → draft artwork → story + price → live).

## Research

Market research lives in [research/](research/) — global market, competitors, rental economics, Australian market, venues/trails, delivery & swap logistics, social media. See its README (index) once all docs land.
