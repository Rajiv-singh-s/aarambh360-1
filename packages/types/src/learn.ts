export interface FlashcardDto {
  id: string;
  subjectId: string | null;
  topicId: string | null;
  front: string;
  back: string;
  createdAt: string;
}

export interface CheatSheetDto {
  id: string;
  type: string;
  title: string;
  description: string;
  tags: string;
  createdAt: string;
}
