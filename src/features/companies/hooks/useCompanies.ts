import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../utils/api';

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data.data;
    },
  });
};

export const useCompanyDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      if (!id) throw new Error('Company ID is required');
      const response = await api.get(`/companies/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, rating, text }: { companyId: string; rating: number; text: string }) => {
      const response = await api.post(`/companies/${companyId}/review`, { rating, text });
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company', variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useOwnCompany = () => {
  return useQuery({
    queryKey: ['company', 'own'],
    queryFn: async () => {
      const response = await api.get('/companies/recruiter/own');
      return response.data.data;
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/companies', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'own'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
