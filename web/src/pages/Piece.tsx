import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { AaArtwork } from '../api/client'
import { priceLine } from '../lib/money'
import './Piece.css'

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

function Piece() {
  const { id = '' } = useParams()

  const [art, setArt] = useState<AaArtwork | null>(null)
  const [state, setState] = useState<State>('loading')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (!id) {
      setState('missing')
      return
    }
    let alive = true
    setState('loading')
    api
      .getArtwork(id)
      .then((a) => {
        if (!alive) return
        setArt(a)
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
  }, [id])

  return (
    <div className="pc">
      <div className="noise" aria-hidden="true"></div>

      <header className="pc-nav">
        <Link className="pc-brand" to="/" aria-label="accessart">
          <Triangle size={20} />
          <span>art</span>
        </Link>
      </header>

      <main className="pc-main">
        {state === 'loading' ? <p className="pc-guard">hold on.</p> : null}

        {state === 'missing' ? (
          <div className="pc-gone">
            <p className="pc-guard">no such piece.</p>
            <Link className="pc-back" to="/">
              back to the front.
            </Link>
          </div>
        ) : null}

        {state === 'error' ? <p className="pc-guard">{errMsg}</p> : null}

        {state === 'ready' && art ? (
          <article>
            {art.image_urls.length > 0 ? (
              <div className="pc-images">
                {art.image_urls.map((url, i) => (
                  <div key={url} className={`pc-frame${i === 0 ? ' pc-frame--hero' : ''}`}>
                    <span className="pc-tape" aria-hidden="true"></span>
                    <img src={url} alt={i === 0 ? art.title : ''} />
                  </div>
                ))}
              </div>
            ) : null}

            <h1 className="pc-title">{art.title}</h1>
            {art.artist_handle ? (
              <Link className="pc-by" to={`/@${art.artist_handle}`}>
                by @{art.artist_handle}
              </Link>
            ) : null}

            <p className="pc-story">{art.story}</p>

            <p className="pc-meta">
              {art.width_cm} x {art.height_cm} cm. {art.medium}.
            </p>
            <p className="pc-price">{priceLine(art)}</p>

            <div className="pc-actions">
              <button className="btn" type="button" disabled title="soon.">
                rent it
              </button>
              <button className="btn" type="button" disabled title="soon.">
                buy it
              </button>
            </div>
            <p className="pc-soon">the money part lands soon.</p>
          </article>
        ) : null}
      </main>

      <footer className="pc-foot">
        <span>rent it. swap it. buy it if it sticks.</span>
        <span>made in brisbane.</span>
      </footer>
    </div>
  )
}

export default Piece
