export declare class LabResultDto {
    id: string;
    fileName: string;
    uploadedAt: Date;
    processingStatus: string;
    s3Url?: string;
    rawOcrText?: string;
    createdAt: Date;
    updatedAt: Date;
}
