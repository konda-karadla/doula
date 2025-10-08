import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  role?: string = 'user';

  @IsString()
  @IsOptional()
  language?: string = 'en';

  @IsString()
  profileType: string;

  @IsString()
  journeyType: string;

  @IsString()
  systemId: string;
}

