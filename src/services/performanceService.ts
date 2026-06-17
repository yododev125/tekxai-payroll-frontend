import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from './api/endpoints';
import { QUERY_KEYS } from './api/tanstackKeys';

export interface DailyReport {
  id: string;
  user_id: string;
  date: string;
  todays_progress: string;
  completion_percentage: number;
  blockers?: string;
  tomorrow_plan?: string;
  manager_remarks?: string;
  status: 'SUBMITTED' | 'REVIEWED' | 'APPROVED';
  user?: { id: string; first_name: string; last_name: string; avatar?: string };
}

export interface PerformanceScore {
  id: string;
  user_id: string;
  period: string;
  score_type: 'ENGINEERING' | 'ESTIMATION';
  timely_delivery: number;
  quality_score: number;
  regularity: number;
  punctuality: number;
  dress_code: number;
  total_score: number;
  user?: { id: string; first_name: string; last_name: string };
}

export interface BonusRecord {
  id: string;
  user_id: string;
  period: string;
  average_score: number;
  performance_level?: string;
  bonus_eligible: boolean;
  bonus_amount: number;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
}

const buildQs = (params?: Record<string, any>) => {
  if (!params) return '';
  const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : '';
};

export const useGetDailyReportsQuery = (params?: Record<string, any>) =>
  useQuery({
    queryKey: [...QUERY_KEYS.PERFORMANCE.REPORTS, params],
    queryFn: async () => {
      const res = await apiRequest<any>(`${API_ENDPOINTS.PERFORMANCE.DAILY_REPORTS}${buildQs(params)}`);
      return res?.payload || { records: [], total: 0 };
    },
    staleTime: 30000,
  });

export const useCreateDailyReportMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiRequest(API_ENDPOINTS.PERFORMANCE.DAILY_REPORTS, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.REPORTS }),
  });
};

export const useUpdateDailyReportMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(API_ENDPOINTS.PERFORMANCE.DAILY_REPORT(id), { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.REPORTS }),
  });
};

export const useGetPerformanceScoresQuery = (params?: Record<string, any>) =>
  useQuery({
    queryKey: [...QUERY_KEYS.PERFORMANCE.SCORES, params],
    queryFn: async () => {
      const res = await apiRequest<any>(`${API_ENDPOINTS.PERFORMANCE.SCORES}${buildQs(params)}`);
      return (res?.payload || []) as PerformanceScore[];
    },
    staleTime: 60000,
  });

export const useUpsertScoreMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiRequest(API_ENDPOINTS.PERFORMANCE.SCORES, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.SCORES }),
  });
};

export const useGetBonusRecordsQuery = (params?: Record<string, any>) =>
  useQuery({
    queryKey: [...QUERY_KEYS.PERFORMANCE.BONUS, params],
    queryFn: async () => {
      const res = await apiRequest<any>(`${API_ENDPOINTS.PERFORMANCE.BONUS}${buildQs(params)}`);
      return res?.payload || { records: [], total: 0 };
    },
    staleTime: 30000,
  });

export const useCalculateBonusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_id: string; period: string }) =>
      apiRequest(API_ENDPOINTS.PERFORMANCE.CALC_BONUS, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.BONUS }),
  });
};

export const useApproveBonusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(API_ENDPOINTS.PERFORMANCE.APPROVE_BONUS(id), { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.BONUS }),
  });
};
