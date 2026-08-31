// Public media URLs are always derived from S3 keys at read time, never
// stored: a bucket or region move must not strand old rows.
const REGION = process.env.AWS_REGION || "ap-southeast-2";
const BUCKET = process.env.MEDIA_BUCKET;

export function publicUrl(key) {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

export function withImageUrls(artwork) {
  return { ...artwork, image_urls: (artwork.image_keys ?? []).map(publicUrl) };
}
