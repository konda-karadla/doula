"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const labs_controller_1 = require("./labs.controller");
const labs_service_1 = require("./labs.service");
const s3_service_1 = require("./services/s3.service");
const ocr_service_1 = require("./services/ocr.service");
const biomarker_parser_service_1 = require("./services/biomarker-parser.service");
const ocr_processing_processor_1 = require("./processors/ocr-processing.processor");
const prisma_module_1 = require("../prisma/prisma.module");
let LabsModule = class LabsModule {
};
exports.LabsModule = LabsModule;
exports.LabsModule = LabsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            config_1.ConfigModule,
            bull_1.BullModule.registerQueue({
                name: 'ocr-processing',
            }),
        ],
        controllers: [labs_controller_1.LabsController],
        providers: [
            labs_service_1.LabsService,
            s3_service_1.S3Service,
            ocr_service_1.OcrService,
            biomarker_parser_service_1.BiomarkerParserService,
            ocr_processing_processor_1.OcrProcessingProcessor,
        ],
        exports: [labs_service_1.LabsService],
    })
], LabsModule);
//# sourceMappingURL=labs.module.js.map