import { Injectable, Logger } from '@nestjs/common';

interface ParsedBiomarker {
  testName: string;
  value: string;
  unit?: string;
  referenceRangeLow?: string;
  referenceRangeHigh?: string;
}

@Injectable()
export class BiomarkerParserService {
  private readonly logger = new Logger(BiomarkerParserService.name);

  parseBiomarkersFromText(text: string): ParsedBiomarker[] {
    const biomarkers: ParsedBiomarker[] = [];
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

  private parseLine(line: string): ParsedBiomarker | null {
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

  private parsePattern1(line: string): ParsedBiomarker | null {
    const regex =
      /^(.+?)[:|\s]+(\d+\.?\d*)\s*([a-zA-Z/%]+)?\s*(?:\(?\s*(?:Reference|Range|Normal)?[:|\s]*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\)?)?/i;
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

  private parsePattern2(line: string): ParsedBiomarker | null {
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

  private parsePattern3(line: string): ParsedBiomarker | null {
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

  private parsePattern4(line: string): ParsedBiomarker | null {
    const regex =
      /^(.+?):\s*(\d+\.?\d*)\s*([a-zA-Z/%]+)?\s*\(Normal:\s*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\)/i;
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

  private parsePattern5(line: string): ParsedBiomarker | null {
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
}
