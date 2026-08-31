import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { jsonResponse } from "../shared/http.mjs";
import { publicUrl } from "../shared/media.mjs";

const s3 = new S3Client({});
const BUCKET = process.env.MEDIA_BUCKET;
const EXPIRY_SECONDS = 900;

// The server picks the key and pins the content type into the signature; the
// client only ever chooses from this allowlist.
const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function post(ctx) {
  const contentType = String(ctx.body?.content_type ?? "");
  const ext = EXT_BY_TYPE[contentType];
  if (!ext) {
    return jsonResponse(400, {
      ok: false,
      error: "BAD_CONTENT_TYPE",
      message: "images only: jpeg, png or webp.",
    });
  }

  const key = `artworks/${ctx.user.sub}/${randomUUID()}.${ext}`;
  const upload_url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: EXPIRY_SECONDS }
  );

  return jsonResponse(200, {
    ok: true,
    data: { upload_url, key, public_url: publicUrl(key) },
  });
}
