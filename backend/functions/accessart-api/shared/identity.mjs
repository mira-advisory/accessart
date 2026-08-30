// Identity: the JWT (verified by the gateway's Lambda authorizer) proves WHO;
// the users table decides WHAT they may do: a roles set on one user record:
// buyer / artist / venue / operator (future: delivery_agent). CLAUDE.md rule 4.
//
// Placeholder until Cognito + the users table exist: reads the authorizer
// context and returns a minimal identity with no roles.
export async function resolveIdentity(event) {
  const authz = event?.requestContext?.authorizer?.lambda ?? null;
  if (!authz?.sub) return null;
  // TODO: load the users row by sub; attach roles set + market context.
  return { sub: authz.sub, email: authz.email ?? null, roles: [] };
}
