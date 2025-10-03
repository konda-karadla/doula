import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucketName;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, key: string): Promise<{
        key: string;
        url: string;
    }>;
    getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    generateKey(systemId: string, userId: string, filename: string): string;
}
