# AccessArt Design Language

Post-grunge but grunge, for cool people. Zine and gig-poster energy executed with typographic restraint. The art is the hero; the interface is paper, ink, and one loud red. This doc is the law for every surface: web, mobile, emails, admin. Source of truth for values: `web/src/index.css`.

## Palette

| Token | Value | Use |
|---|---|---|
| paper | #e9e4d8 | the ground; dirty warm paper, never white |
| paper-dim | #ddd6c6 | subtle panels on paper |
| ink | #141310 | type, borders, floods |
| red | #e8391d | the one loud accent: CTAs, stamps, hovers, links |
| olive | #3d4a43 | the walls flood; secondary surface colour |
| muted | #6f6a5c | secondary text on paper |
| muted-dark | #9a9484 | secondary text on ink |

Never introduce a new colour without a decision. No gradients, ever.

## Type

| Role | Font | Fallbacks (and email stand-ins) |
|---|---|---|
| shout | Anton, caps | Impact, 'Arial Narrow', sans-serif |
| inner voice | Instrument Serif, italic, lowercase | Georgia italic |
| body and UI | Space Grotesk | Arial, Helvetica |

The signature move: serif italic lowercase crashing into huge Anton caps ("ooohhh, i have ART."). Shout sizes are enormous (clamp up to 168px on desktop); body stays 13 to 17px. Max three fonts, always these three.

## Voice

- lowercase. dry. short sentences. full stops do the work.
- never corporate: no "empowering", no "seamless", no exclamation marks doing enthusiasm's job.
- HARD RULE: no em dashes anywhere (CLAUDE.md rule 11). periods, commas, colons, semicolons.
- no emoji in product copy. ever.
- "not a gallery" is load-bearing; use it sparingly so it stays sharp.
- notifications are specific and deadpan: "your rent just knocked another $12 off this piece."

## The mark

The triangle means access. The wordmark is the black triangle plus lowercase "art" (▲art), never the spelled-out word. The triangle is always a clean solid triangle: no outline, no container, no effects. Ink on paper; paper on ink or floods.

## Components

- **Borders as structure**: 2px solid ink. Corners square (0 to 2px radius, nothing rounder).
- **Cards and panels**: paper, 2px ink border, hard offset shadow (8px 8px 0 ink). A slight rotation (0.4 to 0.6deg) is allowed on one hero element per screen, never on many.
- **Buttons (.btn)**: solid ink block, paper text, bold grotesk; hover floods red. Paper variant inverts. No pills, no ghosts with 1px borders.
- **Stamps**: double border (3px double red), red caps, letter-spaced; may rotate a few degrees.
- **Inputs**: no boxes; a 2px ink underline that turns red on focus.
- **Chips (toggles)**: 2px ink border, transparent; selected floods ink with paper text.
- **Grain**: the fixed .noise overlay sits on every full-page surface.
- Icons: none by default ("no symbols"). When one is unavoidable it is drawn inline SVG, stroke style, never emoji or dingbats.

## Motion

- Hero moments: long confident glides, ~1.5s, even ease-in-out (cubic-bezier(0.45, 0.05, 0.15, 1)). One per screen.
- UI feedback: quick fades and 6px translates, 0.2 to 0.3s.
- Returns are instant; nothing bounces, nothing springs.
- Hover floods entire regions with colour (red or olive) rather than tinting small elements.
- Everything respects prefers-reduced-motion.

## Layout

- Generous space or committed density; nothing in between.
- Full-bleed colour floods for state changes; borders divide sections, not drop shadows.
- Commerce components (artwork card, price line, rent/buy/swap actions) are identical everywhere regardless of how expressive the surrounding artist page is (CLAUDE.md rule 5).
- Wide content scrolls inside its own container; the page never scrolls sideways.

## Never

Gradients. Rounded corners past 2px. Stock photos. Emoji. Em dashes. Fake device chrome. More than one accent colour. Symbols where a word works. Corporate anything.
