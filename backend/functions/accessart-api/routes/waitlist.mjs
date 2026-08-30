import { jsonResponse } from "../shared/http.mjs";
import { addToWaitlist } from "../stores/waitlist.mjs";

export async function post(ctx) {
  const email = String(ctx.body?.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return jsonResponse(400, {
      ok: false,
      error: "INVALID_EMAIL",
      message: "that email doesn't look right.",
    });
  }

  const doorsIn = Array.isArray(ctx.body?.doors) ? ctx.body.doors : [];
  const doors = doorsIn.filter((d) => d === "art" || d === "walls");

  await addToWaitlist({ email, doors, source: "landing" });
  return jsonResponse(200, { ok: true, data: { email } });
}
