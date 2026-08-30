const CORS = {
  // Tighten to explicit app origins before launch.
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization,content-type",
  "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

export function getMethod(event) {
  return event?.requestContext?.http?.method ?? event?.httpMethod ?? "GET";
}

// HTTP API v2 prefixes rawPath with the stage name on non-$default stages
// (e.g. /staging/health) — strip it so routing sees the same path in every env.
export function getPath(event) {
  let path = event?.rawPath ?? event?.path ?? "/";
  const stage = event?.requestContext?.stage;
  if (stage && stage !== "$default" && path.startsWith(`/${stage}/`)) {
    path = path.slice(stage.length + 1);
  }
  return path;
}

export function parseBody(event) {
  if (!event?.body) return null;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json", ...CORS },
    body: body === null ? "" : JSON.stringify(body),
  };
}
