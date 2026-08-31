import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import { api } from '../api/client'
import type { AaUser } from '../api/client'
import { landingHref } from '../lib/host'
import './Space.css'

function Triangle({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 14) / 16}
      viewBox="0 0 16 14"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M8 0L16 14H0L8 0Z" fill="currentColor" />
    </svg>
  )
}

function Space() {
  const navigate = useNavigate()
  const [me, setMe] = useState<AaUser | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let alive = true
    api
      .getMe()
      .then((u) => {
        if (alive) {
          setMe(u)
          setChecked(true)
        }
      })
      .catch(() => {
        if (alive) navigate('/join')
      })
    return () => {
      alive = false
    }
  }, [navigate])

  const leave = async () => {
    try {
      await signOut()
    } catch {
      // signed out is signed out
    }
    window.location.assign(landingHref())
  }

  if (!checked || !me) return <div className="space"><div className="noise" aria-hidden="true"></div></div>

  const isArtist = me.roles.includes('artist')

  return (
    <div className="space">
      <div className="noise" aria-hidden="true"></div>

      <header className="space-nav">
        <a className="space-brand" href={landingHref()} aria-label="accessart">
          <Triangle size={20} />
          <span>art</span>
        </a>
        <button className="space-out" type="button" onClick={leave}>
          sign out
        </button>
      </header>

      <main className="space-main">
        <h1 className="space-hello">
          <span className="space-ohh">ohhh yeh,</span>{' '}
          <span className="space-shout">@{me.handle ?? 'you'}.</span>
        </h1>
        <p className="space-sub">this is your space.</p>

        <div className="space-cards">
          {isArtist ? (
            <>
              <Link className="space-card" to="/upload">
                <span className="space-card-word">upload.</span>
                <span className="space-card-copy">photos first. live in minutes.</span>
              </Link>
              {me.handle ? (
                <Link className="space-card" to={`/@${me.handle}`}>
                  <span className="space-card-word">your page.</span>
                  <span className="space-card-copy">what the world sees.</span>
                </Link>
              ) : null}
            </>
          ) : null}
          <div className="space-card space-card--soon" title="soon.">
            <span className="space-card-word">the feed.</span>
            <span className="space-card-copy">soon.</span>
          </div>
          <div className="space-card space-card--soon" title="soon.">
            <span className="space-card-word">your wall.</span>
            <span className="space-card-copy">soon.</span>
          </div>
        </div>
      </main>

      <footer className="space-foot">
        <span>rent it. swap it. buy it if it sticks.</span>
        <span>made in brisbane.</span>
      </footer>
    </div>
  )
}

export default Space
