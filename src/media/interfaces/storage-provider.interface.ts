import { Express } from 'express';

export interface UploadResult {
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  storageProvider: string;
  width?: number;
  height?: number;
}

/**
 * Storage provider abstraction.
 * Swap implementations without touching service logic.
 */
export interface StorageProvider {
  /**
   * Upload a file and return upload metadata.
   */
  upload(file: Express.Multer.File): Promise<UploadResult>;

  /**
   * Delete a file by its storage key.
   */
  delete(storageKey: string): Promise<void>;

  /**
   * Build the public URL from a storage key.
   */
  getUrl(storageKey: string): string;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
