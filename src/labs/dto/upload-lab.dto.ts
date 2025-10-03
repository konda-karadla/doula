import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UploadLabDto {
  @IsNotEmpty()
  file: Express.Multer.File;

  @IsString()
  @IsOptional()
  notes?: string;
}
