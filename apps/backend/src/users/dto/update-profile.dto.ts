import { PreparationLevel } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  gender?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  targetYear?: number;

  @IsOptional()
  @IsEnum(PreparationLevel)
  preparationLevel?: PreparationLevel;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(960)
  dailyStudyMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsBoolean()
  profileCompleted?: boolean;
}
