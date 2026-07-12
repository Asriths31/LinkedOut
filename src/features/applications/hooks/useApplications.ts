import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../utils/api';

export const useCandidateApplications = () => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const response = await api.get('/applications/candidate/my');
      return response.data.data;
    },
  });
};

export const useJobApplicants = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['applicants', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      const response = await api.get(`/applications/job/${jobId}`);
      return response.data.data;
    },
    enabled: !!jobId,
  });
};

export const useApplyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      resume,
      coverLetter,
      answers,
    }: {
      jobId: string;
      resume: string;
      coverLetter?: string;
      answers?: Array<{ questionId: string; label: string; value: string }>;
    }) => {
      const response = await api.post(`/applications/apply/${jobId}`, { resume, coverLetter, answers });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
};

export const useUpdateStatusMutation = (jobId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      feedback,
    }: {
      applicationId: string;
      status: string;
      feedback?: string;
    }) => {
      const response = await api.put(`/applications/${applicationId}/status`, { status, feedback });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobId] });
    },
  });
};

export const useViewResumeMutation = (jobId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await api.put(`/applications/${applicationId}/view-resume`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobId] });
    },
  });
};
