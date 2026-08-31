import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { AaMedium } from '../api/client'
import { dollarString, halfOffWeeks, weeklyCents } from '../lib/money'
import './Upload.css'

const MEDIUMS: AaMedium[] = ['painting', 'print', 'photography', 'digital', 'mixed', 'other']
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTOS = 6
const STORY_PROMPTS = [
  'what were you listening to when you made this?',
  'where was this made. what was going on.',
  'what should the person living with this know.',
  'why this one. why now.',
]

type Guard = 'checking' | 'in' | 'no_artist'
type PhotoStatus = 'uploading' | 'done' | 'error'
type Photo = { id: number; preview: string; status: PhotoStatus; key?: string }

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

function Upload() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(0)

  const [guard, setGuard] = useState<Guard>('checking')
  const [handle, setHandle] = useState('')

  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoNote, setPhotoNote] = useState('')
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [storyPrompt] = useState(
    () => STORY_PROMPTS[Math.floor(Math.random() * STORY_PROMPTS.length)],
  )
  const [medium, setMedium] = useState<AaMedium | ''>('')
  const [widthCm, setWidthCm] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [value, setValue] = useState('')
  const [rentable, setRentable] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  // the door check: signed out goes to join, signed in without the artist
  // role gets the dry line below.
  useEffect(() => {
    let alive = true
    api
      .getMe()
      .then((me) => {
        if (!alive) return
        if (me.handle) setHandle(me.handle)
        setGuard(me.roles.includes('artist') ? 'in' : 'no_artist')
      })
      .catch(() => {
        if (alive) navigate('/join?door=art', { replace: true })
      })
    return () => {
      alive = false
    }
  }, [navigate])

  const uploadOne = async (id: number, file: File) => {
    try {
      const { key } = await api.uploadImage(file)
      setPhotos((p) => p.map((ph): Photo => (ph.id === id ? { ...ph, status: 'done', key } : ph)))
    } catch {
      setPhotos((p) => p.map((ph): Photo => (ph.id === id ? { ...ph, status: 'error' } : ph)))
    }
  }

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    setPhotoNote('')
    const files = Array.from(list).filter((f) => IMAGE_TYPES.includes(f.type))
    if (files.length < list.length) setPhotoNote('jpeg, png or webp. nothing else.')
    const room = MAX_PHOTOS - photos.length
    if (files.length > room) setPhotoNote('six is the cap.')
    const take = files.slice(0, Math.max(room, 0))
    if (take.length === 0) return
    const added = take.map((f): Photo => {
      idRef.current += 1
      return { id: idRef.current, preview: URL.createObjectURL(f), status: 'uploading' }
    })
    setPhotos((p) => [...p, ...added])
    added.forEach((ph, i) => {
      void uploadOne(ph.id, take[i])
    })
  }

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const binIt = (id: number) => {
    const target = photos.find((ph) => ph.id === id)
    if (target) URL.revokeObjectURL(target.preview)
    setPhotos((p) => p.filter((ph) => ph.id !== id))
  }

  // money maths per the display contract.
  const valueNum = Number.parseFloat(value)
  const valueCents = Number.isFinite(valueNum) && valueNum > 0 ? Math.round(valueNum * 100) : 0
  const rentMonthCents = Math.round(valueCents * 0.05)
  const wkCents = weeklyCents(rentMonthCents)
  const weeks = wkCents > 0 ? halfOffWeeks(valueCents, wkCents) : 0
  const showRentLine = rentable && valueCents >= 10000 && wkCents > 0
  const rentTooLow = rentable && valueCents > 0 && valueCents < 25000

  const uploading = photos.some((p) => p.status === 'uploading')
  const imageKeys = photos.flatMap((p) => (p.status === 'done' && p.key ? [p.key] : []))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy || rentTooLow) return
    if (uploading) {
      setErr('photos are still uploading. a second.')
      return
    }
    if (imageKeys.length === 0) {
      setErr('photos first.')
      return
    }
    if (!title.trim()) {
      setErr('give it a title.')
      return
    }
    if (!story.trim()) {
      setErr('every piece carries its story. required.')
      return
    }
    if (!medium) {
      setErr('pick a medium.')
      return
    }
    const w = Number.parseFloat(widthCm)
    const h = Number.parseFloat(heightCm)
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
      setErr('width and height, in cm.')
      return
    }
    if (valueCents <= 0) {
      setErr('put a value on it.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      await api.createArtwork({
        title: title.trim(),
        story: story.trim(),
        medium,
        width_cm: w,
        height_cm: h,
        value_cents: valueCents,
        rentable,
        image_keys: imageKeys,
        status: 'listed',
      })
      setDone(true)
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : 'that didn’t work. try again.')
    } finally {
      setBusy(false)
    }
  }

  const another = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.preview))
    setPhotos([])
    setPhotoNote('')
    setTitle('')
    setStory('')
    setMedium('')
    setWidthCm('')
    setHeightCm('')
    setValue('')
    setRentable(true)
    setErr('')
    setDone(false)
  }

  return (
    <div className="up">
      <div className="noise" aria-hidden="true"></div>

      <header className="up-nav">
        <Link className="up-brand" to="/" aria-label="accessart">
          <Triangle size={20} />
          <span>art</span>
        </Link>
      </header>

      <main className="up-main">
        {guard === 'checking' ? <p className="up-guard">hold on.</p> : null}

        {guard === 'no_artist' ? (
          <p className="up-guard">
            this door needs the artist role.{' '}
            <Link className="up-link" to="/join?door=art">
              go get it.
            </Link>
          </p>
        ) : null}

        {guard === 'in' && done ? (
          <div className="up-done">
            <div className="up-eyebrow">
              <span>the upload.</span>
              <span>done.</span>
            </div>
            <h1 className="up-line">
              <span className="up-ohh">ohhh yeh.</span>{' '}
              <span className="up-shout">it’s live.</span>
            </h1>
            <div className="up-done-actions">
              {handle ? (
                <Link className="btn up-btn" to={`/@${handle}`}>
                  see your page.
                </Link>
              ) : null}
              <button className="up-alt" type="button" onClick={another}>
                another one.
              </button>
            </div>
          </div>
        ) : null}

        {guard === 'in' && !done ? (
          <>
            <div className="up-eyebrow">
              <span>the upload.</span>
              {handle ? <span>@{handle}</span> : null}
            </div>
            <h1 className="up-line">
              <span className="up-ohh">ohh,</span>{' '}
              <span className="up-shout">what have you got.</span>
            </h1>
            <p className="up-copy">photos, story, numbers. in that order.</p>

            <form className="up-form" onSubmit={submit}>
              <section className="up-photos">
                <button
                  type="button"
                  className="up-drop"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                >
                  <span className="up-drop-shout">photos first.</span>
                  <span className="up-drop-sub">up to six. jpeg, png or webp. tap or drop.</span>
                </button>
                <input
                  ref={fileRef}
                  className="up-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={onPick}
                />
                {photoNote ? <p className="up-hint">{photoNote}</p> : null}
                {photos.length > 0 ? (
                  <div className="up-shots">
                    {photos.map((p) => (
                      <figure key={p.id} className={`up-shot up-shot--${p.status}`}>
                        <span className="up-tape" aria-hidden="true"></span>
                        <img className="up-shot-img" src={p.preview} alt="" />
                        <figcaption className="up-shot-cap">
                          <span
                            className={`up-shot-state${
                              p.status === 'error' ? ' up-shot-state--err' : ''
                            }`}
                          >
                            {p.status === 'uploading'
                              ? 'uploading.'
                              : p.status === 'error'
                                ? 'didn’t take.'
                                : 'up.'}
                          </span>
                          <button type="button" className="up-bin" onClick={() => binIt(p.id)}>
                            bin it
                          </button>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </section>

              <div className="up-field">
                <label className="up-label" htmlFor="up-title">
                  title
                </label>
                <input
                  id="up-title"
                  className="up-input"
                  placeholder="what it’s called"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="up-field">
                <label className="up-label" htmlFor="up-story">
                  story
                </label>
                <textarea
                  id="up-story"
                  className="up-input up-area"
                  rows={4}
                  placeholder={storyPrompt}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                />
                <p className="up-hint">every piece carries its story. required.</p>
              </div>

              <div className="up-field">
                <span className="up-label">medium</span>
                <div className="up-chips">
                  {MEDIUMS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`up-chip${medium === m ? ' up-chip--on' : ''}`}
                      onClick={() => setMedium(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="up-dims">
                <div className="up-field">
                  <label className="up-label" htmlFor="up-w">
                    width cm
                  </label>
                  <input
                    id="up-w"
                    className="up-input"
                    inputMode="decimal"
                    placeholder="50"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value.replace(/[^\d.]/g, ''))}
                  />
                </div>
                <div className="up-field">
                  <label className="up-label" htmlFor="up-h">
                    height cm
                  </label>
                  <input
                    id="up-h"
                    className="up-input"
                    inputMode="decimal"
                    placeholder="70"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value.replace(/[^\d.]/g, ''))}
                  />
                </div>
              </div>

              <div className="up-field">
                <label className="up-label" htmlFor="up-value">
                  value in dollars
                </label>
                <input
                  id="up-value"
                  className="up-input"
                  inputMode="decimal"
                  placeholder="400"
                  value={value}
                  onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ''))}
                />
                {showRentLine ? (
                  <p className="up-hint">
                    renting at {dollarString(wkCents)}/wk. about {weeks} weeks of rent knocks half
                    off.
                  </p>
                ) : null}
              </div>

              <div className="up-field">
                <span className="up-label">up for rent</span>
                <div className="up-chips">
                  <button
                    type="button"
                    className={`up-chip${rentable ? ' up-chip--on' : ''}`}
                    onClick={() => setRentable((v) => !v)}
                  >
                    rentable
                  </button>
                </div>
                {rentTooLow ? <p className="up-err">rentable pieces start at $250.</p> : null}
              </div>

              <button className="btn up-btn" type="submit" disabled={busy || rentTooLow}>
                {busy ? 'hold on.' : 'list it.'}
              </button>
              {err ? <p className="up-err">{err}</p> : null}
            </form>
          </>
        ) : null}
      </main>

      <footer className="up-foot">
        <span>rent it. swap it. buy it if it sticks.</span>
        <span>made in brisbane.</span>
      </footer>
    </div>
  )
}

export default Upload
