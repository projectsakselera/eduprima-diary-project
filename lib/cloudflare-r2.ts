import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  etag?: string;
  error?: string;
}

interface DeleteResult {
  success: boolean;
  error?: string;
}

interface SignedUrlResult {
  success: boolean;
  url?: string;
  error?: string;
}

class CloudflareR2Client {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    // Validate required environment variables
    if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
      throw new Error('CLOUDFLARE_R2_ACCESS_KEY_ID environment variable is required');
    }
    if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
      throw new Error('CLOUDFLARE_R2_SECRET_ACCESS_KEY environment variable is required');
    }
    if (!process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      throw new Error('CLOUDFLARE_R2_BUCKET_NAME environment variable is required');
    }
    if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
      throw new Error('CLOUDFLARE_R2_ENDPOINT environment variable is required');
    }
    if (!process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      throw new Error('CLOUDFLARE_R2_PUBLIC_URL environment variable is required');
    }

    this.client = new S3Client({
      region: 'auto', // Cloudflare R2 uses 'auto' region
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
      // Force path style for R2 compatibility
      forcePathStyle: true,
    });
    
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  }

  /**
   * Upload a file to Cloudflare R2
   * @param key - The file path/key in the bucket
   * @param file - File or Buffer to upload
   * @param contentType - MIME type of the file
   * @param options - Additional upload options
   */
  async uploadFile(
    key: string, 
    file: File | Buffer, 
    contentType?: string,
    options?: {
      cacheControl?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<UploadResult> {
    try {
      console.log(`🔄 R2: Uploading file to key: ${key}`);
      
      // Determine content type
      let finalContentType = contentType;
      if (!finalContentType && file instanceof File) {
        finalContentType = file.type || 'application/octet-stream';
      }
      if (!finalContentType) {
        finalContentType = 'application/octet-stream';
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: finalContentType,
        CacheControl: options?.cacheControl || 'public, max-age=31536000', // 1 year cache by default
        Metadata: options?.metadata || {},
      });

      const result = await this.client.send(command);
      const publicUrl = this.getPublicUrl(key);
      
      console.log(`✅ R2: Upload successful for key: ${key}`);
      console.log(`🔗 R2: Public URL: ${publicUrl}`);
      
      return {
        success: true,
        key,
        url: publicUrl,
        etag: result.ETag
      };
    } catch (error) {
      console.error('❌ R2 Upload Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete a file from Cloudflare R2
   * @param key - The file path/key to delete
   */
  async deleteFile(key: string): Promise<DeleteResult> {
    try {
      console.log(`🗑️ R2: Deleting file with key: ${key}`);
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
      console.log(`✅ R2: Delete successful for key: ${key}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ R2 Delete Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Generate a signed URL for private file access
   * @param key - The file path/key
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<SignedUrlResult> {
    try {
      console.log(`🔐 R2: Generating signed URL for key: ${key}, expires in: ${expiresIn}s`);
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
      console.log(`✅ R2: Signed URL generated for key: ${key}`);
      
      return { success: true, url: signedUrl };
    } catch (error) {
      console.error('❌ R2 Signed URL Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate signed URL'
      };
    }
  }

  /**
   * Get the public URL for a file
   * @param key - The file path/key
   */
  getPublicUrl(key: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return `${this.publicUrl}/${cleanKey}`;
  }

  /**
   * Check if the R2 client is properly configured
   */
  isConfigured(): boolean {
    try {
      return !!(
        process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
        process.env.CLOUDFLARE_R2_BUCKET_NAME &&
        process.env.CLOUDFLARE_R2_ENDPOINT &&
        process.env.CLOUDFLARE_R2_PUBLIC_URL
      );
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique filename with timestamp and random suffix
   * @param originalName - Original filename
   * @param prefix - Optional prefix for the filename
   */
  generateUniqueFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const name = originalName.replace(/\.[^/.]+$/, ""); // Remove extension
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '-'); // Replace special chars with dash
    
    const parts = [
      prefix,
      safeName,
      timestamp,
      random
    ].filter(Boolean);
    
    return `${parts.join('-')}.${extension}`;
  }
}

// Export singleton instance
export const r2Client = new CloudflareR2Client();

// Export class for testing or custom instances
export { CloudflareR2Client };

// Export types
export type { UploadResult, DeleteResult, SignedUrlResult };