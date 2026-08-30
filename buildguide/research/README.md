# AccessArt Market Research

Research base for AccessArt — a social-media-shaped, multi-sided art marketplace: artists get seen (online feeds + café walls + art trails), consumers **rent** art pay-as-you-go, **swap** it whenever, and **buy** what they love. Compiled 2026-08-30 by parallel research agents; every document carries inline citations and flags unverifiable or stale data. Product/architecture decisions live in [../decisions.md](../decisions.md).

## Documents

| Doc | Covers | One-line takeaway |
|---|---|---|
| [01 Global art market](01-global-art-market.md) | Market size, online share, price tiers, buyer behaviour | Volume growth lives in AccessArt's sub-$5k tier; 51% of collectors have bought via Instagram sight-unseen |
| [02 Competitors & marketplaces](02-competitors-marketplaces.md) | AU + global platforms, fees, who died and why | Fees have inflated everywhere (Bluethumb 38.5%, Saatchi 40%); consumer art rental is an empty cell in Australia |
| [03 Rental & subscription models](03-rental-subscription-models.md) | Rental pricing, rent-to-own mechanics, AU tax, unit economics | Global convergence on 3–7% of value/month; rent credit toward purchase is the standard conversion mechanic |
| [04 Australian market, artists & consumers](04-australian-market-artists-consumers.md) | Artist supply, consumer demand, SEQ, TAM inputs | 47k artists averaging $23k creative income meet record arts demand where 60% cite cost as the barrier |
| [05 Venues, cafés & art tours](05-venues-cafes-art-tours.md) | Café-art deal structures, trails, events, office placements | The model is proven overseas (Artwalls: QR→Stripe off café walls) and unserved in Australia |
| [06 Delivery & swap logistics](06-delivery-and-swap-logistics.md) | Couriers, packaging, insurance, node-based alternatives | Courier costs kill rental margins; venues-as-swap-nodes is the lever (no AU parcel locker fits a canvas) |
| [07 Social media & art](07-social-media-and-art.md) | Platform mechanics, APIs, playbooks, physical-to-social loops | Social checkout is dead in AU — the winning shape is "reach on social, convert on owned artwork pages" |

## Synthesis — what the research says about the model

### The opportunity

The global market rebounded to US$59.6bn in 2025, but the story for AccessArt is composition, not headline: sub-US$5k lots grew +7% value / +13% volume in 2024 while every higher tier fell, sub-US$50k works are now 61% of US lots sold, and ~40% of online sales go to first-time buyers (01). In Australia, record engagement (74% attended live arts events, the highest since 2009) collides with cost as the #1 barrier (60%) — exactly the barrier pay-as-you-go rental removes (04). Meanwhile the artist side is desperate for income and exposure: 47,100 practising professional artists average $23,200/yr from creative work, half under $10k, and commercial galleries have been closing in waves (04). Two-sided motivation, verified.

### SEE — the social + venue discovery layer

Demand behaviour already lives on social: 51% of collectors have bought via Instagram sight-unseen, up from 41% in 2023 (01, 07). But the platforms have withdrawn from commerce — Meta wound down native Instagram/Facebook checkout by Aug 2025 and TikTok Shop hasn't launched domestically in Australia — so artists have reach with no storefront. AccessArt is the missing back half of the funnel: **reach on social, convert on owned per-artwork pages** (07). Build order for integrations: OG share cards and native share sheets first (no platform approval needed); "Instagram API with Instagram Login" portfolio import later (Professional accounts only, rate-limited, 2–4 week Meta review; Basic Display API is dead) (07).

The physical layer is the analog of the same loop: QR label on a café wall → artwork page → rent/buy, with the venue's foot traffic as free impressions. Proven by Artwalls (San Diego): artist 60–85%, venue 15%, platform ≤2%, free for venues — live today, absent in Australia (05). Events multiply it: sales cluster around organised art-walk nights, not passive display (First Friday model), SEQ councils already fund trail platforms (SEQ Food Trails, 13 councils), and Brisbane Street Art Festival's 80.6M impressions — now on hold — leaves a local vacuum (05, 07). Content playbook: process/timelapse Reels out-reach finished-work photos by ~125%; SEQ décor/café micro-influencers over macro accounts; Pinterest is the under-used high-intent channel for wall art (07).

### RENT — the conversion

