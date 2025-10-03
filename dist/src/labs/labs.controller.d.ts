import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { LabsService } from './labs.service';
import { LabResultDto } from './dto/lab-result.dto';
import { BiomarkerDto } from './dto/biomarker.dto';
export declare class LabsController {
    private readonly labsService;
    constructor(labsService: LabsService);
    uploadLab(file: Express.Multer.File, notes: string, user: CurrentUserData): Promise<LabResultDto>;
    getLabResults(user: CurrentUserData): Promise<LabResultDto[]>;
    getLabResult(id: string, user: CurrentUserData): Promise<LabResultDto>;
    getBiomarkers(id: string, user: CurrentUserData): Promise<BiomarkerDto[]>;
    deleteLabResult(id: string, user: CurrentUserData): Promise<{
        message: string;
    }>;
}
