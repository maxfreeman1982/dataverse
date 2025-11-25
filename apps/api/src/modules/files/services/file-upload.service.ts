import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as sharp from 'sharp';
import * as path from 'path';
import * as crypto from 'crypto';

export enum FileCategory {
  KYC_DOCUMENT = 'kyc-documents',
  PROJECT_IMAGE = 'project-images',
  PROJECT_DOCUMENT = 'project-documents',
  PROFILE_PICTURE = 'profile-pictures',
  REPORT = 'reports',
  CONTRACT = 'contracts',
  CERTIFICATE = 'certificates',
}

export interface UploadedFile {
  key: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  category: FileCategory;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  // File size limits (in bytes)
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // Allowed file types
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'eu-west-1');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (accessKeyId && secretAccessKey && this.bucketName) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('S3 client initialized successfully');
    } else {
      this.logger.warn('AWS S3 credentials not configured. File upload service disabled.');
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    file: Express.Multer.File,
    category: FileCategory,
  ): void {
    // Check file size
    const maxSize = this.isImageCategory(category)
      ? this.MAX_IMAGE_SIZE
      : this.MAX_FILE_SIZE;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`,
      );
    }

    // Check file type
    const allowedTypes = this.isImageCategory(category)
      ? this.ALLOWED_IMAGE_TYPES
      : [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOCUMENT_TYPES];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  private isImageCategory(category: FileCategory): boolean {
    return [
      FileCategory.PROJECT_IMAGE,
      FileCategory.PROFILE_PICTURE,
    ].includes(category);
  }

  /**
   * Generate unique file key
   */
  private generateFileKey(
    filename: string,
    category: FileCategory,
    userId?: string,
  ): string {
    const ext = path.extname(filename);
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const prefix = userId ? `${userId}/` : '';
    return `${category}/${prefix}${timestamp}-${hash}${ext}`;
  }

  /**
   * Optimize image before upload
   */
  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } catch (error) {
      this.logger.error('Image optimization failed:', error);
      return buffer; // Return original if optimization fails
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    category: FileCategory,
    userId?: string,
  ): Promise<UploadedFile> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized. Check AWS credentials.');
    }

    // Validate file
    this.validateFile(file, category);

    // Generate unique key
    const key = this.generateFileKey(file.originalname, category, userId);

    // Optimize image if applicable
    let buffer = file.buffer;
    if (this.isImageCategory(category) && this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      buffer = await this.optimizeImage(buffer);
    }

    try {
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: userId || 'anonymous',
          category: category,
        },
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        key,
        url,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: buffer.length,
        category,
      };
    } catch (error) {
      this.logger.error('S3 upload failed:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    category: FileCategory,
    userId?: string,
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, category, userId),
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error('S3 delete failed:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error('Failed to generate signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Upload KYC document
   */
  async uploadKYCDocument(
    file: Express.Multer.File,
    userId: string,
    documentType: string,
  ): Promise<UploadedFile> {
    const result = await this.uploadFile(file, FileCategory.KYC_DOCUMENT, userId);
    this.logger.log(`KYC document uploaded for user ${userId}: ${documentType}`);
    return result;
  }

  /**
   * Upload project image
   */
  async uploadProjectImage(
    file: Express.Multer.File,
    projectId: string,
  ): Promise<UploadedFile> {
    return await this.uploadFile(file, FileCategory.PROJECT_IMAGE, projectId);
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadedFile> {
    // Delete old profile picture if exists
    // This would require tracking the old key in the database
    return await this.uploadFile(file, FileCategory.PROFILE_PICTURE, userId);
  }

  /**
   * Upload contract or certificate
   */
  async uploadLegalDocument(
    file: Express.Multer.File,
    category: FileCategory.CONTRACT | FileCategory.CERTIFICATE,
    entityId: string,
  ): Promise<UploadedFile> {
    return await this.uploadFile(file, category, entityId);
  }
}
