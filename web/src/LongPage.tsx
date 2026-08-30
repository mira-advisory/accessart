// The original long-scroll landing, kept for reference — not routed.
// Its sections (marquee, café wall, quote, how-it-goes, panels, CTA) will feed
// the pages behind the two doors.
import { useState } from 'react'
import './App.css'

type Door = 'want' | 'make' | 'walls'

const deals: Record<Door, string> = {
  want: 'original art, rented from $[X] a week. swap it at the café when you’re over it. buy it if it sticks — your rent counts toward the price.',
  make: 'free to list. you keep most of the money. your art hangs in real cafés and we tell you where. no vetting, no politics. not a gallery.',
  walls: 'free local art on rotation for your venue. we handle the swaps. you take a cut when a piece sells off your wall. people come in to look, stay to spend.',
}

function Triangle({ size = 16, fill = 'currentColor' }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={(size * 14) / 16} viewBox="0 0 16 14" fill="none" aria-hidden="true">
      <path d="M8 0L16 14H0L8 0Z" fill={fill} />
    </svg>
  )
}

function Arrow() {
  return (
    <svg className="door-arrow" width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const marqueeChunk = (
  <>
    <span className="marquee-chunk">
      rent it — swap it — <em>buy it if you can’t let go</em> — not a gallery —{' '}
    </span>
    <span className="marquee-chunk">
      rent it — swap it — <em>buy it if you can’t let go</em> — not a gallery —{' '}
    </span>
  </>
)

const pieces = [
  {
    rot: 'piece--r1',
    title: 'afternoon, interrupted',
    art: (
      <svg width="210" height="260" viewBox="0 0 210 260">
        <rect width="210" height="260" fill="#ddd6c6" />
        <circle cx="105" cy="112" r="58" fill="#e8391d" />
        <rect x="40" y="196" width="130" height="8" fill="#141310" />
      </svg>
    ),
  },
  {
    rot: 'piece--r2',
    title: 'river, from memory',
    tag: 'on the wall at [café name]',
    art: (
      <svg width="290" height="190" viewBox="0 0 290 190">
        <rect width="290" height="190" fill="#3d4a43" />
        <path d="M0 146 Q72 58 145 126 T290 92" stroke="#e9e4d8" strokeWidth="10" fill="none" />
        <circle cx="238" cy="50" r="17" fill="#e8391d" />
      </svg>
    ),
  },
  {
    rot: 'piece--r3',
    title: 'two neighbours',
    art: (
      <svg width="168" height="168" viewBox="0 0 168 168">
        <rect width="168" height="168" fill="#d9c8a7" />
        <rect x="24" y="24" width="50" height="120" fill="#141310" />
        <rect x="92" y="60" width="50" height="84" fill="#e8391d" />
      </svg>
    ),
  },
  {
    rot: 'piece--r4',
    title: 'weather permitting',
    art: (
      <svg width="244" height="300" viewBox="0 0 244 300">
        <rect width="244" height="300" fill="#e9e4d8" />
        <path
          d="M26 274 C58 142 88 228 122 114 C152 28 200 172 218 56"
          stroke="#141310"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="62" cy="80" r="25" fill="#7a8b7f" />
      </svg>
    ),
  },
  {
    rot: 'piece--r5',
    title: 'the regular',
    art: (
      <svg width="188" height="240" viewBox="0 0 188 240">
        <rect width="188" height="240" fill="#e8391d" />
        <circle cx="94" cy="92" r="42" fill="#e9e4d8" />
        <circle cx="94" cy="92" r="15" fill="#141310" />
        <rect x="32" y="168" width="124" height="10" fill="#e9e4d8" />
        <rect x="32" y="190" width="82" height="10" fill="#e9e4d8" />
      </svg>
    ),
  },
]

const steps = [
  {
    num: '01',
    name: 'see it',
    copy: 'in a café, on an art trail, on your feed. good art keeps turning up once you let it.',
  },
  {
    num: '02',
    name: 'rent it',
    copy: 'from $[X] a week. it feels like nothing. that’s the point.',
  },
  {
    num: '03',
    name: 'swap it',
    copy: 'over it? swap it for something new at the café. no hard feelings.',
  },
  {
    num: '04',
    name: 'buy it',
    copy: 'can’t let go? your rent has already paid part of it.',
  },
]

function LongPage() {
  const [door, setDoor] = useState<Door | null>(null)

  const doorProps = (d: Door) => ({
    onMouseEnter: () => setDoor(d),
    onMouseLeave: () => setDoor(null),
    onFocus: () => setDoor(d),
    onBlur: () => setDoor(null),
  })

  return (
    <>
      <div className="noise" aria-hidden="true"></div>

      <nav className="nav">
        <a className="brand" href="/">
          <Triangle />
          accessart
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#wall">the art</a>
          <a className="nav-link" href="#artists">artists</a>
          <a className="nav-link" href="#venues">walls</a>
          <a className="btn" href="#wall">start looking</a>
        </div>
      </nav>

      <header className={`hero${door ? ` hero--${door}` : ''}`}>
        <div className="stamp">not a gallery.</div>
        <div className="eyebrow">you’re here for one of three reasons.</div>

        <a className="door" href="#wall" {...doorProps('want')}>
          <span className="door-line">
            <span className="door-ohh">ohh, i want</span>
            <span className="door-word">art.</span>
          </span>
          <Arrow />
        </a>
        <a className="door" href="#artists" {...doorProps('make')}>
          <span className="door-line">
            <span className="door-ohh">ohh, i make</span>
            <span className="door-word">art.</span>
          </span>
          <Arrow />
        </a>
        <a className="door" href="#venues" {...doorProps('walls')}>
          <span className="door-line">
            <span className="door-ohh">ohh, i have</span>
            <span className="door-word">walls.</span>
          </span>
          <Arrow />
        </a>

        <div className="hero-foot">
          <p className={`hero-copy${door ? ' hero-copy--deal' : ''}`} key={door ?? 'default'}>
            {door ? (
              <>
                <span className="deal-label">the deal.</span>
                {deals[door]}
              </>
            ) : (
              <>
                accessart is where emerging artists get seen — on café walls, on art trails, on your
                feed — and where their art gets rented, swapped, and occasionally bought. brisbane
                first. everywhere eventually.
              </>
            )}
          </p>
          <div className="hero-actions">
            <a className="btn btn--big" href="#wall">start looking</a>
            <a className="link-red" href="#artists">or list your art →</a>
          </div>
        </div>
      </header>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">{marqueeChunk}</div>
      </div>

      <section className="wall" id="wall">
        <div className="wall-head">
          <div className="wall-sub">scan it. rent it. take it home.</div>
        </div>
        <div className="wall-row">
          {pieces.map((p) => (
            <figure className={`piece ${p.rot}`} key={p.title} style={{ margin: 0 }}>
              <div className="frame">
                <span className="tape" aria-hidden="true"></span>
                {p.tag ? <span className="tag">{p.tag}</span> : null}
                {p.art}
              </div>
              <figcaption className="piece-cap">
                <span>{p.title}</span>
                <span>rent · swap · buy</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="quote">
        <p className="quote-big">
          51% of collectors have bought art on instagram{' '}
          <span className="scribble">
            without seeing it.
            <svg viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M2 8 C50 2 90 11 140 6 C190 1 230 10 298 5"
                stroke="#e8391d"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </p>
        <p className="quote-sub">you’ll get to see yours hanging in a café first.</p>
        <p className="quote-src">— art basel &amp; ubs art market report, 2026</p>
      </section>

      <section className="how">
        <h2 className="how-title">how it goes.</h2>
        <div className="steps">
          {steps.map((s) => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <div className="step-name">{s.name}</div>
              <p>{s.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sides">
        <div className="panel panel--a" id="artists">
          <div className="panel-eyebrow">for artists</div>
          <h3>your art belongs on walls, not in your spare room.</h3>
          <p>
            free to list. you keep most of the money. your page is yours — your story, your prices,
            your people. and when your piece is hanging in a café across town, we’ll tell you. it’s a
            good feeling.
          </p>
          <a className="link-red" href="#artists" style={{ alignSelf: 'flex-start' }}>
            list your art →
          </a>
        </div>
        <div className="panel panel--b" id="venues">
          <div className="panel-eyebrow">for venues</div>
          <h3>free art. rotating. forever.</h3>
          <p>
            local art on your walls, swapped fresh without you lifting a hammer. your café becomes a
            stop on the trail. people come in to look and stay for coffee. you take a cut when
            something sells. hard to argue with.
          </p>
          <a className="link-red" href="#venues" style={{ alignSelf: 'flex-start' }}>
            give us your walls →
          </a>
        </div>
      </section>

      <section className="cta">
        <p className="cta-line">
          <span className="cta-ohh">ohh,</span>
          <span className="cta-shout">go on then.</span>
        </p>
        <div className="cta-actions">
          <a className="btn btn--paper btn--big" href="#wall">start looking</a>
        </div>
        <p className="cta-small">free to browse. free for artists. free for walls.</p>
      </section>

      <footer className="footer">
        <a className="brand" href="/" style={{ fontSize: 14 }}>
          <Triangle size={12} />
          accessart
        </a>
        <div className="footer-links">
          <a href="#wall">instagram</a>
          <a href="#wall">about</a>
          <a href="#wall">terms</a>
        </div>
        <div className="footer-made">made in brisbane.</div>
      </footer>
    </>
  )
}

export default LongPage