Consumer art rental from emerging artists is an **empty cell** in the Australian market — only government Artbank ($165–$11k/yr/work, corporate-skewed) and two legacy corporate-rental galleries exist (02). Working pricing templates: 3–7% of artwork value per month (Moving Canvas in Brisbane publishes 3–5%; Rise Art UK 3–7%), or Curina's flat tiers (US$38/$88/$148/mo, 3-month minimum) — flat tiers fit the "feels like they aren't paying" principle best (02, 03). Floor rules from the economics: works ≥ ~$500 value, 3-month minimum terms, flat delivery fee if couriered, damage-waiver fee backed by brokered fine-art cover (~0.3–1.5% ad valorem; mainstream couriers explicitly exclude artwork from damage cover) (03, 06). The B2B flank is a verified tax sell: leased art on business premises is deductible (ATO IT 2215) and the $20k instant asset write-off is law for FY2025–26 (03).

### SWAP — the retention loop, and why venues carry it

Swap keeps renters renting without lock-in — but every swap is two artwork movements, and per-movement courier reality is brutal: ~$30–60 packed via general carriers (uninsured for art) or $200–300 via art services; Rent the Runway's fulfilment eats 24–31% of revenue; Sendle collapsed in Jan 2026 (03, 06). The structural answer: **no parcel locker in Australia fits a framed canvas — participating cafés are the locker network**. Zero-courier node loops (artist drops at venue, renter collects, swaps happen at venues) take marginal swap cost to ~$0 and feed venues guaranteed visits — 59% of people collecting a parcel in a host store buy something (06). Logistics beyond this is deliberately an operating problem solved over time, not v1 software ([decisions.md](../decisions.md) #7).

### BUY — the exit event

Rent-to-own credit is the universal mechanic: Rise Art credits 100% of month 1 + 50% thereafter; Curina credits 100% (02, 03). No art platform publishes conversion rates; US rent-to-own retail (~70% eventually purchased) is the optimistic upper bound (03). AR "view in my room" drove 4× conversion at Saatchi — worth shipping early (01).

### Deal structures the research supports

- **Artists:** free to list; keep 60–75%+ — genuinely disruptive against Bluethumb 38.5% all-in, Saatchi 40%, Artfinder 40–45%+fees, Singulart ~50% (02, 05). Artists earn on rotation velocity (every swap starts a new rental), not just sales.
- **Venues:** free to join; 10–15% of sales off their wall; platform handles rotation, invoicing, damage policy; rails/QR fit-out cheap (STAS rails $54–71, AU distributor in Eumundi QLD) (05, 06).
- **Consumers:** pay-as-you-go weekly amounts, card on file, swaps included, credit accrues toward purchase — money never feels spent.
- **Platform:** commission on rentals/sales + service margins; corporate/office placements as revenue ballast against ~12%/yr café churn (05).

### Risks the record warns about

1. **Demand-side death, not supply-side** — art startups (TWYLA, Paddle8, Vango) died of buyer scarcity and burn, never artist scarcity (02). Instagram's collapsed organic reach guarantees artist supply; buyers are the hard side. Subsidise and measure demand first.
2. **Venue churn** — Café Art London's café arm collapsed when COVID closed partner venues; breadth + office ballast is the hedge (05).
3. **Logistics creep** — every courier-dependent flow bleeds margin; keep the node loops primary (06).
4. **Capital-heavy adjacencies** — Art Money (BNPL for art) halted lending for lack of capital; don't finance purchases off the platform's balance sheet (02).
5. **Top-end reversal** — 2025 growth tilted back to the $10m+ tier; the volume thesis holds but isn't monotonic (01).

### Numbers for the financial model

SEQ: ~1.55–1.6M households, Brisbane median household income ~$96k, 35.1% renters, region growing to 4.5M by the 2032 Olympics (04). Art-buying propensity: no current AU stat exists — model 2–5% as the assumption range and validate with a primary SEQ survey (04). Rental price: 3–7% of value/month or flat tiers; artist share 60–75%; venue share 10–15% of wall sales; fine-art cover 0.3–1.5% of value; fit-out ~$60/rail, cartons $4.75, pro hanging $50–120/work (03, 05, 06).

### Open gaps

- No current Australian art-buying-propensity statistic — primary SEQ survey recommended (04).
- No art platform publishes rental→purchase conversion — instrument this from day one; none publishes social-attribution revenue either — same (02, 07).
- Unverified items are flagged inline in each doc (e.g. Bluethumb's "30,000 artists" claim, Art Money's current status, foot-traffic blog stats).
