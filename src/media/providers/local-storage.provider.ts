import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Express } from 'express';
import {
  StorageProvider,
  UploadResult,
} from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.uploadPath =
      config.get<string>('UPLOAD_LOCAL_PATH') || './uploads';
    this.baseUrl =
      config.get<string>('APP_BASE_URL') || 'http://localhost:3000';
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const uniqueName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const destDir = path.join(process.cwd(), this.uploadPath);
    const destPath = path.join(destDir, uniqueName);

    // Ensure upload directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(destPath, file.buffer);

    return {
      fileName: uniqueName,
      originalName: file.originalname,
      url: this.getUrl(uniqueName),
      mimeType: file.mimetype,
      fileSize: file.size,
      storageKey: uniqueName,
      storageProvider: 'local',
    };
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(process.cwd(), this.uploadPath, storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(storageKey: string): string {
    return `${this.baseUrl}/uploads/${storageKey}`;
  }
}
