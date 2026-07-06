import { FileUploadService } from '../common/services/file-upload.service';
export declare class MediaController {
    private fileUploadService;
    constructor(fileUploadService: FileUploadService);
    upload(file: Express.Multer.File): Promise<import("../common/services/file-upload.service").UploadedFile>;
}
