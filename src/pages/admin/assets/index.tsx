import React, { useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import ActionModal from '@/components/ui/ActionModal';
import Modal from '@/components/ui/Modal';
import { Search, Plus, Edit2, Trash2, Package, UserCheck, Wrench, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToastContext } from '@/components/toast/ToastProvider';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useGetAssetsQuery, useGetAssetCategoriesQuery, useGetAssetLocationsQuery,
  useCreateAssetMutation, useUpdateAssetMutation, useDeleteAssetMutation,
  useAssignAssetMutation, useReturnAssetMutation,
  type Asset,
} from '@/services/assetService';
import { useFetchUsersQuery } from '@/services/userService';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:   'bg-green-50  text-green-600  border-green-100',
  ASSIGNED:    'bg-blue-50   text-blue-600   border-blue-100',
  MAINTENANCE: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  DAMAGED:     'bg-red-50    text-red-600    border-red-100',
  RETIRED:     'bg-gray-50   text-gray-400   border-gray-100',
};

const AssetManagement: React.FC = () => {
  const toast = useToastContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [assignUserId, setAssignUserId] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    category_id: categoryFilter || undefined,
  }), [debouncedSearch, statusFilter, categoryFilter]);

  const { data: assetsData, isLoading } = useGetAssetsQuery(params);
  const { data: categories = [] } = useGetAssetCategoriesQuery();
  const { data: locations = [] } = useGetAssetLocationsQuery();
  const { data: users = [] } = useFetchUsersQuery({}, true);

  const createMutation = useCreateAssetMutation();
  const updateMutation = useUpdateAssetMutation();
  const deleteMutation = useDeleteAssetMutation();
  const assignMutation = useAssignAssetMutation();
  const returnMutation = useReturnAssetMutation();

  const assets: Asset[] = (assetsData as any)?.records || [];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'RETIRED', label: 'Retired' },
  ];

  const handleOpenForm = (asset?: Asset) => {
    setSelectedAsset(asset || null);
    setFormData(asset ? {
      name: asset.name, brand: asset.brand || '', model: asset.model || '',
      serial_number: asset.serial_number || '', notes: asset.notes || '',
      category_id: asset.category?.id || '',
    } : {});
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedAsset) {
        await updateMutation.mutateAsync({ id: selectedAsset.id, data: formData });
        toast.success('Asset updated');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Asset created');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save asset');
    }
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    try {
      await deleteMutation.mutateAsync(selectedAsset.id);
      toast.success('Asset retired');
      setIsDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to retire asset');
    }
  };

  const handleAssign = async () => {
    if (!selectedAsset || !assignUserId) return;
    try {
      await assignMutation.mutateAsync({ id: selectedAsset.id, data: { user_id: assignUserId } });
      toast.success('Asset assigned');
      setIsAssignOpen(false);
      setAssignUserId('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign asset');
    }
  };

  const handleReturn = async (asset: Asset) => {
    try {
      await returnMutation.mutateAsync({ id: asset.id, data: { returned_condition: 'GOOD' } });
      toast.success('Asset returned');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to return asset');
    }
  };

  const columns: Column<Asset>[] = [
    { header: 'S.No', key: 'id', width: '60px', render: (_, i) => <span className="text-gray-400 font-medium">{i + 1}</span> },
    {
      header: 'Asset', key: 'name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <Package size={16} />
          </div>
          <div>
            <p className="font-black text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-400 font-bold">{item.asset_tag}</p>
          </div>
        </div>
      ),
    },
    { header: 'Category', key: 'category', render: (item) => <span className="font-bold text-gray-600">{item.category?.name || '—'}</span> },
    { header: 'Brand / Model', key: 'brand', render: (item) => <span className="text-gray-600">{[item.brand, item.model].filter(Boolean).join(' / ') || '—'}</span> },
    { header: 'Serial #', key: 'serial_number', render: (item) => <span className="font-mono text-xs text-gray-500">{item.serial_number || '—'}</span> },
    {
      header: 'Status', key: 'status',
      render: (item) => (
        <Badge variant="info" className={cn('text-[10px] font-bold border rounded-lg px-2 py-0.5', STATUS_COLORS[item.status] || '')}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: 'Assigned To', key: 'assignments',
      render: (item) => {
        const assignment = item.assignments?.[0];
        return assignment?.user ? (
          <span className="font-medium text-gray-700">{assignment.user.first_name} {assignment.user.last_name}</span>
        ) : <span className="text-gray-300">—</span>;
      },
    },
    {
      header: 'Actions', key: 'actions', align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {item.status === 'AVAILABLE' && (
            <button onClick={() => { setSelectedAsset(item); setIsAssignOpen(true); }}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Assign">
              <UserCheck size={16} />
            </button>
          )}
          {item.status === 'ASSIGNED' && (
            <button onClick={() => handleReturn(item)}
              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all" title="Return">
              <RotateCcw size={16} />
            </button>
          )}
          <button onClick={() => handleOpenForm(item)}
            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all">
            <Edit2 size={16} />
          </button>
          <button onClick={() => { setSelectedAsset(item); setIsDeleteOpen(true); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Asset Management</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Track and manage company assets, assignments and maintenance.</p>
      </div>

      <Card className="flex flex-col gap-6 shadow-2xl border-none p-8 rounded-[2rem]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Input placeholder="Search assets..." leftIcon={Search} value={search}
              onChange={(e) => setSearch(e.target.value)} containerClassName="min-w-[240px]" className="h-11 rounded-xl" />
            <div className="w-44">
              <Select options={categoryOptions} value={categoryFilter} onChange={(v) => setCategoryFilter(v as string)}
                className="h-11 !rounded-xl text-xs font-bold" />
            </div>
            <div className="w-40">
              <Select options={statusOptions} value={statusFilter} onChange={(v) => setStatusFilter(v as string)}
                className="h-11 !rounded-xl text-xs font-bold" />
            </div>
          </div>
          <Button variant="primary" size="md" onClick={() => handleOpenForm()}
            className="gap-2 rounded-xl h-11 font-black px-6 shadow-lg shadow-primary-100 shrink-0">
            <Plus size={18} /> Add Asset
          </Button>
        </div>

        <Table columns={columns} data={assets} isLoading={isLoading} emptyMessage="No assets found." />
      </Card>

      {/* Asset Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={selectedAsset ? 'Edit Asset' : 'Add New Asset'}>
        <div className="flex flex-col gap-4 mt-4">
          {[
            { key: 'name', label: 'Asset Name *', placeholder: 'e.g. Dell Laptop' },
            { key: 'brand', label: 'Brand', placeholder: 'e.g. Dell' },
            { key: 'model', label: 'Model', placeholder: 'e.g. Inspiron 15' },
            { key: 'serial_number', label: 'Serial Number', placeholder: 'e.g. SN-12345' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{label}</label>
              <input value={formData[key] || ''} onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none" />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Category</label>
            <select value={formData.category_id || ''} onChange={(e) => setFormData((p) => ({ ...p, category_id: e.target.value }))}
              className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}>
              {selectedAsset ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title={`Assign: ${selectedAsset?.name}`}>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Assign To</label>
            <select value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}
              className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none">
              <option value="">Select employee</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} — {u.email}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleAssign} disabled={!assignUserId}
              loading={assignMutation.isPending}>Assign Asset</Button>
          </div>
        </div>
      </Modal>

      <ActionModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete}
        loading={deleteMutation.isPending} title="Retire Asset"
        description={`Are you sure you want to retire "${selectedAsset?.name}"? This will mark it as RETIRED.`}
        confirmText="Retire Asset" icon="delete" />
    </div>
  );
};

export default AssetManagement;
