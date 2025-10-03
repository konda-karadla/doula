import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsObject,
  IsArray,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  journeyType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;

  @ApiProperty({ required: false, type: [String], isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthGoals?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;
}
