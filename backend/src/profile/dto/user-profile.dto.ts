import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  profileType: string;

  @ApiProperty()
  journeyType: string;

  @ApiProperty()
  systemId: string;

  @ApiProperty({ required: false })
  preferences?: Record<string, any>;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty({ required: false })
  dateOfBirth?: string;

  @ApiProperty({ required: false, type: [String] })
  healthGoals?: string[];

  @ApiProperty({ required: false })
  emergencyContactName?: string;

  @ApiProperty({ required: false })
  emergencyContactPhone?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
