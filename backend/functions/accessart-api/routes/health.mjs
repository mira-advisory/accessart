import { jsonResponse } from "../shared/http.mjs";

export function get() {
  return jsonResponse(200, {
    ok: true,
    service: "accessart-api",
    time: new Date().toISOString(),
  });
}
