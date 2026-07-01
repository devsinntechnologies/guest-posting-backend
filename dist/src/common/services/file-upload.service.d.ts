import { ConfigService } from '@nestjs/config';
export interface UploadedFile {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
}
export declare class FileUploadService {
    private config;
    constructor(config: ConfigService);
    validateFile(file: Express.Multer.File): void;
    saveFile(file: Express.Multer.File): Promise<UploadedFile>;
    private saveLocal;
}
