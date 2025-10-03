export declare class BiomarkerDto {
    id: string;
    labResultId: string;
    testName: string;
    value: string;
    unit?: string;
    referenceRangeLow?: string;
    referenceRangeHigh?: string;
    testDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
