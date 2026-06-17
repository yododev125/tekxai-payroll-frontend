/**
 * Admin Service — Real API Implementation
 * BUG-006 FIX: Removed wrong 'packing-list/summary' endpoint
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from './api/endpoints';
import { QUERY_KEYS } from './api/tanstackKeys';

// BUG-006 FIX: Dashboard stats now derived from real project data
async function fetchDashboardStats() {
  try {
    const [projectsRes, timesheetRes] = await Promise.all([
      apiRequest<any>(API_ENDPOINTS.PROJECT.LIST + '?limit=200'),
      apiRequest<any>(API_ENDPOINTS.TIMESHEET.REQUESTS),
    ]);
    const projects = projectsRes?.payload?.records || [];
    const requests = timesheetRes?.payload || {};
    return {
      totalProjects:     projects.length,
      completedProjects: projects.filter((p: any) => p.status === 'COMPLETED').length,
      overdueProjects:   projects.filter((p: any) => p.status === 'OVERDUE').length,
      pendingTimesheets: requests?.counts?.timesheet_edit_requests || 0,
      pendingTimeOff:    requests?.counts?.time_off_requests || 0,
    };
  } catch {
    return { totalProjects: 0, completedProjects: 0, overdueProjects: 0, pendingTimesheets: 0, pendingTimeOff: 0 };
  }
}

export const useGetDashboardStatsQuery = (enabled = true) =>
  useQuery({ queryKey: ['adminDashboardStats'], queryFn: fetchDashboardStats, enabled, staleTime: 60000 });

export const useGetTeamsQuery = (params?: Record<string, any>, enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.TEAM.LIST, params],
    queryFn: () => {
      const qs = params ? new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))).toString() : '';
      return apiRequest(qs ? `${API_ENDPOINTS.TEAM.LIST}?${qs}` : API_ENDPOINTS.TEAM.LIST);
    },
    enabled,
  });

export const useCreateTeamMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest(API_ENDPOINTS.TEAM.CREATE, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.TEAM.LIST }),
  });
};

export const useUpdateTeamMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      apiRequest(API_ENDPOINTS.TEAM.UPDATE(id), { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.TEAM.LIST }),
  });
};

export const useDeleteTeamMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => apiRequest(API_ENDPOINTS.TEAM.DELETE(id), { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.TEAM.LIST }),
  });
};

export const useBulkDeleteTeamsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest(API_ENDPOINTS.TEAM.DELETE_MANY, { method: 'DELETE', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.TEAM.LIST }),
  });
};
