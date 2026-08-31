import { jsonResponse } from "../shared/http.mjs";
import { getUser, createUser, updateUser, reserveHandle, releaseHandle } from "../stores/users.mjs";

const HANDLE_RE = /^[a-z0-9_.]{3,20}$/;
const RESERVED_HANDLES = new Set(["art", "walls", "admin", "accessart", "api", "join", "me"]);
const GRANTABLE_ROLES = ["artist", "buyer"];

// Loads the caller's user row, provisioning it on first authed request.
// Keyed by the verified Cognito sub (a UUID), so a handle reservation row
// ("handle#<handle>") can never be returned here.
async function loadOrCreateUser(ctx) {
  const existing = await getUser(ctx.user.sub);
  if (existing) return existing;
  return createUser({ user_id: ctx.user.sub, email: ctx.user.email });
}

export async function get(ctx) {
  const user = await loadOrCreateUser(ctx);
  return jsonResponse(200, { ok: true, data: user });
}

export async function patch(ctx) {
  const user = await loadOrCreateUser(ctx);
  const body = ctx.body ?? {};
  const fields = {};

  if (body.handle !== undefined) {
    const handle = String(body.handle).trim().toLowerCase();
    if (!HANDLE_RE.test(handle) || RESERVED_HANDLES.has(handle)) {
      return jsonResponse(400, {
        ok: false,
        error: "INVALID_HANDLE",
        message: "handles are 3 to 20 characters: letters, numbers, dots, underscores.",
      });
    }
    if (handle !== user.handle) {
      const reserved = await reserveHandle(handle, user.user_id);
      if (!reserved) {
        return jsonResponse(409, {
          ok: false,
          error: "HANDLE_TAKEN",
          message: "that handle is taken.",
        });
      }
      if (user.handle) await releaseHandle(user.handle, user.user_id);
      fields.handle = handle;
    }
  }

  if (body.name !== undefined) {
    fields.name = String(body.name).trim().slice(0, 80);
  }

  // Roles only ever grow, and only to self-assignable ones; venue and
  // operator are granted elsewhere (CLAUDE.md rule 4).
  if (Array.isArray(body.roles)) {
    const merged = new Set(user.roles ?? []);
    for (const role of body.roles) {
      if (GRANTABLE_ROLES.includes(role)) merged.add(role);
    }
    fields.roles = [...merged];
  }

  const updated = await updateUser(user.user_id, fields);
  return jsonResponse(200, { ok: true, data: updated });
}
