// The single code-based API. Every route is dispatched here, in code:
// adding a route NEVER means editing API Gateway (CLAUDE.md rule 1).
// Public routes resolve ABOVE the identity gate; authed routes below it.
import { jsonResponse, getMethod, getPath, parseBody } from "./shared/http.mjs";
import { resolveIdentity } from "./shared/identity.mjs";
import * as health from "./routes/health.mjs";
import * as waitlist from "./routes/waitlist.mjs";

export async function handleHttp(event) {
  const method = getMethod(event);
  const path = getPath(event);

  if (method === "OPTIONS") return jsonResponse(204, null);

  const ctx = {
    event,
    method,
    path,
    qs: event.queryStringParameters ?? {},
    body: parseBody(event),
    user: null,
  };

  // ---------- public routes ----------
  if (method === "GET" && path === "/health") return health.get(ctx);
  if (method === "POST" && path === "/waitlist") return waitlist.post(ctx);

  // ---------- identity gate ----------
  const identity = await resolveIdentity(event);
  if (!identity) {
    return jsonResponse(401, { ok: false, error: "UNAUTHORIZED", message: "Sign in required" });
  }
  ctx.user = identity;

  // ---------- authed routes ----------
  // (added as they're built: /me, /uploads/presign, /artworks, /feed, ...)

  return jsonResponse(404, { ok: false, error: "NOT_FOUND", message: `No route for ${method} ${path}` });
}
