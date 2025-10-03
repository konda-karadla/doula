"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BiomarkerParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiomarkerParserService = void 0;
const common_1 = require("@nestjs/common");
let BiomarkerParserService = BiomarkerParserService_1 = class BiomarkerParserService {
    logger = new common_1.Logger(BiomarkerParserService_1.name);
    parseBiomarkersFromText(text) {
        const biomarkers = [];
        const lines = text.split('\n');
        for (const line of lines) {
            const parsed = this.parseLine(line);
            if (parsed) {
                biomarkers.push(parsed);
            }
        }
        this.logger.log(`Parsed ${biomarkers.length} biomarkers from text`);
        return biomarkers;
    }
    parseLine(line) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length < 3) {
            return null;
        }
        const patterns = [
            this.parsePattern1(trimmed),
            this.parsePattern2(trimmed),
            this.parsePattern3(trimmed),
            this.parsePattern4(trimmed),
            this.parsePattern5(trimmed),
        ];
        for (const result of patterns) {
            if (result) {
                return result;
            }
        }
        return null;
    }
    parsePattern1(line) {
        const regex = /^(.+?)[:|\s]+(\d+\.?\d*)\s*([a-zA-Z/%]+)?\s*(?:\(?\s*(?:Reference|Range|Normal)?[:|\s]*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\)?)?/i;
        const match = line.match(regex);
        if (match) {
            return {
                testName: match[1].trim(),
                value: match[2],
                unit: match[3]?.trim(),
                referenceRangeLow: match[4],
                referenceRangeHigh: match[5],
            };
        }
        return null;
    }
    parsePattern2(line) {
        const regex = /^(.+?)\s+(\d+\.?\d*)\s*([a-zA-Z/%]+)?\s+<\s*(\d+\.?\d*)/i;
        const match = line.match(regex);
        if (match) {
            return {
                testName: match[1].trim(),
                value: match[2],
                unit: match[3]?.trim(),
                referenceRangeHigh: match[4],
            };
        }
        return null;
    }
    parsePattern3(line) {
        const regex = /^(.+?)\s+(\d+\.?\d*)%?\s+Reference:\s*<\s*(\d+\.?\d*)/i;
        const match = line.match(regex);
        if (match) {
            return {
                testName: match[1].trim(),
                value: match[2],
                unit: '%',
                referenceRangeHigh: match[3],
            };
        }
        return null;
    }
    parsePattern4(line) {
        const regex = /^(.+?):\s*(\d+\.?\d*)\s*([a-zA-Z/%]+)?\s*\(Normal:\s*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\)/i;
        const match = line.match(regex);
        if (match) {
            return {
                testName: match[1].trim(),
                value: match[2],
                unit: match[3]?.trim(),
                referenceRangeLow: match[4],
                referenceRangeHigh: match[5],
            };
        }
        return null;
    }
    parsePattern5(line) {
        const regex = /^(.+?)\s+(\d+\.?\d*)\s*([a-zA-Z/%]+)?$/i;
        const match = line.match(regex);
        if (match && match[1].length > 3) {
            return {
                testName: match[1].trim(),
                value: match[2],
                unit: match[3]?.trim(),
            };
        }
        return null;
    }
};
exports.BiomarkerParserService = BiomarkerParserService;
exports.BiomarkerParserService = BiomarkerParserService = BiomarkerParserService_1 = __decorate([
    (0, common_1.Injectable)()
], BiomarkerParserService);
//# sourceMappingURL=biomarker-parser.service.js.map