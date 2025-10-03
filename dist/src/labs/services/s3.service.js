"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3Service = S3Service_1 = class S3Service {
    configService;
    logger = new common_1.Logger(S3Service_1.name);
    s3Client;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        this.s3Client = new client_s3_1.S3Client({
            region: this.configService.get('aws.region') || 'us-east-1',
            credentials: {
                accessKeyId: this.configService.get('aws.accessKeyId') || 'default-key',
                secretAccessKey: this.configService.get('aws.secretAccessKey') ||
                    'default-secret',
            },
        });
        this.bucketName =
            this.configService.get('aws.s3BucketName') || 'default-bucket';
    }
    async uploadFile(file, key) {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });
            await this.s3Client.send(command);
            const url = await this.getPresignedUrl(key);
            this.logger.log(`File uploaded successfully: ${key}`);
            return { key, url };
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPresignedUrl(key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        catch (error) {
            this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
            throw error;
        }
    }
    generateKey(systemId, userId, filename) {
        const timestamp = Date.now();
        const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `labs/${systemId}/${userId}/${timestamp}-${sanitized}`;
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map