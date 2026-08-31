import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { AaArtistPage } from '../api/client'
import { priceLine } from '../lib/money'
import './Artist.css'

type State = 'loading' | 'ready' | 'missing' | 'error'

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

function Artist() {
  const { atHandle = '' } = useParams()
  // this route is the catch-all: only @handles are pages here.
  const handle = atHandle.startsWith('@') ? atHandle.slice(1) : ''

  const [page, setPage] = useState<AaArtistPage | null>(null)
  const [state, setState] = useState<State>('loading')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (!handle) {
      setState('missing')
      return
    }
    let alive = true
    setState('loading')
    api
      .getArtistByHandle(handle)
      .then((p) => {
        if (!alive) return
        setPage(p)
        setState('ready')
      })
      .catch((e) => {
        if (!alive) return
        if (e instanceof ApiError && e.status === 404) {
          setState('missing')
        } else {
          setErrMsg(e instanceof ApiError ? e.message : 'that didn’t load. try again.')
          setState('error')
        }
      })
    return () => {
      alive = false
    }
  }, [handle])

  return (
    <div className="ar">
      <div className="noise" aria-hidden="true"></div>

      <header className="ar-nav">
        <Link className="ar-brand" to="/" aria-label="accessart">
          <Triangle size={20} />
          <span>art</span>
        </Link>
      </header>

      <main className="ar-main">
        {state === 'loading' ? <p className="ar-guard">hold on.</p> : null}

        {state === 'missing' ? (
          <div className="ar-gone">
            <p className="ar-guard">no such page.</p>
            <Link className="ar-back" to="/">
              back to the front.
            </Link>
          </div>
        ) : null}

        {state === 'error' ? <p className="ar-guard">{errMsg}</p> : null}

        {state === 'ready' && page ? (
          <>
            <header className="ar-head">
              <h1 className="ar-line">
                <span className="ar-ohh">this is</span>{' '}
                <span className="ar-shout">@{page.artist.handle}</span>
              </h1>
              {page.artist.name ? <p className="ar-name">{page.artist.name}</p> : null}
            </header>

            {page.artworks.length > 0 ? (
              <div className="ar-grid">
                {page.artworks.map((a) => (
                  <Link key={a.artwork_id} className="ar-card" to={`/piece/${a.artwork_id}`}>
                    {a.image_urls[0] ? (
                      <img className="ar-card-img" src={a.image_urls[0]} alt={a.title} />
                    ) : (
                      <span className="ar-card-blank" aria-hidden="true"></span>
                    )}
                    <span className="ar-card-title">{a.title}</span>
                    <span className="ar-card-dims">
                      {a.width_cm} x {a.height_cm} cm
                    </span>
                    <span className="ar-card-price">{priceLine(a)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="ar-empty">nothing on the wall yet.</p>
            )}
          </>
        ) : null}
      </main>

      <footer className="ar-foot">
        <span>rent it. swap it. buy it if it sticks.</span>
        <span>made in brisbane.</span>
      </footer>
    </div>
  )
}

export default Artist
