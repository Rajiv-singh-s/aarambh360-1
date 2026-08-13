import type { Difficulty, ExamStageType, GsPaper, PublishStatus, QuestionType } from './domain';
import type { PaginationMeta } from './index';

export interface ApiDataResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ExamStageDto {
  id: string;
  stageType: ExamStageType;
  name: string;
  description?: string | null;
  sortOrder: number;
}

export interface ExamSummaryDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface ExamDetailDto extends ExamSummaryDto {
  stages: ExamStageDto[];
}

export interface SubjectSummaryDto {
  id: string;
  examId: string;
  code: string;
  name: string;
  gsPaper?: GsPaper | null;
  iconUrl?: string | null;
  description?: string | null;
  sortOrder: number;
}

export interface TopicSummaryDto {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  parentId?: string | null;
}

export interface TopicProgressSummaryDto {
  topicId: string;
  completionPercent: number;
  lastStudiedAt?: string | null;
}

export interface TopicWithProgressDto extends TopicSummaryDto {
  progress?: TopicProgressSummaryDto | null;
}

export interface LessonSummaryDto {
  id: string;
  chapterId: string;
  title: string;
  slug: string;
  summary?: string | null;
  sortOrder: number;
}

export interface LessonSectionDto {
  id: string;
  title?: string | null;
  content: string;
  sortOrder: number;
}

export interface LessonDetailDto extends LessonSummaryDto {
  content?: string | null;
  sections: LessonSectionDto[];
}

export interface SyllabusTreeNodeDto {
  id: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  path?: string | null;
  children: SyllabusTreeNodeDto[];
}

export interface NcertReferenceDto {
  id: string;
  classNumber: number;
  subjectName: string;
  title?: string | null;
  pdfUrl: string;
  sortOrder: number;
}

export interface ExamInfoSectionDto {
  id: string;
  sectionKey: string;
  title: string;
  content: string;
  sortOrder: number;
}

export interface CutOffRecordDto {
  id: string;
  year: number;
  category: string;
  prelimsCutoff?: number | null;
  mainsCutoff?: number | null;
  finalCutoff?: number | null;
}

export interface QuestionOptionDto {
  id: string;
  label: string;
  text: string;
  sortOrder: number;
}

export interface QuestionSummaryDto {
  id: string;
  type: QuestionType;
  text: string;
  difficulty: Difficulty;
  sourceYear?: number | null;
  publishStatus: PublishStatus;
}

export interface QuestionDetailDto extends QuestionSummaryDto {
  explanation?: string | null;
  options: QuestionOptionDto[];
  topicIds: string[];
}

export interface PyqSummaryDto extends QuestionSummaryDto {
  examYear: number;
  paper: GsPaper;
  questionNumber?: number | null;
  marks?: number | null;
}

export interface PyqDetailDto extends PyqSummaryDto {
  explanation?: string | null;
  wordLimit?: number | null;
}

export interface StudyMaterialSummaryDto {
  id: string;
  title: string;
  description?: string | null;
  materialType: string;
  sortOrder: number;
}

export interface StudyMaterialDetailDto extends StudyMaterialSummaryDto {
  content?: string | null;
  url?: string | null;
}

export interface MainsQuestionSummaryDto {
  id: string;
  text: string;
  gsPaper: GsPaper;
  maxMarks: number;
  publishedDate?: string | null;
}

export interface MainsQuestionDetailDto extends MainsQuestionSummaryDto {
  subjectId?: string | null;
  metadata?: Record<string, string | number | boolean | null> | null;
}
