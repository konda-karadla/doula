interface ParsedBiomarker {
    testName: string;
    value: string;
    unit?: string;
    referenceRangeLow?: string;
    referenceRangeHigh?: string;
}
export declare class BiomarkerParserService {
    private readonly logger;
    parseBiomarkersFromText(text: string): ParsedBiomarker[];
    private parseLine;
    private parsePattern1;
    private parsePattern2;
    private parsePattern3;
    private parsePattern4;
    private parsePattern5;
}
export {};
