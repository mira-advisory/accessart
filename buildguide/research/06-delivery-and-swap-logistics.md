# 06 — Delivery & Swap Logistics for AccessArt

*Research date: 30 August 2026. Market: South East Queensland (Brisbane / Gold Coast / Sunshine Coast). All prices AUD unless noted.*

## Executive summary

Delivery is the single line item most likely to kill AccessArt's unit economics — and the single biggest opportunity to differentiate. Point-to-point courier movement of a ~60×90cm framed canvas costs roughly $30–$60 by general parcel carrier within Queensland (using published proxies), $200–$300 door-to-door via Pack & Send's art service, and quote-only (typically hundreds of dollars) via specialist fine-art shuttles like IAS or Grace — against artworks that may rent for $10–$30/week. Worse, mainstream carriers (CouriersPlease, Zoom2u and peers) *explicitly exclude artwork and glass-framed pieces from damage cover*, and the market shifted under everyone's feet in January 2026 when Sendle — the default cheap oversize-flat-parcel option — abruptly ceased operations and entered liquidation. The strategic conclusion is that AccessArt should not build on couriers at all for its core loops: the café/venue network the marketplace already requires is itself a free, insured-premises, human-staffed node network — the equivalent of a parcel-locker system that (unlike Australia Post's actual lockers, capped at 35×44×61cm) can physically hold a framed canvas. Launch with artist-drops / buyer-collects / swap-at-venue as the default, sell courier and pro-hanging as paid add-ons, and keep marginal delivery cost near zero.

---

## 1. Courier options for artwork in Australia

### 1.1 Specialist fine-art logistics

