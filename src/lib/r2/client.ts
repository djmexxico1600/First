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

export function getPublicR2Url(key: string): string {
  return `https://${process.env.NEXT_PUBLIC_R2_BUCKET_NAME}.cdn.example.com/${key}`;
}
