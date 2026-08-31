import { jsonResponse } from "../shared/http.mjs";
import { withImageUrls } from "../shared/media.mjs";
import { getUserByHandle } from "../stores/users.mjs";
import { listByArtist } from "../stores/artworks.mjs";

// Public artist page: the profile plus their listed work, newest first.
// Only public profile fields leave here; never email, never roles.
export async function getByHandle(ctx, handle) {
  const user = await getUserByHandle(String(handle).toLowerCase());
  if (!user) {
    return jsonResponse(404, { ok: false, error: "NOT_FOUND", message: "no such artist." });
  }

  const artworks = (await listByArtist(user.user_id))
    .filter((a) => a.status === "listed")
    .map(withImageUrls);

  return jsonResponse(200, {
    ok: true,
    data: {
      artist: { user_id: user.user_id, handle: user.handle, name: user.name ?? null },
      artworks,
    },
  });
}
