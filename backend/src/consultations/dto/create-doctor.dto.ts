import { IsString, IsNumber, IsArray, IsDecimal, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. Sarah Johnson' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Obstetrics & Gynecology' })
  @IsString()
  specialization: string;

  @ApiPropertyOptional({ example: 'Board-certified OBGYN with 15+ years experience...' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: ['MD - Johns Hopkins', 'MBBS - Stanford'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  qualifications: string[];

  @ApiProperty({ example: 15, description: 'Years of experience' })
  @IsNumber()
  @Min(0)
  @Max(60)
  experience: number;

  @ApiProperty({ example: '2500.00', description: 'Consultation fee in rupees' })
  @IsDecimal({ decimal_digits: '2' })
  consultationFee: string;

  @ApiPropertyOptional({ example: 'https://example.com/doctor-photo.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

