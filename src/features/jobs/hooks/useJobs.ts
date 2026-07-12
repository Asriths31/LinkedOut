import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../utils/api';

export interface JobQueryFilters {
  search?: string;
  location?: string;
  remoteType?: string;
  jobType?: string;
  companyId?: string;
  minSalary?: number;
  maxSalary?: number;
  recruiterId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const useJobs = (filters: JobQueryFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const response = await api.get('/jobs', { params: filters });
      return response.data; // contains data: jobs, meta: { total, page, limit, pages }
    },
  });
};

export const useJobDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) throw new Error('Job ID is required');
      const response = await api.get(`/jobs/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useAutocomplete = (searchStr: string) => {
  return useQuery({
    queryKey: ['autocomplete', searchStr],
    queryFn: async () => {
      if (!searchStr || searchStr.length < 2) return [];
      const response = await api.get('/jobs/autocomplete/search', { params: { q: searchStr } });
      return response.data.data as string[];
    },
    enabled: searchStr.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute cache
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/jobs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'Active' | 'Closed' | 'Draft' }) => {
      const response = await api.put(`/jobs/${id}`, { status });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
    },
  });
};
