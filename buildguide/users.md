# Users: Artists and Wall Users (phase 1 spec)

Both are the same `users` record with a roles set (CLAUDE.md rule 4); one person can be both. Phase 1 has two active roles: `artist` (i have art) and `buyer` (i have walls). `operator` is Ben. `venue` waits for phase 2. No em dashes in copy, lowercase dry voice throughout.

## Shared account (both roles)

Collected at signup:

| Field | Notes |
|---|---|
| email | via email code or Google/Apple sign-in (Apple mandatory on iOS when social login exists) |
| handle | unique, lowercase; becomes `accessart.net/@handle` |
| display name | free text |
| market | SEQ default; a `markets` row, never hardcoded |
| roles | chosen by which door they walked through; both allowed |

Stored per user: `user_id`, the above, `avatar_key`, `stripe_customer_id` (wall side), `stripe_account_id` (artist side), `art_fund_cents` + currency, notification prefs, push tokens, `created_at` UTC.

Browsing requires no account. The account gate sits at the first follow, first listing, or first rent.

## Artist: "i have art"

Goal: from camera roll to listed in under ten minutes, on the phone.

Onboarding order:
1. Account (above), role `artist`.
2. Profile: bio/story (required; the 2019 interviews showed buyers connect to the story), suburb, Instagram handle (link only in v1; portfolio import is phase 2), page customisation within the system (banner, accent, section order). Their page is theirs.
3. Compliance gate: ABN **or** in-app Statement by a supplier (hobbyist form, e-signed, stored). Required before a listing can earn; without it the law forces 47% withholding. One screen, two paths, plain words.
4. Payouts: Stripe Connect Express onboarding (Stripe handles KYC). Can be deferred until first earnings; nudged early.
5. First artworks: camera or roll multi-select, direct-to-S3 presigned upload, then per piece: title, story (required), medium, width x height cm, value (min $100; rentable requires $250+). Rent price derives automatically (5% of value per month, shown weekly). Draft until published.

Artwork record: `artwork_id`, `artist_id`, `market_id`, title, story, medium, dimensions, image keys, `value_cents` + currency, rentable flag, status (`draft | listed | rented | sold | retired`), custody (`with_artist | in_transit | with_renter`), timestamps.

What an artist can do in v1: manage listings; see each piece's status and custody; earnings view (rent share accruing per block, sales, art-fund-funded sales shown at full artist value); get notified (piece rented, piece swapped back, piece sold, payout sent); coordinate hand-overs (v1 is messages and status buttons, not carrier automation).

What we deliberately do not do: vet or curate artists. Not a gallery. Quality pressure comes from the feed, not a gatekeeper.

## Wall user: "i have walls"

Goal: browsing feels like a feed, renting feels like nothing.

Onboarding order:
1. Browse free, no account: feed, artist pages, artwork pages.
2. Account at first follow or save, role `buyer`.
3. First rent adds, in one flow: delivery suburb (must be inside an active market), card on file (Stripe SetupIntent), one screen of rental terms with the damage waiver stated in plain words. No bond, no ID document.
4. Optional wall profile: sizes and orientations that fit, wall photos (feeds phase 2 visualisation).

What a wall user can do in v1: browse, follow artists, save pieces; rent (starts a 4-week block); "my wall" view showing the current piece, rent paid so far, credit toward this piece, and art fund balance; swap (pick the next piece, hand-over coordinated, credit carries at 50% into the fund per decisions.md); buy (price minus credit, Stripe payment, piece becomes theirs); receipts and history; end a rental (return hand-over, billing stops at block end).

Rental record: `rental_id`, `artwork_id`, `renter_id`, `artist_id`, rate per 4-week block, block anchor date, status (`active | ending | ended | converted`), `credit_accrued_cents`, custody events with condition photo keys, timestamps.

## The social layer (Ben, 2026-08-31: "borderline a social network")

This is not a bolt-on. The product is a social network for artists whose commerce is rent/swap/buy. Instagram/TikTok mechanics, art-shaped.

**Posts.** Artists post beyond listings: process videos and timelapses (the format that out-reaches finished work), WIP shots, studio life, and plain text notes (which is how artist-to-artist help happens: "how do you varnish resin?" is just a post). A post can tag an artwork; that tag is the commerce door (see the making-of, tap the piece, rent it). Post record: `post_id`, `artist_id`, `market_id`, type (`images | video | note`), media keys, text, optional `artwork_id`, timestamps. Video v1: short clips (60s cap), direct upload, no fancy transcoding yet.

**Threads.** Every post carries a thread: comments with one level of replies. Open to everyone; artists helping artists and fans talking to artists use the same mechanic. Comment record: `comment_id`, `post_id`, `user_id`, optional `parent_id`, text, timestamps.

**Follows and likes.** Anyone with an account follows artists; likes on posts, saves on artworks. Follower counts on artist pages. Records: `follows` (follower_id, artist_id), `likes` (user_id, post_id).

**Feed.** Two tabs, v1 chronological: following (posts and new listings from artists you follow) and discover (market-wide). No ranking algorithm until there is enough content to rank.

**Notifications in the brand voice.** "krista started following you." "your timelapse is doing numbers." "someone rented afternoon, interrupted."

**Moderation, because threads mean UGC.** Report button on posts and comments; operator module gets a reports queue with hide/remove/ban. No pre-moderation.

## The v1 screen list

Artist (mobile first): door page, signup, profile setup, compliance screen, upload flow, post composer (photo/video/note, optional artwork tag), my pieces, piece detail, earnings, notifications.

Wall user (web and mobile): feed (following + discover), post view with thread, artwork page, artist page, rent flow (3 steps), my wall, swap flow, buy flow, account.

Operator (web only, role-gated module): waitlist list, users list, artworks list, rentals list with custody states, manual hand-over override, reports queue.

## Explicitly out of v1

Instagram portfolio import, AR wall preview, courier integration, venue anything, subscriptions, auctions, commissions/custom work, DMs (threads are public; hand-over coordination is the only private channel), algorithmic feed ranking, livestreams.
