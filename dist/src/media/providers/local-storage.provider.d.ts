import { ConfigService } from '@nestjs/config';
import { StorageProvider, UploadResult } from '../interfaces/storage-provider.interface';
export declare class LocalStorageProvider implements StorageProvider {
    private readonly config;
    private readonly uploadPath;
    private readonly baseUrl;
    constructor(config: ConfigService);
    upload(file: Express.Multer.File): Promise<UploadResult>;
    delete(storageKey: string): Promise<void>;
    getUrl(storageKey: string): string;
}
