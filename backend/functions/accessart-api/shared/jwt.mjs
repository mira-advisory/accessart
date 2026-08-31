// Cognito ID token verification using Node 22 built-ins only (webcrypto +
// fetch). The Lambda deploys as a plain zip with no node_modules, so no
// jose / jsonwebtoken; RS256 via crypto.subtle is all we need.
import { webcrypto } from "node:crypto";

const REGION = process.env.AWS_REGION || "ap-southeast-2";
const POOL_ID = process.env.COGNITO_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}`;
const JWKS_URL = `${ISSUER}/.well-known/jwks.json`;
const RSA_ALG = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
const CLOCK_SKEW_SECONDS = 60;

// JWKS keys cached by kid for the life of the container; Cognito rotates keys
// rarely, so we re-fetch once when an unknown kid appears and otherwise trust
// the cache.
let keysByKid = null;

function b64urlToBytes(seg) {
  if (typeof seg !== "string" || !/^[A-Za-z0-9_-]+$/.test(seg)) return null;
  const b64 = seg.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  return new Uint8Array(Buffer.from(b64 + pad, "base64"));
}

function decodeJsonSegment(seg) {
  const bytes = b64urlToBytes(seg);
  if (!bytes) return null;
  try {
    return JSON.parse(Buffer.from(bytes).toString("utf8"));
  } catch {
    return null;
  }
}

async function fetchKeys() {
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error(`jwks fetch failed: ${res.status}`);
  const { keys } = await res.json();
  const map = new Map();
  for (const jwk of keys ?? []) {
    if (jwk.kty !== "RSA" || !jwk.kid) continue;
    map.set(jwk.kid, await webcrypto.subtle.importKey("jwk", jwk, RSA_ALG, false, ["verify"]));
  }
  return map;
}

async function getKey(kid) {
  if (!keysByKid) keysByKid = await fetchKeys();
  if (!keysByKid.has(kid)) keysByKid = await fetchKeys();
  return keysByKid.get(kid) ?? null;
}

// Verifies a Cognito ID token: RS256 signature against the pool's JWKS, then
// iss / aud / token_use / exp claims. Returns the payload object, or null on
// any failure; never throws to callers.
export async function verifyIdToken(token) {
  try {
    if (!POOL_ID || !CLIENT_ID || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const header = decodeJsonSegment(headerB64);
    if (!header || header.alg !== "RS256" || !header.kid) return null;
    const signature = b64urlToBytes(signatureB64);
    if (!signature) return null;

    const key = await getKey(header.kid);
    if (!key) return null;
    const signed = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const valid = await webcrypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, signed);
    if (!valid) return null;

    const payload = decodeJsonSegment(payloadB64);
    if (!payload) return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== ISSUER) return null;
    if (payload.aud !== CLIENT_ID) return null;
    if (payload.token_use !== "id") return null;
    if (typeof payload.exp !== "number" || payload.exp <= now - CLOCK_SKEW_SECONDS) return null;

    return payload;
  } catch (err) {
    console.error("verifyIdToken failed:", err);
    return null;
  }
}
