import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class CreateApplicantDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  targetIntake?: string;

  @IsOptional()
  @IsEnum(['Study', 'Ausbildung', 'Employment'])
  goalTrack?: 'Study' | 'Ausbildung' | 'Employment';
}
