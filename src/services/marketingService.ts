/**
 * Marketing Service — Real API Implementation
 * Replaces hardcoded mock arrays with backend API calls.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from './api/endpoints';
import type {
  MarketingTeam, MarketingTeamId, PayrollSummary,
  SalaryBuilderMember, SalaryHistoryRecord, TeamMember, WonDeal,
} from '@/types/marketing';

export const MARKETING_TEAMS: MarketingTeam[] = [
  { id: 'sales', label: 'Tekxai Sales Team' },
  { id: 'intern', label: 'Intern BDs' },
];

export const EXCHANGE_RATE_USD_TO_PKR = 278.24;
export const formatPkr = (a: number) => `PKR ${a.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const formatUsd = (a: number) => `$${a.toLocaleString('en-US',  { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const pkrToUsd = (pkr: number) => pkr / EXCHANGE_RATE_USD_TO_PKR;

export const HR_DOCUMENT_TEMPLATES = {
  offer_letter: [
    { label: 'Standard Offer Letter', value: 'standard' },
    { label: 'Sales Team Offer', value: 'sales' },
    { label: 'Intern Offer', value: 'intern' },
  ],
  contract: [
    { label: 'Employment Contract', value: 'employment' },
    { label: 'Commission-Based Contract', value: 'commission' },
    { label: 'Internship Agreement', value: 'internship' },
  ],
};

export const getTeamLabel = (teamId: MarketingTeamId) =>
  MARKETING_TEAMS.find((t) => t.id === teamId)?.label ?? teamId;

export const PERIOD_OPTIONS = [
  { label: 'Jun 2026', value: 'June 2026' },
  { label: 'May 2026', value: 'May 2026' },
  { label: 'Apr 2026', value: 'April 2026' },
];

// ── Real API hooks ────────────────────────────────────────────────────────────

export const useGetWonDeals = (teamId?: MarketingTeamId) =>
  useQuery({
    queryKey: ['marketing', 'deals', teamId],
    queryFn: async () => {
      const qs = teamId ? `?team_label=${encodeURIComponent(getTeamLabel(teamId))}` : '';
      const res = await apiRequest<any>(`${API_ENDPOINTS.MARKETING.DEALS}${qs}`);
      return (res?.payload?.records || res?.payload || []) as WonDeal[];
    },
    staleTime: 60000,
  });

export const useGetSalaryBuilder = (userId?: string, period?: string) =>
  useQuery({
    queryKey: ['marketing', 'salary-builder', userId, period],
    queryFn: async () => {
      const res = await apiRequest<any>(`${API_ENDPOINTS.MARKETING.SALARY_BUILDER}?user_id=${userId}&period=${encodeURIComponent(period || '')}`);
      return res?.payload || null;
    },
    enabled: !!userId && !!period,
    staleTime: 30000,
  });

export const useUpsertSalaryBuilderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiRequest<any>(API_ENDPOINTS.MARKETING.SALARY_BUILDER, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'salary-builder'] }),
  });
};

export const useGetSalaryHistory = (teamId?: MarketingTeamId) =>
  useQuery({
    queryKey: ['marketing', 'salary-history', teamId],
    queryFn: async () => {
      const qs = teamId ? `?team_label=${encodeURIComponent(getTeamLabel(teamId))}` : '';
      const res = await apiRequest<any>(`${API_ENDPOINTS.MARKETING.SALARY_HISTORY}${qs}`);
      return (res?.payload?.records || res?.payload || []) as SalaryHistoryRecord[];
    },
    staleTime: 60000,
  });

// Kept for backwards compatibility with components that call these directly
export const getWonDeals = (_teamId: MarketingTeamId): WonDeal[] => [];
export const getSalaryHistory = (_teamId: MarketingTeamId): SalaryHistoryRecord[] => [];
export const getTeamMembers = (_teamId: MarketingTeamId): TeamMember[] => [];
export const getPayrollSummary = (_teamId: MarketingTeamId, _period: string): PayrollSummary => ({
  published: 0, drafts: 0, pending: 0, totalPayrollPkr: 0, totalPayrollUsd: 0, commissionPkr: 0, commissionUsd: 0, deductionsPkr: 0,
});
export const getMemberWonDeals = (_memberId: string, _period: string): WonDeal[] => [];
export const getSalaryBuilderMember = (_memberId: string): SalaryBuilderMember | null => null;
export const getWonDealsStats = (deals: WonDeal[]) => ({
  totalDeals: deals.length,
  totalRevenue: deals.reduce((s, d) => s + (d as any).revenueUsd || 0, 0),
  avgDealSize: 0,
  upworkCount: deals.filter((d) => (d as any).source === 'Upwork').length,
  linkedInCount: deals.filter((d) => (d as any).source === 'LinkedIn').length,
});
