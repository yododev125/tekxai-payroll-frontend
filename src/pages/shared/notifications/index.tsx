import React from 'react';
import Card from '@/components/ui/Card';
import { Megaphone, Briefcase, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { QUERY_KEYS } from '@/services/api/tanstackKeys';
import { useToastContext } from '@/components/toast/ToastProvider';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: QUERY_KEYS.NOTIFICATION.LIST,
    queryFn: async () => {
      const res = await apiRequest<any>(API_ENDPOINTS.NOTIFICATION.LIST);
      return res?.payload?.records || res?.payload || [];
    },
    staleTime: 30000,
  });
}

function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest(API_ENDPOINTS.NOTIFICATION.READ_ALL, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION.LIST }),
  });
}

function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(API_ENDPOINTS.NOTIFICATION.MARK_READ(id), { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION.LIST }),
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const NotificationsPage: React.FC = () => {
  const toast = useToastContext();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAll = useMarkAllRead();
  const markOne = useMarkRead();

  const handleMarkAll = async () => {
    try {
      await markAll.mutateAsync();
      toast.success('All marked as read');
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkOne = async (id: string) => {
    try { await markOne.mutateAsync(id); } catch { /* silent */ }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications & Logs</h1>
        <button
          onClick={handleMarkAll}
          disabled={markAll.isPending || notifications.every((n) => n.is_read)}
          className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors disabled:opacity-40"
        >
          {markAll.isPending ? 'Marking...' : 'Mark all as read'}
        </button>
      </div>

      <Card className="bg-white border-none shadow-sm overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 font-bold">No notifications yet</p>
            <p className="text-sm text-gray-300 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif, index) => {
              const Icon = notif.type === 'info' ? Briefcase : Megaphone;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && handleMarkOne(notif.id)}
                  className={cn(
                    'flex justify-between items-start p-6 transition-colors cursor-pointer',
                    !notif.is_read && 'bg-blue-50/30 hover:bg-blue-50/50',
                    notif.is_read && 'hover:bg-gray-50',
                    index !== notifications.length - 1 && 'border-b border-gray-100',
                  )}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="shrink-0 h-11 w-11 rounded-full bg-[#F5F8FF] text-primary-500 flex items-center justify-center mt-1">
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 pr-6">
                      <div className="flex items-center gap-3">
                        <h4 className="text-[15px] font-black text-gray-900 tracking-tight">{notif.title}</h4>
                        <span className="text-[13px] text-gray-500 font-bold">{timeAgo(notif.created_at)}</span>
                      </div>
                      <p className="text-[14px] leading-relaxed text-gray-600 font-medium">{notif.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 h-full pt-1">
                    {!notif.is_read ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(0,92,218,0.4)] block" />
                    ) : (
                      <CheckCircle2 size={16} className="text-gray-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
