import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface UploadedFile {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class FileUploadService {
  constructor(private config: ConfigService) {}

  validateFile(file: Express.Multer.File): void {
    const maxSize =
      (this.config.get<number>('UPLOAD_MAX_SIZE_MB') || 5) * 1024 * 1024;

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type. Allowed: ${ALLOWED_MIMES.join(', ')}`,
      );
    }
    if (file.size > maxSize) {
      throw new Error(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
    }
  }

  async saveFile(file: Express.Multer.File): Promise<UploadedFile> {
    this.validateFile(file);

    const storage = this.config.get<string>('UPLOAD_STORAGE') || 'local';

    if (storage === 'local') {
      return Promise.resolve(this.saveLocal(file));
    }

    return Promise.resolve(this.saveLocal(file));
  }

  private saveLocal(file: Express.Multer.File): UploadedFile {
    const uploadPath =
      this.config.get<string>('UPLOAD_LOCAL_PATH') || './uploads';
    const appUrl =
      this.config.get<string>('APP_URL') || 'http://localhost:3000';

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(uploadPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      url: `${appUrl}/uploads/${filename}`,
      filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