- **IAS Fine Art Logistics** ([ias.au](https://ias.au/)) — Australia's largest fine-art logistics group; operates a **domestic art shuttle network linking Brisbane, Sydney, Canberra, Melbourne, Hobart, Adelaide, Darwin, North Queensland and Perth**, plus museum-grade storage in six cities including Brisbane, packing/crating and installation. Pricing is quote-only; no rate card is published. Built for galleries/museums — per-item costs are far above marketplace tolerance for sub-$1,000 works.
- **Grace Fine Art** ([grace.com.au/art-transportation](https://www.grace.com.au/art-transportation/), [grace.com.au/fine-art](https://www.grace.com.au/fine-art/)) — national art transport, packing, storage and installation for galleries, collectors and institutions. Quote-only.
- **King & Wilson Essential Art Services** ([art.kingandwilson.com.au/interstate-art-transport](https://art.kingandwilson.com.au/interstate-art-transport)) — regular interstate art shuttle runs (Brisbane, Perth, Adelaide, Hobart, Cairns, Townsville, Darwin, Alice Springs) and can arrange transit insurance with documentation ([insurance page](https://art.kingandwilson.com.au/insurance)). Quote-only.
- **Mobile Framing art couriers** ([mobileframing.com.au/art-couriers](https://mobileframing.com.au/art-couriers/)) and **TED Fine Art** ([tedfineart.com.au/art-transport](https://www.tedfineart.com.au/art-transport/)) — smaller operators doing door-to-door art runs including Sydney–Brisbane–Gold Coast corridors. Quote-only.
- **Pack & Send** ([Art & Antiques service](https://www.packsend.com.au/packing-solutions/art-antiques-packing/)) — the most relevant hybrid: 100+ retail service centres, custom art boxing/crating, and they accept the fragile/oversize jobs other carriers reject. Pack & Send's own guidance puts **domestic pack-and-ship of an artwork at roughly $200–$300 all-in, and $500–$700 international** ([canvas shipping guide](https://www.packsend.com.au/send/best-way-to-ship-canvas-painting/)). This is the realistic benchmark for "fully outsourced, fragile-safe, insured" movement of one painting.

**Verdict:** specialist art freight exists in SEQ but is priced for the gallery/museum market. It is a fallback for high-value works and interstate expansion, not a core mechanism.

### 1.2 General parcel carriers and marketplaces — with a major 2026 caveat

- **Sendle has ceased to exist.** On 11 January 2026 Sendle abruptly halted all bookings and ceased operations; it entered liquidation in February 2026 ([ABC News](https://www.abc.net.au/news/2026-01-23/australian-courier-tech-sendle-collapses/106237380), [ACS Information Age](https://ia.acs.org.au/article/2026/sendle-shuts-down-after-12-years---100m-in-funding.html)). Its historical same-city rates (from ~$4.55, oversize fee $22) are no longer available and any pre-2026 research citing Sendle as the cheap art-parcel option is obsolete. Do not build on it.
- **Australia Post** — accepts parcels up to **105cm max length, 22kg, 0.25m³** ([size & weight guidelines](https://auspost.com.au/business/shipping/guidelines/size-weight-guidelines)); a 60×90cm framed work fits dimensionally (90cm longest side), priced on the greater of actual vs cubic weight. AusPost publishes an [artwork-sending guide](https://auspost.com.au/business/business-ideas/selling-online/sending-artwork-by-post) but fragile cover for glass is effectively excluded under ordinary conditions, and larger works (>105cm) are rejected outright.
- **CouriersPlease** — still operating (now inside Freight Management Holdings, bought from SingPost by Pacific Equity Partners for $776m in March 2025 — [Business News Australia](https://www.businessnewsaustralia.com/articles/pacific-equity-partners-buys-freight-management-holdings-from-singpost-for--776m.html)), with ~2,200 collection points. **Critically, its warranty excludes artwork — explicitly including canvas artwork, framed pictures and anything containing glass** ([CouriersPlease FAQs](https://www.couriersplease.com.au/help-centre/faqs/undefined), [AUSFF fragile courier guide](https://www.ausff.com.au/best-courier-for-fragile-items/)). Cheap label ≠ covered risk.
- **Same-day gig couriers (Zoom2u, Sherpa, Go People)** — Zoom2u quotes Brisbane single deliveries at **$60 to $300+** and **explicitly prohibits fragile and valuable items including art and antiques** ([Zoom2u Brisbane](https://www.zoom2u.com.au/brisbane-express-courier/)). Sherpa and Go People operate in Brisbane with similar profiles. Usable only informally, uninsured.
- **Shippit** — not a carrier but a multi-carrier booking platform (from ~$19/month + carrier rates; [shippit.com](https://www.shippit.com/), [Capterra](https://www.capterra.com.au/software/159624/shippit)). Relevant later for label automation; GlamCorner runs its two-way rental logistics through it (§3).
- **uShip marketplace** — historic AU quote examples include **A$320 for one framed print, Potts Point (Sydney) → Brookfield (Brisbane)** ([uship.com.au art category](https://www.uship.com/au/cost-to-ship/antiques-and-special-care-items-7/art-113/)) — a useful, verifiable data point for what ad-hoc interstate art transport actually clears at.

### 1.3 What does a ~60×90cm framed canvas actually cost to move?

Almost no carrier publishes an "art parcel" rate, so the best public proxies:

- **Metro/intrastate (packed flat parcel, QLD):** Blue Horizon Prints — a QLD canvas printer that publishes its real shipping rate card — charges **$38 for a 61–90cm work within QLD** ($48 for 91–120cm, $65 for 121–152cm; interstate $42–$92 by size and state) ([bluehorizonprints.com.au/shipping-prices](https://www.bluehorizonprints.com.au/shipping-prices/)). Treat ~$30–$50 as the realistic wholesale metro cost for a professionally packed 60–90cm work, *excluding* packing labour and with no artwork insurance from the carrier.
- **Door-to-door with packing and fragile handling:** Pack & Send ~**$200–$300 domestic** per artwork (above).
- **Ad-hoc interstate, unpacked pickup:** ~**$300+** (uShip example above).
- **Oversize/fragile surcharges:** oversize penalty fees in the ~$22+ range were standard (Sendle's published penalty before collapse — [Sendle parcel size support](https://support.sendle.com/hc/en-au/articles/205230938-Sendle-parcel-sizes-and-weights-for-domestic-parcels)); glass/framed exclusions are near-universal, and claims can be refused for "insufficient packaging" even when cover nominally exists ([AUSFF guide](https://www.ausff.com.au/best-courier-for-fragile-items/)).

### 1.4 How Bluethumb (the AU benchmark marketplace) does it

Bluethumb — Australia's largest online art marketplace — is the model to study ([shipping policy](https://bluethumb.com.au/p/shipping), [shipping guide](https://docs.bluethumb.com.au/en/articles/4034617-how-does-shipping-work-with-bluethumb)):

- **Buyer sees one all-inclusive price**; "free shipping" Australia-wide is funded by a shipping allocation built into the listing price on top of the artist's price — the artist doesn't pay the courier.
- **Artists pack their own work** to Bluethumb's published standard (foam + bubble + rigid board/carton — [How to safely pack art](https://bluethumb.com.au/blog/artists/how-to-pack-art/)); Bluethumb books the freight.
- **Bluethumb insures all artworks in transit** and pays return postage on its 7-day free returns (fair-use capped at two free returns per six months) ([free returns policy](https://bluethumb.com.au/p/7-day-free-returns)).

Lesson for AccessArt: the platform absorbs freight variance and transit risk, hides it in price, and pushes packing labour to the artist. That works at Bluethumb's ~$1,000+ average order value; it cannot work for a $15/week rental with swaps — which is exactly why AccessArt needs the node model in §4.

---

## 2. Packaging: standards and costs

**Single-trip standard (Bluethumb-style, artist-executed):** rigid picture carton + bubble/foam + corner protectors + glass-taped X on any glazing. Verifiable component costs:

- **Picture/painting carton:** $4.75 + GST each (internal 1040×75×775mm — fits a 60×90 framed work), Cardboard Box Shop, Brisbane ([product page](https://www.cardboardboxshop.com.au/product/pic-picture-painting-carton/)); similar art boxes from [The Boxman](https://theboxman.com.au/product-category/shipping-boxes/art-shipping-boxes/) and [Custom Boxes](https://customboxes.net.au/art-logistic-boxes/).
- **Corner protectors & frame packaging:** stocked by [Frameshop](https://www.frameshop.com.au/product-cat-pod/packaging-materials/1766/) (per-unit prices in the low dollars; exact prices vary by size — not uniformly published).
- Realistic all-in consumables per single shipment: **~$15–$30** plus 20–40 minutes of labour. For a swap-heavy rental model this recurs every movement — the killer.
- **Timber crates** (Pack & Send custom, [Express Crates artwork crates](https://www.expresscrates.com.au/products/artwork-box-crates)) are quote-based, heavy, and only sensible for high-value or air-freight moves.

**Reusable transit cases — the circular-economy answer:** **ROKBOX** (UK) makes reusable art transit cases explicitly positioned against single-use packaging: purchase cost works out at **~£30/US$40 per use** over the case's life, and its **ROKBOX LOOP** network rents cases **from £235 (~A$480)** per rental period ([rok-box.com pricing](https://rok-box.com/products-pricing/), [rok-boxloop.com](https://rok-boxloop.com/)). There is **no Australian domestic equivalent operating a rental pool at marketplace price points** — a gap AccessArt can fill cheaply: commission padded, velcro-closing reusable art sleeves (analogous to fashion rental's reused garment bags — GlamCorner reuses packaging and moved to compostable satchels; [sustainability page](https://www.glamcorner.com.au/pages/sustainability)) sized to 2–3 standard formats, owned by the platform, and cycled venue-to-venue. At plausible custom-make cost (est. $40–$80/sleeve — estimate, not a public price) a sleeve amortises to under $1/movement across a rental year, versus $15–$30 of single-use consumables. Standardising AccessArt's listable sizes (e.g. A2, 60×90, 76×102) makes the sleeve pool viable — an argument for size constraints in the artist onboarding spec.

---

## 3. Two-way and circular logistics lessons from adjacent rentals

- **GlamCorner (AU fashion rental):** every outbound order ships with a **prepaid return satchel**; customer drops it at any Post Office/street posting box on the last rental day; GlamCorner "takes a double hit on shipping for every box" and books CouriersPlease/Toll/AusPost through Shippit ([Shippit case study](https://www.shippit.com/case-studies/glamcorner), [returns help](https://support.glamcorner.com.au/hc/en-us/articles/360001012971-How-do-I-return-my-one-time-rental)). Lessons: (a) reverse logistics must be *zero-decision* for the customer; (b) two-way freight is priced into the rental, so garments are light, flat and cheap to ship — a 60×90 canvas is not, which again argues against courier-based rental for art; (c) cleaning/QC happens centrally on every cycle — AccessArt's equivalent (condition check + photo) should happen at the venue node, not a warehouse.
- **Furniture rental (Valiant, CORT network):** delivery/installation and pickup are charged events; Valiant's "dry hire" requires the customer to collect in **a covered vehicle with suitable packaging**, with a dry-hire fee covering preparation and damage exposure ([valiant.com.au](https://valiant.com.au/)). Lesson: customer-collect with stated packaging conditions is an accepted commercial norm for bulky rentals.
- **Artbank (the closest art precedent):** the federal art-leasing program leases works at **$165–$5,500/year** with delivery and installation charged around the lease ([Artbank overview](https://en.wikipedia.org/wiki/Artbank)); commercial art-rental firms rotate corporate works every 3–12 months, with delivery either bundled or charged — one provider advertises delivery "as little as $30 each way", others quote by job ([Rental Art Australia](https://www.rentalart.com.au/our-service/), [Art Logic](https://artlogic.com.au/content/rent-original-sa-art-at-a-fraction-of-its-price), [Mitchell Fine Art Brisbane art rental](https://mitchellfineartgallery.com/collections/brisbane-art-rental)). Lesson: rotation-as-a-service already exists B2B in Brisbane; AccessArt's consumer twist is making the *customer* do the last mile via nodes.
- **Toy libraries (the purest node-swap system):** hundreds of AU toy libraries run circular borrowing with near-zero logistics cost because **members come to the node**, staffing is volunteer/membership-funded (e.g. 6 hours/year duty for basic tiers, premium tiers buy out the duty), and fees scale with usage ([Toy Libraries Australia](https://www.toylibraries.org.au/join-us), [PC circular-economy submission](https://www.pc.gov.au/__data/assets/pdf_file/0003/387561/sub130-circular-economy.pdf), [Bendigo Toy Library membership](https://bendigotoylibrary.org.au/membership/)). Lesson: a swap network's marginal delivery cost is zero when the *inventory sits at the node and the humans travel* — precisely AccessArt's café geometry.

---

## 4. The local-first / node-based alternative (key recommendation)

**Why parcel infrastructure can't do this job:** Australia Post's 1,500+ free 24/7 parcel lockers cap at **35×44×61cm and 16kg** ([AusPost parcel lockers](https://auspost.com.au/personal/receiving/parcel-deliveries/parcel-lockers)) — a framed 60×90 canvas physically does not fit any locker in the country. The over-the-counter alternative, **HUBBED/ParcelPoint** (2,000–2,500 locations in BP servos, newsagents, National Storage, Pack & Send — [hubbed.com/network](https://hubbed.com/network/), [parcelpoint.com.au](https://parcelpoint.com.au/)), proves the "staffed retail counter as parcel node" model works commercially: hosts earn a per-parcel commission (rates not public) and — the number that matters for café recruitment — **59% of surveyed shoppers made a purchase in the host store while collecting a parcel** ([HUBBED retailer revenue](https://hubbed.com/parcel-collection-networks-offer-retailers-additional-revenue/)). ThredUp's clean-out-kit model shows the same in reverse: aggregation nodes beat door-to-door for low-value circular goods.

**AccessArt's structural advantage:** the venue *is already* the node. The café where the work hangs is simultaneously showroom, warehouse, pickup counter, return point and swap floor — insured commercial premises, staffed 7 days, with foot traffic that benefits from every visit. Art-world precedent is thin but real: the standard café-exhibition model already has **artists delivering and hanging their own work, and venues taking a commission on sales** ([RedDotBlog on café shows](https://reddotblog.com/showing-your-art-in-cafes-restaurants-banks-and-other-venues-2/)); no one has yet formalised it as a logistics network — that's the white space.

**Cost/complexity comparison — moving one 60×90cm framed canvas within Brisbane metro:**

| Method | Metro cost (verifiable basis) | Who handles the work | Damage risk & cover | Fits swap flows? |
|---|---|---|---|---|
| Fine-art courier (IAS / Grace / K&W) | Quote-only; industry benchmark $200+ per move ([Pack & Send guide](https://www.packsend.com.au/send/best-way-to-ship-canvas-painting/)) | Professionals end-to-end | Lowest risk; insurable | No — cost ≫ rental value |
| Pack & Send art service | ~$200–$300 incl. packing ([source](https://www.packsend.com.au/send/best-way-to-ship-canvas-painting/)) | Retail counter + carrier | Managed; cover arrangeable | No — same problem |
| General carrier (AusPost / CouriersPlease) | ~$30–$60 packed (proxy: [Blue Horizon rate card](https://www.bluehorizonprints.com.au/shipping-prices/)) + $15–$30 packaging | Artist packs; platform books | **Artwork/glass excluded from cover** ([CouriersPlease](https://www.couriersplease.com.au/help-centre/faqs/undefined)) | Poorly — every swap = 2 shipments |
| Same-day gig courier (Zoom2u etc.) | $60–$300+ ([Zoom2u Brisbane](https://www.zoom2u.com.au/brisbane-express-courier/)) | Driver, no packing | **Art explicitly prohibited/uninsured** | No |
| Platform van run (batched trail route) | Est. $10–$25/artwork at 10–20 stops/run (internal estimate — no public price; proxy: art-rental "delivery from $30 each way", [Rental Art Australia](https://www.rentalart.com.au/our-service/)) | Platform staff/contractor | Platform-controlled; insurable per run | Yes — batches swaps |
| **Venue node (drop / collect / swap at café)** | **~$0 marginal** (venue hosting economics; foot-traffic upside per [HUBBED data](https://hubbed.com/parcel-collection-networks-offer-retailers-additional-revenue/)) | Artist and customer self-serve; venue staff witness handover | Handover checklist + photo; on-premises risk sits with venue/platform policy | **Yes — native** |

Complexity trade-off: nodes push work onto app UX (booking a pickup window, condition-photo capture at handover, swap matching) instead of freight ops. That is software — which scales — rather than dollars per move, which don't.

---

## 5. Insurance: in transit and on the wall

- **Carrier cover is a trap:** as above, CouriersPlease and gig couriers exclude artwork/glass entirely; even where warranty cover exists, claims are refused for "insufficient packaging" ([AUSFF guide](https://www.ausff.com.au/best-courier-for-fragile-items/)). Never represent carrier cover to users as protection.
- **NAVA's member transit insurance is gone:** the National Association for the Visual Arts' transit & exhibition product (formerly **1.5%–2.5% of insured value per transit**, works to $100k, exhibition cover to 60 days) **is no longer offered** ([NAVA page](https://visualarts.net.au/Membership/transit-and-exhibition-insurance/)) — NAVA itself noted it was "often cheaper to arrange transit and exhibition insurance cover through your transport company directly." Don't point artists there.
- **Market pricing:** single-transit fine-art insurance is typically quoted ad valorem at roughly **0.3%–1.5% of declared value per transit** in general industry practice ([HD Asian Art explainer](https://www.hdasianart.com/blogs/news/art-shipping-insurance)); AU access routes are specialist brokers (e.g. [Genesis Insurance fine art](https://genesisbro.com.au/products/fine-art-insurance/); broker market overview at [Insurance Business](https://www.insurancebusinessmag.com/au/guides/art-insurance-517617.aspx); consumer comparison at [Finder](https://www.finder.com.au/home-insurance/contents-insurance/art-insurance)) or via the transport company (King & Wilson arranges transit cover — [source](https://art.kingandwilson.com.au/insurance)). On a $600 emerging-artist work, 1% ≈ $6/transit — trivial *if bought at portfolio level*; punitive if bought per-move retail.
- **Who bears risk in marketplace models:** Bluethumb sets the AU consumer expectation — **the platform insures transit and funds returns** ([policy](https://bluethumb.com.au/p/shipping)). Commercial art-rental firms bundle "free insurance" into the rental ([Franklin Art Studio](https://www.franklinartstudio.com.au/pages/art-rent)). Recommendation: AccessArt takes a **blanket annual marketplace policy** (transit + on-display + on-wall-in-home, capped per work, brokered) funded by a small per-transaction protection fee, with the customer liable for an excess on negligent damage — the fashion-rental damage-fee pattern. On-display risk at venues should sit alongside the venue's existing public liability, with AccessArt's policy covering the artwork itself; get broker advice before launch (premium not publicly quotable — expect a minimum-premium policy in the low thousands per year; verify with brokers).

---

## 6. Hanging and installation in SEQ

- **Pro hanging prices (Brisbane):** Fantastic Framing charges **$50 (small) / $90 (large) / $120 (extra-large)** per artwork ([service page](https://fantasticframing.com.au/pages/framing-hanging-service)); Professional Picture Hanging charges **$270 first hour + $170/hr thereafter + GST** ([pricing blog](https://professionalpicturehanging.com.au/blog/how-much-does-it-cost-to-hang-a-picture/), [Brisbane page](https://professionalpicturehanging.com.au/picture-hanging-brisbane/)). Hang My Art, Art of Hanging and Brisbane Picture Hanging all cover Brisbane/Gold Coast/Sunshine Coast ([hangmyart.net.au](https://www.hangmyart.net.au/), [artofhanging.com](https://artofhanging.com/picture-hanging-brisbane/)). Useful as a marketplace add-on (~$70–$120 retail per visit) and for venue fit-outs — not per-swap.
- **Damage-free systems for renters (a majority of the target consumer base):**
  - **Command adhesive strips** — Large strips hold **7.2kg** using 4 sets and are rated for frames up to **60×90cm**: $6.99/4-pack at Bunnings ([product](https://www.bunnings.com.au/command-large-white-adhesive-picture-hanging-strips-4-pack_p3950291)); 9kg Extra Large version also stocked ([product](https://www.bunnings.com.au/command-9kg-extra-large-white-picture-hanging-strips-4-pack_p0403154)). A ~$7–$14 "renter hanging kit" covers almost the whole AccessArt catalogue — bundle it with first orders.
  - **STAS rail systems** — the gallery-grade answer for venues: cliprail max + installation kit **$54.20**, cliprail pro **$71**, hooks+cords **~$11.80** per drop; the AU distributor is in **Eumundi, QLD** (Sunshine Coast) ([picturerail.com.au](https://picturerail.com.au/), [rail systems page](https://picturerail.com.au/pages/picture-rail-systems)). One-time ~$300–$600 fit-out per café wall makes every subsequent hang/swap a zero-damage, 30-second, no-tools operation by anyone — this is the physical enabler of self-serve swaps at venues.

---

## 7. Operating model recommendation for AccessArt

1. **Launch default = zero-courier loops.** Artist delivers and hangs at the venue (already the café-show norm); renters/buyers collect and return at the venue where the work hangs; swaps execute as two node visits. Marginal platform delivery cost ≈ $0; the toy-library/HUBBED precedents show staffed local nodes handle circular goods at near-zero cost while driving host foot traffic (59% attach-purchase rate).
2. **Fit out every venue with a STAS-style rail wall (~$300–$600 one-time, platform-funded or amortised into venue commission)** so hangs and swaps are tool-free, damage-free and doable by staff or members — the single highest-leverage capex in the whole logistics stack.
3. **Constrain listable sizes to 2–3 standard formats (≤90cm longest side, ≤9kg)** so works fit reusable transit sleeves, Command-strip weight ratings, car back seats, and (at 90cm) the AusPost 105cm envelope when courier is unavoidable.
4. **Build a platform-owned reusable sleeve pool** (padded velcro art sleeves in the standard sizes, est. $40–$80 each — no AU rental-pool competitor exists; ROKBOX proves the reuse economics at ~$40/use even at museum grade). Sleeves live at venues; every artwork travels sleeved; sub-$1 packaging cost per movement versus $15–$30 single-use.
5. **Sell courier as a paid add-on, never a bundled promise:** quote Pack & Send (~$200–$300 fragile-safe door-to-door) or a vetted local art courier at cost + margin for customers who won't visit a node; be explicit that mainstream cheap carriers exclude artwork from cover. Never subsidise it — Bluethumb's free-shipping model only works at sale AOVs, not rentals.
6. **At scale, add batched "trail run" van routes:** one driver, one afternoon, 10–20 venue stops along Brisbane/GC/Sunshine Coast corridors for rotations, returns-to-artist and inter-venue rebalancing — estimated $10–$25 per artwork moved (internal estimate; B2B art rental delivers "from $30 each way"), booked fortnightly and only when node self-service hasn't cleared the queue.
7. **Swap mechanics that keep cost near zero:** a swap is two reservations at one venue — both parties book overlapping windows (or asynchronous: A returns to rail slot, app notifies B, B collects within 48h); venue staff scan QR + condition photo at each handover; works never leave the node network, so a swap consumes zero freight and zero packaging beyond the sleeve.
8. **Pricing:** node pickup/return/swap free (funded by the membership/rental margin); courier add-on at cost +15–20%; pro hanging add-on ~$79–$129 via a partnered SEQ hanger (wholesale $50–$120); include a Command-strip renter kit (~$7–$14 COGS) with first rentals; charge a flat $5–$8 "art protection" fee per rental cycle to fund the blanket insurance policy and damage pool, with a published customer excess for negligence.
9. **Risk allocation:** platform bears transit + on-display risk under a brokered blanket policy (single-transit market rate ~0.3–1.5% of value suggests portfolio cover is affordable at emerging-artist values); venue bears premises liability it already carries; customer bears an excess-capped negligence risk — mirror GlamCorner's damage-fee clarity so artists trust the system.
10. **Interstate later, and only via consolidators:** when expanding beyond SEQ, use IAS/King & Wilson shuttle consolidation (their networks already link Brisbane to every capital) for batched inter-city inventory moves, not per-order point-to-point — and treat each new city as a new node cluster, not a shipping destination.

---

## Sources

- IAS Fine Art Logistics — https://ias.au/
- Grace Fine Art — https://www.grace.com.au/art-transportation/ and https://www.grace.com.au/fine-art/
- King & Wilson Essential Art Services — https://art.kingandwilson.com.au/interstate-art-transport and https://art.kingandwilson.com.au/insurance
- Mobile Framing art couriers — https://mobileframing.com.au/art-couriers/
- TED Fine Art — https://www.tedfineart.com.au/art-transport/
- Pack & Send (canvas shipping, art packing) — https://www.packsend.com.au/send/best-way-to-ship-canvas-painting/ and https://www.packsend.com.au/packing-solutions/art-antiques-packing/
- Sendle collapse — https://www.abc.net.au/news/2026-01-23/australian-courier-tech-sendle-collapses/106237380 and https://ia.acs.org.au/article/2026/sendle-shuts-down-after-12-years---100m-in-funding.html
- Sendle historical size/oversize rules — https://support.sendle.com/hc/en-au/articles/205230938-Sendle-parcel-sizes-and-weights-for-domestic-parcels
- Australia Post size/weight guidelines — https://auspost.com.au/business/shipping/guidelines/size-weight-guidelines
- Australia Post artwork-sending guide — https://auspost.com.au/business/business-ideas/selling-online/sending-artwork-by-post
- Australia Post parcel lockers — https://auspost.com.au/personal/receiving/parcel-deliveries/parcel-lockers
- CouriersPlease FAQs (artwork exclusions) — https://www.couriersplease.com.au/help-centre/faqs/undefined
- FMH/CouriersPlease sale to PEP — https://www.businessnewsaustralia.com/articles/pacific-equity-partners-buys-freight-management-holdings-from-singpost-for--776m.html
- AUSFF best courier for fragile items — https://www.ausff.com.au/best-courier-for-fragile-items/
- Zoom2u Brisbane (pricing, art prohibition) — https://www.zoom2u.com.au/brisbane-express-courier/
- Shippit — https://www.shippit.com/ and https://www.capterra.com.au/software/159624/shippit
- uShip AU art transport quotes — https://www.uship.com/au/cost-to-ship/antiques-and-special-care-items-7/art-113/
- Blue Horizon Prints published shipping rate card — https://www.bluehorizonprints.com.au/shipping-prices/
- Bluethumb shipping/returns — https://bluethumb.com.au/p/shipping, https://bluethumb.com.au/p/7-day-free-returns, https://docs.bluethumb.com.au/en/articles/4034617-how-does-shipping-work-with-bluethumb, https://bluethumb.com.au/blog/artists/how-to-pack-art/
- Cardboard Box Shop PIC picture carton — https://www.cardboardboxshop.com.au/product/pic-picture-painting-carton/
- The Boxman art boxes — https://theboxman.com.au/product-category/shipping-boxes/art-shipping-boxes/
- Frameshop packaging materials — https://www.frameshop.com.au/product-cat-pod/packaging-materials/1766/
- Express Crates artwork crates — https://www.expresscrates.com.au/products/artwork-box-crates
- ROKBOX pricing / ROKBOX LOOP rental — https://rok-box.com/products-pricing/ and https://rok-boxloop.com/
- GlamCorner logistics — https://www.shippit.com/case-studies/glamcorner, https://support.glamcorner.com.au/hc/en-us/articles/360001012971-How-do-I-return-my-one-time-rental, https://www.glamcorner.com.au/pages/sustainability
- Valiant furniture hire — https://valiant.com.au/
- Artbank — https://en.wikipedia.org/wiki/Artbank
- Art rental providers — https://www.rentalart.com.au/our-service/, https://artlogic.com.au/content/rent-original-sa-art-at-a-fraction-of-its-price, https://mitchellfineartgallery.com/collections/brisbane-art-rental, https://www.franklinartstudio.com.au/pages/art-rent
- Toy Libraries Australia — https://www.toylibraries.org.au/join-us, https://www.pc.gov.au/__data/assets/pdf_file/0003/387561/sub130-circular-economy.pdf, https://bendigotoylibrary.org.au/membership/
- HUBBED / ParcelPoint — https://hubbed.com/network/, https://parcelpoint.com.au/, https://hubbed.com/parcel-collection-networks-offer-retailers-additional-revenue/
- Café exhibition model — https://reddotblog.com/showing-your-art-in-cafes-restaurants-banks-and-other-venues-2/
- NAVA transit & exhibition insurance (discontinued) — https://visualarts.net.au/Membership/transit-and-exhibition-insurance/
- Fine-art transit insurance pricing — https://www.hdasianart.com/blogs/news/art-shipping-insurance, https://genesisbro.com.au/products/fine-art-insurance/, https://www.insurancebusinessmag.com/au/guides/art-insurance-517617.aspx, https://www.finder.com.au/home-insurance/contents-insurance/art-insurance
- Hanging services — https://fantasticframing.com.au/pages/framing-hanging-service, https://professionalpicturehanging.com.au/blog/how-much-does-it-cost-to-hang-a-picture/, https://www.hangmyart.net.au/, https://artofhanging.com/picture-hanging-brisbane/
- STAS picture rails (AU, Eumundi QLD) — https://picturerail.com.au/ and https://picturerail.com.au/pages/picture-rail-systems
- Command strips at Bunnings — https://www.bunnings.com.au/command-large-white-adhesive-picture-hanging-strips-4-pack_p3950291 and https://www.bunnings.com.au/command-9kg-extra-large-white-picture-hanging-strips-4-pack_p0403154
