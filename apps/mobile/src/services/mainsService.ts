import { apiClient, apiGet, apiPost } from './apiClient';
import type {
  CreateMainsSubmissionRequestDto,
  EvaluateMainsSubmissionRequestDto,
  MainsEvaluationDto,
  MainsSubmissionDto,
  MainsSubmissionSummaryDto,
} from '@aarambh360/types';
import type { MainsQuestionSummaryDto, PaginatedResponse } from '@aarambh360/types';
import { confirmUpload, requestUploadUrl, uploadBinaryToPresignedUrl } from './uploadService';

export async function listMainsQuestions(limit = 20): Promise<MainsQuestionSummaryDto[]> {
  const response = await apiClient.get<PaginatedResponse<MainsQuestionSummaryDto>>('/mains', {
    params: { limit },
  });
  return response.data.data;
}

export async function createMainsSubmission(
  payload: CreateMainsSubmissionRequestDto,
): Promise<MainsSubmissionDto> {
  return apiPost<MainsSubmissionDto>('/mains/submissions', payload);
}

export async function getMainsSubmission(submissionId: string): Promise<MainsSubmissionDto> {
  return apiGet<MainsSubmissionDto>(`/mains/submissions/${submissionId}`);
}

export async function retryMainsSubmission(submissionId: string): Promise<MainsSubmissionDto> {
  return apiPost<MainsSubmissionDto>(`/mains/submissions/${submissionId}/retry`);
}

export async function listMainsSubmissions(limit = 20): Promise<MainsSubmissionSummaryDto[]> {
  const response = await apiClient.get<{ data: MainsSubmissionSummaryDto[] }>('/mains/submissions', {
    params: { limit },
  });
  return response.data.data;
}

export async function evaluateMainsSubmission(
  submissionId: string,
  payload?: EvaluateMainsSubmissionRequestDto,
): Promise<MainsSubmissionDto> {
  return apiPost<MainsSubmissionDto>(`/mains/submissions/${submissionId}/evaluate`, payload ?? {});
}

export async function getMainsEvaluation(submissionId: string): Promise<MainsEvaluationDto> {
  return apiGet<MainsEvaluationDto>(`/mains/submissions/${submissionId}/evaluation`);
}

export async function pollMainsEvaluation(
  submissionId: string,
  options?: { timeoutMs?: number; intervalMs?: number },
): Promise<MainsSubmissionDto> {
  const timeoutMs = options?.timeoutMs ?? 45_000;
  const intervalMs = options?.intervalMs ?? 1_500;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const submission = await getMainsSubmission(submissionId);
    if (submission.evaluation) {
      return submission;
    }
    if (submission.evalError) {
      throw new Error(submission.evalError);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return getMainsSubmission(submissionId);
}

export async function uploadMainsImages(localUris: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (const uri of localUris) {
    const contentType = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const upload = await requestUploadUrl({
      purpose: 'MAINS_ANSWER',
      contentType,
      fileName: `page-${urls.length + 1}.${contentType === 'image/png' ? 'png' : 'jpg'}`,
    });
    await uploadBinaryToPresignedUrl(upload.uploadUrl, uri, contentType);
    await confirmUpload({
      key: upload.key,
      publicUrl: upload.publicUrl,
      purpose: 'MAINS_ANSWER',
    });
    urls.push(upload.publicUrl);
  }

  return urls;
}

export async function pollMainsSubmission(
  submissionId: string,
  options?: { timeoutMs?: number; intervalMs?: number },
): Promise<MainsSubmissionDto> {
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const intervalMs = options?.intervalMs ?? 1_500;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const submission = await getMainsSubmission(submissionId);
    if (submission.status === 'EVALUATED' || submission.status === 'FAILED') {
      return submission;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return getMainsSubmission(submissionId);
}
