// The single code-based API. Every route is dispatched here, in code:
// adding a route NEVER means editing API Gateway (CLAUDE.md rule 1).
// Public routes resolve ABOVE the identity gate; authed routes below it.
import { jsonResponse, getMethod, getPath, parseBody } from "./shared/http.mjs";
import { resolveIdentity } from "./shared/identity.mjs";
import * as health from "./routes/health.mjs";
import * as waitlist from "./routes/waitlist.mjs";
import * as me from "./routes/me.mjs";
import * as uploads from "./routes/uploads.mjs";
import * as artworks from "./routes/artworks.mjs";
import * as artists from "./routes/artists.mjs";

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
  if (method === "GET" && path === "/artworks") return artworks.listPublic(ctx);

  if (method === "GET") {
    const artistMatch = /^\/artists\/([A-Za-z0-9_.]+)$/.exec(path);
    if (artistMatch) return artists.getByHandle(ctx, artistMatch[1]);

    // /artworks/mine is authed and dispatches below the gate.
    const artworkMatch = /^\/artworks\/([A-Za-z0-9-]+)$/.exec(path);
    if (artworkMatch && artworkMatch[1] !== "mine") {
      // Identity is optional on this route only: owners may view their own
      // draft or retired pieces; anonymous callers get a 404, never a 401.
      ctx.user = await resolveIdentity(event);
      return artworks.getPublic(ctx, artworkMatch[1]);
    }
  }

  // ---------- identity gate ----------
  const identity = await resolveIdentity(event);
  if (!identity) {
    return jsonResponse(401, { ok: false, error: "UNAUTHORIZED", message: "Sign in required" });
  }
  ctx.user = identity;

  // ---------- authed routes ----------
  if (method === "GET" && path === "/me") return me.get(ctx);
  if (method === "PATCH" && path === "/me") return me.patch(ctx);
  if (method === "POST" && path === "/uploads/presign") return uploads.post(ctx);
  if (method === "POST" && path === "/artworks") return artworks.create(ctx);
  if (method === "GET" && path === "/artworks/mine") return artworks.mine(ctx);
  if (method === "PATCH") {
    const artworkMatch = /^\/artworks\/([A-Za-z0-9-]+)$/.exec(path);
    if (artworkMatch) return artworks.patch(ctx, artworkMatch[1]);
  }
  // (added as they're built: /feed, /rentals, /swaps, ...)

  return jsonResponse(404, { ok: false, error: "NOT_FOUND", message: `No route for ${method} ${path}` });
}
