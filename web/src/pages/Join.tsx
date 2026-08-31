import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  autoSignIn,
  confirmSignIn,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signUp,
} from 'aws-amplify/auth'
import { api, ApiError } from '../api/client'
import { authConfigured } from '../auth'
import './Join.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HANDLE_RE = /^[a-z0-9_.]{3,20}$/

type Step = 'email' | 'code' | 'profile' | 'done'

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

// cognito errors arrive in corporate case. translate to house voice.
function dryAuthError(e: unknown, fallback: string): string {
  const name = e instanceof Error ? e.name : ''
  if (name === 'CodeMismatchException') return 'that code’s not it.'
  if (name === 'ExpiredCodeException') return 'that code expired. start over.'
  if (name === 'LimitExceededException' || name === 'TooManyRequestsException')
    return 'too many tries. give it a minute.'
  if (name === 'UserNotFoundException') return 'we can’t find that email.'
  return fallback
}

function Join() {
  const [params] = useSearchParams()
  const door = params.get('door') === 'art' ? 'art' : 'walls'

  const [step, setStep] = useState<Step>('email')
  // signup: confirming a brand-new account's code. signin: answering a sign-in challenge.
  const [mode, setMode] = useState<'signup' | 'signin'>('signin')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [hasArt, setHasArt] = useState(door === 'art')
  const [hasWalls, setHasWalls] = useState(door === 'walls')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const enterProfile = async () => {
    try {
      const me = await api.getMe()
      if (me.handle) setHandle(me.handle)
      if (me.name) setName(me.name)
      if (me.roles.includes('artist')) setHasArt(true)
      if (me.roles.includes('buyer')) setHasWalls(true)
    } catch {
      // patchMe will surface anything real when they hit done
    }
    setErr('')
    setStep('profile')
  }

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const addr = email.trim().toLowerCase()
    if (!EMAIL_RE.test(addr)) {
      setErr('that email doesn’t look right.')
      return
    }
    if (!authConfigured) {
      setErr('sign-in isn’t wired up yet. the deploy is next.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      // New users: passwordless SignUp itself emails a confirmation code.
      let isNew = false
      try {
        const su = await signUp({
          username: addr,
          options: { userAttributes: { email: addr }, autoSignIn: true },
          passwordless: true,
        } as never)
        const suStep = (su as { nextStep?: { signUpStep?: string } }).nextStep?.signUpStep
        isNew = suStep === 'CONFIRM_SIGN_UP'
      } catch (suError) {
        const suName = suError instanceof Error ? suError.name : ''
        if (suName !== 'UsernameExistsException') throw suError
      }
      if (isNew) {
        setMode('signup')
        setCode('')
        setStep('code')
        return
      }
      // Existing users: passwordless sign-in challenge.
      try {
        const { nextStep } = await signIn({
          username: addr,
          options: { authFlowType: 'USER_AUTH', preferredChallenge: 'EMAIL_OTP' },
        })
        if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
          setMode('signin')
          setCode('')
          setStep('code')
        } else if (nextStep.signInStep === 'DONE') {
          await enterProfile()
        } else {
          setErr('sign-in came back with a step we don’t handle yet.')
        }
      } catch (siError) {
        const siName = siError instanceof Error ? siError.name : ''
        if (siName === 'UserNotConfirmedException') {
          // A half-finished signup from before: send a fresh confirmation code.
          await resendSignUpCode({ username: addr })
          setMode('signup')
          setCode('')
          setStep('code')
        } else {
          throw siError
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'UserAlreadyAuthenticatedException') {
        await enterProfile()
      } else {
        setErr(dryAuthError(error, 'that didn’t work. try again.'))
      }
    } finally {
      setBusy(false)
    }
  }

  const submitCode = async (e: FormEvent) => {
    e.preventDefault()
    if (busy || code.length !== 6) return
    setBusy(true)
    setErr('')
    try {
      if (mode === 'signup') {
        const addr = email.trim().toLowerCase()
        await confirmSignUp({ username: addr, confirmationCode: code })
        try {
          const r = await autoSignIn()
          if (r.nextStep.signInStep !== 'DONE') throw new Error('auto sign-in incomplete')
        } catch {
          // No auto session available: fall back to a sign-in challenge.
          const { nextStep } = await signIn({
            username: addr,
            options: { authFlowType: 'USER_AUTH', preferredChallenge: 'EMAIL_OTP' },
          })
          if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
            setMode('signin')
            setCode('')
            setErr('one more code just landed. use the newest one.')
            return
          }
          if (nextStep.signInStep !== 'DONE') {
            setErr('that didn’t land. start over.')
            return
          }
        }
        await enterProfile()
      } else {
        const { nextStep } = await confirmSignIn({ challengeResponse: code })
        if (nextStep.signInStep === 'DONE') {
          await enterProfile()
        } else {
          setErr('that code didn’t land. try again.')
        }
      }
    } catch (error) {
      setErr(dryAuthError(error, 'that code didn’t work. try again.'))
    } finally {
      setBusy(false)
    }
  }

  const submitProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const h = handle.trim().toLowerCase()
    if (!HANDLE_RE.test(h)) {
      setErr('handles are 3 to 20 characters: lowercase letters, numbers, dots, underscores.')
      return
    }
    if (!hasArt && !hasWalls) {
      setErr('pick at least one.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      const roles = [...(hasArt ? ['artist'] : []), ...(hasWalls ? ['buyer'] : [])]
      const trimmedName = name.trim()
      await api.patchMe({ handle: h, ...(trimmedName ? { name: trimmedName } : {}), roles })
      setStep('done')
    } catch (error) {
      if (error instanceof ApiError && error.code === 'HANDLE_TAKEN') {
        setErr('that handle’s taken.')
      } else if (error instanceof ApiError) {
        setErr(error.message)
      } else {
        setErr('that didn’t save. try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  const eyebrowStep =
    step === 'email' ? '1 / 3' : step === 'code' ? '2 / 3' : step === 'profile' ? '3 / 3' : 'in.'

  return (
    <div className="join">
      <div className="noise" aria-hidden="true"></div>

      <header className="join-nav">
        <Link className="join-brand" to="/" aria-label="accessart">
          <Triangle size={20} />
          <span>art</span>
        </Link>
      </header>

      <main className="join-main">
        <div className="join-card">
          <div className="join-eyebrow">
            <span>{door === 'art' ? 'the art door.' : 'the walls door.'}</span>
            <span>{eyebrowStep}</span>
          </div>

          {step === 'email' ? (
            <>
              <h1 className="join-line">
                <span className="join-ohh">ohh,</span>{' '}
                <span className="join-shout">
                  {door === 'art' ? 'let’s get you in.' : 'let’s fill those walls.'}
                </span>
              </h1>
              <p className="join-copy">
                email first. we send a six digit code. no password, ever.
              </p>
              <form className="join-form" onSubmit={submitEmail}>
                <input
                  className="join-input"
                  type="email"
                  placeholder="your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                <button className="btn join-btn" type="submit" disabled={busy}>
                  {busy ? 'hold on.' : 'send the code'}
                </button>
                {err ? <p className="join-err">{err}</p> : null}
              </form>
            </>
          ) : null}

          {step === 'code' ? (
            <>
              <h1 className="join-line">
                <span className="join-shout">check your email.</span>
              </h1>
              <p className="join-copy">six digits, sent to {email.trim().toLowerCase()}.</p>
              <form className="join-form" onSubmit={submitCode}>
                <input
                  className="join-input join-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                />
                <button className="btn join-btn" type="submit" disabled={busy || code.length !== 6}>
                  {busy ? 'hold on.' : 'in.'}
                </button>
                <button
                  className="join-alt"
                  type="button"
                  onClick={() => {
                    setCode('')
                    setErr('')
                    setStep('email')
                  }}
                >
                  wrong email. go back.
                </button>
                {err ? <p className="join-err">{err}</p> : null}
              </form>
            </>
          ) : null}

          {step === 'profile' ? (
            <>
              <h1 className="join-line">
                <span className="join-ohh">so,</span>{' '}
                <span className="join-shout">who are you.</span>
              </h1>
              <p className="join-copy">
                a handle, a name, and which door you’re walking through. both is fine.
              </p>
              <form className="join-form" onSubmit={submitProfile}>
                <div className="join-field">
                  <label className="join-label" htmlFor="join-handle">
                    handle
                  </label>
                  <input
                    id="join-handle"
                    className="join-input"
                    placeholder="lower.case_only"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase())}
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                  />
                  {handle && !HANDLE_RE.test(handle) ? (
                    <p className="join-hint">
                      3 to 20 characters. lowercase letters, numbers, dots, underscores.
                    </p>
                  ) : null}
                </div>
                <div className="join-field">
                  <label className="join-label" htmlFor="join-name">
                    name
                  </label>
                  <input
                    id="join-name"
                    className="join-input"
                    placeholder="what we call you"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="join-chips">
                  <button
                    type="button"
                    className={`join-chip${hasArt ? ' join-chip--on' : ''}`}
                    onClick={() => setHasArt((v) => !v)}
                  >
                    i have art
                  </button>
                  <button
                    type="button"
                    className={`join-chip${hasWalls ? ' join-chip--on' : ''}`}
                    onClick={() => setHasWalls((v) => !v)}
                  >
                    i have walls
                  </button>
                </div>
                <button className="btn join-btn" type="submit" disabled={busy}>
                  {busy ? 'hold on.' : 'done.'}
                </button>
                {err ? <p className="join-err">{err}</p> : null}
              </form>
            </>
          ) : null}

          {step === 'done' ? (
            <>
              <h1 className="join-line">
                <span className="join-ohh">ohhh yeh.</span>{' '}
                <span className="join-shout">you’re in.</span>
              </h1>
              <p className="join-next">
                {hasArt ? 'next: your first upload. soon.' : 'next: the feed. soon.'}
              </p>
              <Link className="join-back" to="/">
                back to the front.
              </Link>
            </>
          ) : null}
        </div>
      </main>

      <footer className="join-foot">
        <span>rent it. swap it. buy it if it sticks.</span>
        <span>made in brisbane.</span>
      </footer>
    </div>
  )
}

export default Join
