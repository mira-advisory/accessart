import { Amplify } from 'aws-amplify'

const poolId = import.meta.env.VITE_COGNITO_POOL_ID as string | undefined
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined

// false when either env var is missing; pages check this before touching auth.
export const authConfigured: boolean = Boolean(poolId && clientId)

let done = false

// Called once from main.tsx. A missing or bad config must never crash the
// landing page, so this is a silent no-op when env vars are absent.
export function configureAuth(): void {
  if (done || !poolId || !clientId) return
  done = true
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: poolId,
          userPoolClientId: clientId,
        },
      },
    })
  } catch {
    // never take the page down over auth config
  }
}
