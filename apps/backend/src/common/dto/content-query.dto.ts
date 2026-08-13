import { IsEnum, IsInt, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty, GsPaper, QuestionType } from '@prisma/client';
import { PaginationQueryDto } from './pagination-query.dto';

export class QuestionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

export class PyqQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsEnum(GsPaper)
  paper?: GsPaper;
}

export class CutoffsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

export class NcertQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classNumber?: number;

  @IsOptional()
  subjectName?: string;
}

export class MainsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GsPaper)
  paper?: GsPaper;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

export class StudyMaterialsQueryDto extends PaginationQueryDto {
  @IsOptional()
  materialType?: string;
}

export class LessonsQueryDto extends PaginationQueryDto {}
