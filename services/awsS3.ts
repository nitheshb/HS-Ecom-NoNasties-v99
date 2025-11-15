/**
 * AWS S3 Operations
 * 
 * This file contains all S3-related operations:
 * - File upload
 * - File deletion
 * - File listing
 */

import { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// ENVIRONMENT VALIDATION
// ============================================

const validateEnv = () => {
  const required = [
    'NEXT_PUBLIC_AWS_REGION',
    'NEXT_PUBLIC_AWS_ACCESS_KEY_ID',
    'NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY',
    'NEXT_PUBLIC_S3_BUCKET_NAME'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// ============================================
// S3 CLIENT
// ============================================

const getS3Client = () => {
  validateEnv();

  return new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
    }
  });
};

export const s3BaseUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/`;

// ============================================
// S3 OPERATIONS
// ============================================

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '', 10) || 2 * 1024 * 1024; // Default to 2MB

/**
 * Upload file to S3
 */
export const uploadToS3 = async (file: File, type = 'users') => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
  }

  const s3Client = getS3Client();
  const key = `${type}/${uuidv4()}-${file.name}`;

  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `${s3BaseUrl}${key}`;
  } catch (error: unknown) {
    console.error('S3 Upload Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    throw new Error('Failed to upload file: Unknown error');
  }
};

/**
 * List files from S3
 */
export const listFromS3 = async (params: { type?: string; prefix?: string }) => {
  const s3Client = getS3Client();
  const { type, prefix } = params;
  const commandParams = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Prefix: prefix || type || '',
    MaxKeys: 1000
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(commandParams));

    if (!data.Contents || data.Contents.length === 0) {
      return [];
    }

    return data.Contents.map(item => ({
      Key: item.Key,
      LastModified: item.LastModified,
      Size: item.Size,
      Url: `${s3BaseUrl}${item.Key}`
    }));
  } catch (error) {
    console.error('S3 List Error:', error);
    throw new Error('Failed to list files from S3.');
  }
};

/**
 * Delete files from S3
 */
export const deleteFromS3 = async (params: { urls: string[] }) => {
  const s3Client = getS3Client();

  const { urls } = params;

  if (!Array.isArray(urls)) {
    throw new Error('Invalid delete parameters. "urls" should be an array.');
  }

  const validUrls = urls.filter(url => typeof url === 'string' && url.trim() !== '');

  if (validUrls.length === 0) {
    return [];
  }

  try {
    await Promise.all(
      validUrls.map(async (url) => {
        if (!url) {
          return;
        }
        const key = url.replace(s3BaseUrl, '');
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
          Key: key,
        }));
      })
    );

    return validUrls;
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete files from S3.');
  }
};

