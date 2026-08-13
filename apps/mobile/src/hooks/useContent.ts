import { useCallback, useEffect, useState } from 'react';
import type {
  CutOffRecordDto,
  ExamDetailDto,
  ExamInfoSectionDto,
  ExamSummaryDto,
  LessonDetailDto,
  NcertReferenceDto,
  PyqSummaryDto,
  StudyMaterialSummaryDto,
  SubjectSummaryDto,
  SyllabusTreeNodeDto,
  TopicSummaryDto,
} from '@aarambh360/types';
import { apiClient } from '../services/apiClient';

interface Paginated<T> {
  data: T[];
  meta?: { totalItems: number; page: number; limit: number };
}

async function fetchData<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<{ data: T }>(path, { params });
  return response.data.data;
}

async function fetchPaginated<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<Paginated<T>> {
  const response = await apiClient.get<Paginated<T>>(path, { params });
  return response.data;
}

export function useExams() {
  const [data, setData] = useState<ExamSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData<ExamSummaryDto[]>('/exams')
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load exams'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useExamDetail(code: string) {
  const [data, setData] = useState<ExamDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData<ExamDetailDto>(`/exams/${code}`)
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load exam'))
      .finally(() => setLoading(false));
  }, [code]);

  return { data, loading, error };
}

export function useSubjects(examCode: string) {
  const [data, setData] = useState<SubjectSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData<SubjectSummaryDto[]>(`/exams/${examCode}/subjects`)
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load subjects'))
      .finally(() => setLoading(false));
  }, [examCode]);

  return { data, loading, error };
}

export function useSyllabusTree(examCode: string) {
  const [data, setData] = useState<SyllabusTreeNodeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData<SyllabusTreeNodeDto[]>(`/syllabus/${examCode}/tree`)
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load syllabus'))
      .finally(() => setLoading(false));
  }, [examCode]);

  return { data, loading, error };
}

export function useExamInfo(examCode: string) {
  const [data, setData] = useState<ExamInfoSectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData<ExamInfoSectionDto[]>(`/exam-info/${examCode}`)
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load exam info'))
      .finally(() => setLoading(false));
  }, [examCode]);

  return { data, loading, error };
}

export function useCutoffs(examCode: string, year?: number) {
  const [data, setData] = useState<CutOffRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaginated<CutOffRecordDto>(`/cutoffs/${examCode}`, {
      year,
      limit: 100,
    })
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message ?? 'Failed to load cutoffs'))
      .finally(() => setLoading(false));
  }, [examCode, year]);

  return { data, loading, error };
}

export function useNcert(classNumber?: number) {
  const [data, setData] = useState<NcertReferenceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaginated<NcertReferenceDto>('/ncert', { classNumber, limit: 100 })
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message ?? 'Failed to load NCERT'))
      .finally(() => setLoading(false));
  }, [classNumber]);

  return { data, loading, error };
}

export function useStudyMaterials() {
  const [data, setData] = useState<StudyMaterialSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaginated<StudyMaterialSummaryDto>('/study-materials', { limit: 50 })
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message ?? 'Failed to load study materials'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function usePyq(year?: number) {
  const [data, setData] = useState<PyqSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaginated<PyqSummaryDto>('/pyq', { year, limit: 50 })
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message ?? 'Failed to load PYQ'))
      .finally(() => setLoading(false));
  }, [year]);

  return { data, loading, error };
}

export function useTopics(subjectId: string | null) {
  const [data, setData] = useState<TopicSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!subjectId) return;
    setLoading(true);
    fetchData<TopicSummaryDto[]>(`/subjects/${subjectId}/topics`)
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load topics'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useLesson(lessonId: string | null) {
  const [data, setData] = useState<LessonDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    fetchData<LessonDetailDto>(`/lessons/${lessonId}`)
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load lesson'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  return { data, loading, error };
}
