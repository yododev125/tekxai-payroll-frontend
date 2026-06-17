import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from './api/endpoints';
import { QUERY_KEYS } from './api/tanstackKeys';

export interface Asset {
  id: string;
  asset_tag: string;
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'DAMAGED' | 'RETIRED';
  purchase_date?: string;
  purchase_cost?: number;
  warranty_expiry?: string;
  notes?: string;
  category?: { id: string; name: string; code: string };
  vendor?: { id: string; name: string };
  location?: { id: string; office: string; floor?: string; room?: string };
  department?: { id: string; name: string };
  assignments?: Array<{ user: { id: string; first_name: string; last_name: string } }>;
}

export interface AssetCategory { id: string; name: string; code: string; }
export interface AssetLocation { id: string; office: string; floor?: string; room?: string; }
export interface AssetVendor { id: string; name: string; contact_info?: string; }

const buildQs = (params?: Record<string, any>) => {
  if (!params) return '';
  const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : '';
};

export const useGetAssetsQuery = (params?: Record<string, any>, enabled = true) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ASSET.LIST, params],
    queryFn: async () => {
      const res = await apiRequest<any>(`${API_ENDPOINTS.ASSET.LIST}${buildQs(params)}`);
      return res?.payload || { records: [], total: 0 };
    },
    enabled,
    staleTime: 30000,
  });

export const useGetAssetQuery = (id?: string) =>
  useQuery({
    queryKey: QUERY_KEYS.ASSET.DETAIL(id || ''),
    queryFn: async () => {
      const res = await apiRequest<any>(API_ENDPOINTS.ASSET.DETAIL(id!));
      return (res?.payload || res) as Asset;
    },
    enabled: !!id,
  });

export const useGetAssetCategoriesQuery = () =>
  useQuery<AssetCategory[]>({
    queryKey: QUERY_KEYS.ASSET.CATEGORIES,
    queryFn: async () => {
      const res = await apiRequest<any>(API_ENDPOINTS.ASSET.CATEGORIES);
      return res?.payload || [];
    },
    staleTime: 300000,
  });

export const useGetAssetLocationsQuery = () =>
  useQuery<AssetLocation[]>({
    queryKey: QUERY_KEYS.ASSET.LOCATIONS,
    queryFn: async () => {
      const res = await apiRequest<any>(API_ENDPOINTS.ASSET.LOCATIONS);
      return res?.payload || [];
    },
    staleTime: 300000,
  });

export const useGetAssetVendorsQuery = () =>
  useQuery<AssetVendor[]>({
    queryKey: QUERY_KEYS.ASSET.VENDORS,
    queryFn: async () => {
      const res = await apiRequest<any>(API_ENDPOINTS.ASSET.VENDORS);
      return res?.payload || [];
    },
    staleTime: 300000,
  });

export const useCreateAssetMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest(API_ENDPOINTS.ASSET.CREATE, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSET.LIST }),
  });
};

export const useUpdateAssetMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(API_ENDPOINTS.ASSET.UPDATE(id), { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSET.LIST }),
  });
};

export const useDeleteAssetMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(API_ENDPOINTS.ASSET.DELETE(id), { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSET.LIST }),
  });
};

export const useAssignAssetMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(API_ENDPOINTS.ASSET.ASSIGN(id), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSET.LIST }),
  });
};

export const useReturnAssetMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(API_ENDPOINTS.ASSET.RETURN(id), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSET.LIST }),
  });
};

export const useAddMaintenanceMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(API_ENDPOINTS.ASSET.MAINTENANCE(id), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSET.LIST }),
  });
};
