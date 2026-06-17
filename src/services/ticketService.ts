/**
 * Ticket Service — Real API Implementation
 * Replaces localStorage-only implementation with backend calls.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CreateTicketPayload, SupportTicket, TicketStatus } from '@/types/ticket';
import { QUERY_KEYS } from '@/services/api/tanstackKeys';
import { API_ENDPOINTS } from './api/endpoints';

export const TICKET_RECIPIENTS = [
  { id: 'tl',         role: 'team_lead',  label: 'Team Lead (TL)',  name: 'Team Lead' },
  { id: 'office_boy', role: 'office_boy', label: 'Office Boy',      name: 'Office Boy' },
  { id: 'hr',         role: 'hr',         label: 'HR',              name: 'HR Department' },
  { id: 'admin',      role: 'admin',      label: 'Admin',           name: 'Admin Support' },
  { id: 'other',      role: 'other',      label: 'Other',           name: '' },
];

export const getTicketStats = (tickets: SupportTicket[]) => ({
  total:      tickets.length,
  pending:    tickets.filter((t) => t.status === 'pending').length,
  inProgress: tickets.filter((t) => t.status === 'in_progress').length,
  resolved:   tickets.filter((t) => t.status === 'resolved').length,
});

export const formatTicketDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

async function fetchTickets(): Promise<SupportTicket[]> {
  const res = await apiRequest<any>(API_ENDPOINTS.TICKET.LIST);
  const records = res?.payload?.records || res?.payload || [];
  return Array.isArray(records) ? records : [];
}

async function postTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
  const recipient = TICKET_RECIPIENTS.find((r) => r.id === payload.recipientId);
  const recipientName = recipient?.role === 'other'
    ? payload.customRecipientName?.trim() || 'Unspecified'
    : recipient?.name || 'Unknown';

  const res = await apiRequest<any>(API_ENDPOINTS.TICKET.CREATE, {
    method: 'POST',
    body: JSON.stringify({
      subject: payload.subject,
      description: payload.description,
      recipient_role: recipient?.role || 'other',
      recipient_label: recipient?.label || 'Other',
      recipient_name: recipientName,
      priority: payload.priority,
    }),
  });
  return res?.payload || res;
}

export const useGetTickets = () =>
  useQuery({ queryKey: QUERY_KEYS.TICKETS.LIST, queryFn: fetchTickets });

export const useCreateTicketMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.TICKETS.LIST }),
  });
};

export const filterTicketsByStatus = (tickets: SupportTicket[], status: TicketStatus | 'all') =>
  status === 'all' ? tickets : tickets.filter((t) => t.status === status);
