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
export interface StorageProvider {
    upload(file: Express.Multer.File): Promise<UploadResult>;
    delete(storageKey: string): Promise<void>;
    getUrl(storageKey: string): string;
}
export declare const STORAGE_PROVIDER: unique symbol;
