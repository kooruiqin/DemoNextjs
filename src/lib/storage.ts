/**
 * File storage abstraction.
 *
 * Currently a placeholder — wire up Cloudflare R2 (or any S3-compatible
 * provider) when you actually need uploads.
 *
 * Rule: the @aws-sdk/client-s3 imports MUST stay inside this file.
 * Components should only call the named functions below.
 *
 * To enable R2:
 *   pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *   uncomment the implementation below
 *   fill R2_* in .env.local
 */

// import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { env } from "@/lib/env";

// const s3 = new S3Client({
//   region: "auto",
//   endpoint: env.R2_ENDPOINT!,
//   credentials: {
//     accessKeyId: env.R2_ACCESS_KEY_ID!,
//     secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
//   },
// });

export async function uploadFile(
  _key: string,
  _body: Buffer | Uint8Array,
  _contentType: string,
): Promise<string> {
  throw new Error("Storage not configured. See src/lib/storage.ts.");
  // await s3.send(new PutObjectCommand({
  //   Bucket: env.R2_BUCKET!,
  //   Key: _key,
  //   Body: _body,
  //   ContentType: _contentType,
  // }));
  // return `${env.R2_PUBLIC_URL}/${_key}`;
}

export async function getFileUrl(_key: string, _expiresIn = 3600): Promise<string> {
  throw new Error("Storage not configured. See src/lib/storage.ts.");
  // return getSignedUrl(
  //   s3,
  //   new GetObjectCommand({ Bucket: env.R2_BUCKET!, Key: _key }),
  //   { expiresIn: _expiresIn },
  // );
}

export async function deleteFile(_key: string): Promise<void> {
  throw new Error("Storage not configured. See src/lib/storage.ts.");
  // await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET!, Key: _key }));
}
