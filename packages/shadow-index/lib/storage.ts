/**
 * R2 storage module (Sprint 3 — MVP-03)
 *
 * Cloudflare R2 via S3-compatible API. Used when STORAGE_MODE=r2.
 * Local file system remains the default (STORAGE_MODE=local or unset).
 *
 * AWS SDK is loaded lazily to avoid bloating cold-start on Vercel.
 */

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? process.env.CLOUDFLARE_R2_BUCKET;
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

/** Whether R2 is configured (all required env vars set). */
export function isR2Configured(): boolean {
  return Boolean(
    accountId &&
      accessKeyId &&
      secretAccessKey &&
      bucketName &&
      publicUrl &&
      publicUrl.length > 0
  );
}

async function getClient() {
  const { S3Client } = await import('@aws-sdk/client-s3');
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured (CLOUDFLARE_R2_ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY)');
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Upload .thing bytes to R2. Key: things/{hash}.thing
 * @returns Public URL of the uploaded object
 */
export async function uploadThing(hash: string, data: Buffer): Promise<string> {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const bucket = bucketName ?? process.env.CLOUDFLARE_R2_BUCKET;
  if (!bucket || !publicUrl) {
    throw new Error('R2 bucket or public URL not configured');
  }
  const key = `things/${hash}.thing`;
  const client = await getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: 'application/octet-stream',
    })
  );
  const base = publicUrl.replace(/\/$/, '');
  return `${base}/${key}`;
}

/**
 * Upload image bytes to R2. Key: images/{hash}.{ext}
 * @returns Public URL of the uploaded object
 */
export async function uploadImage(
  hash: string,
  imageData: Buffer,
  mimeType: string
): Promise<string> {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const bucket = bucketName ?? process.env.CLOUDFLARE_R2_BUCKET;
  if (!bucket || !publicUrl) {
    throw new Error('R2 bucket or public URL not configured');
  }
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const key = `images/${hash}.${ext}`;
  const client = await getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: imageData,
      ContentType: mimeType,
    })
  );
  const base = publicUrl.replace(/\/$/, '');
  return `${base}/${key}`;
}

/**
 * Get .thing bytes from R2. Returns null if key does not exist.
 */
export async function getThing(hash: string): Promise<Buffer | null> {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const bucket = bucketName ?? process.env.CLOUDFLARE_R2_BUCKET;
  if (!bucket) {
    throw new Error('R2 bucket not configured');
  }
  const key = `things/${hash}.thing`;
  const client = await getClient();
  try {
    const result = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    if (!result.Body) return null;
    const bytes = await result.Body.transformToByteArray();
    return Buffer.from(bytes);
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'name' in err ? (err as { name: string }).name : '';
    if (code === 'NoSuchKey') return null;
    throw err;
  }
}

/**
 * Lightweight R2 connectivity check via HeadBucket.
 */
export async function checkR2Health(): Promise<boolean> {
  const { HeadBucketCommand } = await import('@aws-sdk/client-s3');
  const bucket = bucketName ?? process.env.CLOUDFLARE_R2_BUCKET;
  if (!bucket) return false;
  try {
    const client = await getClient();
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    return true;
  } catch {
    return false;
  }
}
