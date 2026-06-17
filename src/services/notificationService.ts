import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from './api/endpoints';
import { QUERY_KEYS } from './api/tanstackKeys';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationList {
  records: Notification[];
  total: number;
  unread_count: number;
  page: number;
  limit: number;
}

const fetchNotifications = async (page = 1): Promise<NotificationList> => {
  const res = await apiRequest<any>(`${API_ENDPOINTS.NOTIFICATION.LIST}?page=${page}&limit=20`);
  return res?.payload || { records: [], total: 0, unread_count: 0, page: 1, limit: 20 };
};

export const useGetNotificationsQuery = (page = 1) =>
  useQuery<NotificationList>({
    queryKey: [...QUERY_KEYS.NOTIFICATION.LIST, page],
    queryFn: () => fetchNotifications(page),
    staleTime: 30000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(API_ENDPOINTS.NOTIFICATION.MARK_READ(id), { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION.LIST }),
  });
};

export const useMarkAllReadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest(API_ENDPOINTS.NOTIFICATION.READ_ALL, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION.LIST }),
  });
};

export const useDeleteNotificationMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(API_ENDPOINTS.NOTIFICATION.DELETE(id), { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION.LIST }),
  });
};
