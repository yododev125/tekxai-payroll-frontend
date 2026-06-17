import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from './api/endpoints';
import { QUERY_KEYS } from './api/tanstackKeys';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  manager_id?: string;
  divisions?: Division[];
  _count?: { users: number };
}

export interface Division {
  id: string;
  department_id: string;
  name: string;
  code?: string;
  description?: string;
}

export const useGetDepartmentsQuery = (params?: Record<string, any>) =>
  useQuery<Department[]>({
    queryKey: [...QUERY_KEYS.DEPARTMENT.LIST, params],
    queryFn: async () => {
      const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
      const res = await apiRequest<any>(`${API_ENDPOINTS.DEPARTMENT.LIST}${qs}`);
      return res?.payload || [];
    },
    staleTime: 60000,
  });

export const useGetDepartmentQuery = (id?: string) =>
  useQuery<Department>({
    queryKey: QUERY_KEYS.DEPARTMENT.DETAIL(id || ''),
    queryFn: async () => {
      const res = await apiRequest<any>(API_ENDPOINTS.DEPARTMENT.DETAIL(id!));
      return res?.payload || res;
    },
    enabled: !!id,
  });

export const useCreateDepartmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiRequest(API_ENDPOINTS.DEPARTMENT.CREATE, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.DEPARTMENT.LIST }),
  });
};

export const useUpdateDepartmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(API_ENDPOINTS.DEPARTMENT.UPDATE(id), { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.DEPARTMENT.LIST }),
  });
};

export const useDeleteDepartmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(API_ENDPOINTS.DEPARTMENT.DELETE(id), { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.DEPARTMENT.LIST }),
  });
};
