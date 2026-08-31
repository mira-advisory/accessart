import { randomUUID } from "node:crypto";
import { jsonResponse } from "../shared/http.mjs";
import { withImageUrls } from "../shared/media.mjs";
import { getUser } from "../stores/users.mjs";
import {
  createArtwork,
  getArtwork,
  listByArtist,
  listByMarket,
  updateArtwork,
} from "../stores/artworks.mjs";

const MEDIUMS = ["painting", "print", "photography", "digital", "mixed", "other"];
const CREATE_STATUSES = ["listed", "draft"];
const PATCH_STATUSES = ["listed", "draft", "retired"];
const RENT_SHARE = 0.05;
const MIN_VALUE_CENTS = 10000;
const MIN_RENTABLE_VALUE_CENTS = 25000;
const MAX_IMAGES = 6;

function bad(error, message) {
  return jsonResponse(400, { ok: false, error, message });
}

function notFound() {
  return jsonResponse(404, { ok: false, error: "NOT_FOUND", message: "no such artwork." });
}

// Validates whichever writable fields the body provides, writing cleaned
// values into fields. Returns an error response, or null when all are valid.
// Allowed statuses differ: create can't retire a piece that never existed.
function validateFields(body, fields, statuses) {
  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (title.length < 1 || title.length > 120) {
      return bad("INVALID_TITLE", "titles are 1 to 120 characters.");
    }
    fields.title = title;
  }
  if (body.story !== undefined) {
    // The story is required product policy: every piece gets one.
    const story = String(body.story).trim();
    if (story.length < 1 || story.length > 2000) {
      return bad("INVALID_STORY", "every piece needs a story: 1 to 2000 characters.");
    }
    fields.story = story;
  }
  if (body.medium !== undefined) {
    if (!MEDIUMS.includes(body.medium)) {
      return bad("INVALID_MEDIUM", `medium must be one of: ${MEDIUMS.join(", ")}.`);
    }
    fields.medium = body.medium;
  }
  for (const side of ["width_cm", "height_cm"]) {
    if (body[side] === undefined) continue;
    if (!Number.isInteger(body[side]) || body[side] < 1 || body[side] > 1000) {
      return bad("INVALID_SIZE", "width_cm and height_cm are whole centimetres, 1 to 1000.");
    }
    fields[side] = body[side];
  }
  if (body.value_cents !== undefined) {
    if (!Number.isInteger(body.value_cents) || body.value_cents < MIN_VALUE_CENTS) {
      return bad("INVALID_VALUE", "value_cents is a whole number of cents, minimum $100.");
    }
    fields.value_cents = body.value_cents;
  }
  if (body.rentable !== undefined) {
    if (typeof body.rentable !== "boolean") {
      return bad("INVALID_RENTABLE", "rentable is true or false.");
    }
    fields.rentable = body.rentable;
  }
  if (body.status !== undefined) {
    if (!statuses.includes(body.status)) {
      return bad("INVALID_STATUS", `status must be one of: ${statuses.join(", ")}.`);
    }
    fields.status = body.status;
  }
  return null;
}

// The rent floor is cross-field: check it against the merged record so a
// patch can't sneak a rentable piece under $250 from either side.
function rentFloorError(fields, existing) {
  const rentable = fields.rentable ?? existing?.rentable ?? false;
  const valueCents = fields.value_cents ?? existing?.value_cents ?? 0;
  if (rentable && valueCents < MIN_RENTABLE_VALUE_CENTS) {
    return bad("RENT_MIN", "rentable pieces start at $250.");
  }
  return null;
}

export async function create(ctx) {
  const user = await getUser(ctx.user.sub);
  if (!user?.roles?.includes("artist")) {
    return jsonResponse(403, {
      ok: false,
      error: "NOT_AN_ARTIST",
      message: "grab the artist role first.",
    });
  }

  const body = ctx.body ?? {};
  const required = [
    "title",
    "story",
    "medium",
    "width_cm",
    "height_cm",
    "value_cents",
    "rentable",
    "image_keys",
  ];
  for (const field of required) {
    if (body[field] === undefined) return bad("MISSING_FIELD", `${field} is required.`);
  }

  const fields = {};
  const invalid = validateFields(body, fields, CREATE_STATUSES);
  if (invalid) return invalid;
  const underFloor = rentFloorError(fields, null);
  if (underFloor) return underFloor;

  // Keys must come from this artist's own presigned uploads.
  const prefix = `artworks/${ctx.user.sub}/`;
  const imageKeys = body.image_keys;
  if (
    !Array.isArray(imageKeys) ||
    imageKeys.length < 1 ||
    imageKeys.length > MAX_IMAGES ||
    !imageKeys.every((k) => typeof k === "string" && k.startsWith(prefix))
  ) {
    return bad("BAD_IMAGE", "image_keys must be 1 to 6 keys from your own uploads.");
  }

  const artwork = {
    artwork_id: randomUUID(),
    artist_id: ctx.user.sub,
    market_id: user.market_id,
    title: fields.title,
    story: fields.story,
    medium: fields.medium,
    width_cm: fields.width_cm,
    height_cm: fields.height_cm,
    value_cents: fields.value_cents,
    currency: "AUD",
    rent_month_cents: Math.round(fields.value_cents * RENT_SHARE),
    rentable: fields.rentable,
    status: fields.status ?? "listed",
    custody: "with_artist",
    image_keys: imageKeys,
    created_at: new Date().toISOString(),
  };
  await createArtwork(artwork);
  return jsonResponse(200, { ok: true, data: withImageUrls(artwork) });
}

export async function mine(ctx) {
  const items = await listByArtist(ctx.user.sub);
  return jsonResponse(200, { ok: true, items: items.map(withImageUrls), next_key: null });
}

// Public detail. Drafts and retired pieces 404 for everyone but their owner;
// ctx.user is optionally-resolved identity here, null for anonymous callers.
export async function getPublic(ctx, id) {
  const artwork = await getArtwork(id);
  if (!artwork) return notFound();
  if (artwork.status !== "listed" && artwork.artist_id !== ctx.user?.sub) return notFound();
  // The piece page shows a by-line; join the artist's handle in at read time.
  const artist = await getUser(artwork.artist_id);
  return jsonResponse(200, {
    ok: true,
    data: { ...withImageUrls(artwork), artist_handle: artist?.handle ?? null },
  });
}

export async function listPublic(ctx) {
  const marketId = String(ctx.qs.market ?? "").trim();
  if (!marketId) {
    return bad("MISSING_MARKET", "pass ?market= to browse a market's artworks.");
  }
  const items = await listByMarket(marketId);
  return jsonResponse(200, { ok: true, items: items.map(withImageUrls), next_key: null });
}

export async function patch(ctx, id) {
  const artwork = await getArtwork(id);
  // Owner-only; a plain 404 confirms nothing about the piece to outsiders.
  if (!artwork || artwork.artist_id !== ctx.user.sub) return notFound();

  const body = ctx.body ?? {};
  const fields = {};
  const invalid = validateFields(body, fields, PATCH_STATUSES);
  if (invalid) return invalid;
  const underFloor = rentFloorError(fields, artwork);
  if (underFloor) return underFloor;

  if (fields.value_cents !== undefined) {
    fields.rent_month_cents = Math.round(fields.value_cents * RENT_SHARE);
  }

  const updated = await updateArtwork(id, fields);
  return jsonResponse(200, { ok: true, data: withImageUrls(updated) });
}
