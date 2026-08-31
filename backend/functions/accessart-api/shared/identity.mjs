// Identity: the Cognito ID token (verified in shared/jwt.mjs) proves WHO;
// the users table decides WHAT they may do: a roles set on one user record:
// buyer / artist / venue / operator (future: delivery_agent). CLAUDE.md
// rule 4. Roles are never read from JWT claims; routes load them from
// stores/users.mjs.
import { verifyIdToken } from "./jwt.mjs";

export async function resolveIdentity(event) {
  // HTTP API v2 lowercases header names; tolerate Authorization anyway.
  const header = event?.headers?.authorization ?? event?.headers?.Authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;

  const payload = await verifyIdToken(match[1]);
  if (!payload?.sub) return null;
  return {
    sub: payload.sub,
    email: payload.email ?? null,
    emailVerified: !!payload.email_verified,
  };
}
