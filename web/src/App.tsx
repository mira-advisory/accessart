import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

function Triangle({ size = 18, fill = 'currentColor' }: { size?: number; fill?: string }) {
  return (
    <svg
      width={size}
      height={(size * 14) / 16}
      viewBox="0 0 16 14"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M8 0L16 14H0L8 0Z" fill={fill} />
    </svg>
  )
}

type FaStatus = 'idle' | 'sending' | 'done' | 'error'

function FirstAccess({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const zoneRef = useRef<HTMLSpanElement>(null)
  const [email, setEmail] = useState('')
  const [hasArt, setHasArt] = useState(false)
  const [hasWalls, setHasWalls] = useState(false)
  const [status, setStatus] = useState<FaStatus>('idle')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const addr = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setStatus('error')
      setErr('that email doesn’t look right.')
      return
    }
    const base = import.meta.env.VITE_API_BASE_URL as string | undefined
    if (!base) {
      setStatus('error')
      setErr('backend isn’t wired up yet — the aws deploy is next.')
      return
    }
    setStatus('sending')
    try {
      const doors = [...(hasArt ? ['art'] : []), ...(hasWalls ? ['walls'] : [])]
      const res = await fetch(`${base.replace(/\/+$/, '')}/waitlist`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: addr, doors }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('done')
    } catch {
      setStatus('error')
      setErr('that didn’t work. try again.')
    }
  }

  return (
    <span ref={zoneRef}>
      <button
        className="fa-tab"
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
      >
        first access
      </button>

      {open ? (
        <div className="fa-panel" role="dialog" aria-label="first access">
          <button className="fa-close" type="button" onClick={() => setOpen(false)}>
            close
          </button>
          <div className="fa-label">first access.</div>
          {status === 'done' ? (
            <p className="fa-status fa-status--ok">
              you’re in. one email when the doors open — that’s it.
            </p>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p className="fa-copy">
                brisbane, soon. leave an email — one message when the doors open, and a head start
                through them.
              </p>
              <input
                className="fa-input"
                type="email"
                placeholder="your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <div className="fa-chips">
                <button
                  type="button"
                  className={`fa-chip${hasArt ? ' fa-chip--on' : ''}`}
                  onClick={() => setHasArt((v) => !v)}
                >
                  i have art
                </button>
                <button
                  type="button"
                  className={`fa-chip${hasWalls ? ' fa-chip--on' : ''}`}
                  onClick={() => setHasWalls((v) => !v)}
                >
                  i have walls
                </button>
              </div>
              <button className="btn" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'hold on.' : 'in.'}
              </button>
              {status === 'error' ? <p className="fa-status fa-status--err">{err}</p> : null}
            </form>
          )}
        </div>
      ) : null}
    </span>
  )
}

function App() {
  const [faOpen, setFaOpen] = useState(false)

  return (
    <div className={`landing${faOpen ? ' landing--fa' : ''}`}>
      <div className="noise" aria-hidden="true"></div>

      <header className="landing-nav">
        <a className="brand brand--mark" href="/" aria-label="accessart">
          <Triangle size={20} />
          <span>art</span>
        </a>
      </header>

      <main className="split">
        <a className="half half--art" href="#art">
          <span className="half-line">
            <span className="half-ohh">ooohhh, i have</span>
            <span className="half-word">art.</span>
          </span>
          <span className="half-deal">
            <span className="deal-label">the deal.</span>
            free to list. you keep most of the money. your art hangs on real walls — cafés, homes,
            trails — and we tell you where. not a gallery.
          </span>
        </a>

        <a className="half half--walls" href="#walls">
          <span className="half-line">
            <span className="half-word">walls.</span>
          </span>
          <span className="half-deal">
            <span className="deal-label">the deal.</span>
            home wall or café wall — same thing to us. local art on rotation: rent it from $[X] a
            week, swap it when you’re over it, buy it if it sticks.
          </span>
        </a>

        <div className="seam-triangle" aria-hidden="true">
          <Triangle size={72} fill="currentColor" />
        </div>
      </main>

      <FirstAccess open={faOpen} setOpen={setFaOpen} />

      <footer className="landing-foot">
        <span>rent it. swap it. buy it if it sticks.</span>
        <span>made in brisbane.</span>
      </footer>
    </div>
  )
}

export default App
