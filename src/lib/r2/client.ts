import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
});

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME || '',
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME || '',
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Public CDN URL for non-protected assets (artwork, 30-sec previews).
 * Private assets (full tracks, stems) must use getPresignedDownloadUrl instead.
 */
export function getPublicR2Url(key: string): string {
  const accountId = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID;
  const bucket = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;
  // Custom domain pattern: configure a Cloudflare R2 custom domain in the dashboard
  // pointing pub.djmexxico.com → the R2 bucket for zero-egress public CDN.
  const customDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
  if (customDomain) {
    return `https://${customDomain}/${key}`;
  }
  // Fallback: Cloudflare R2 public URL (requires bucket to have public access enabled)
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
}
