export declare class OcrService {
    private readonly logger;
    extractTextFromBuffer(buffer: Buffer): Promise<string>;
    extractTextFromFile(file: Express.Multer.File): Promise<string>;
}
