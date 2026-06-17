import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ActionModal from '@/components/ui/ActionModal';
import Modal from '@/components/ui/Modal';
import { Search, Plus, Edit2, Trash2, Building2, ChevronRight, Users } from 'lucide-react';
import { useToastContext } from '@/components/toast/ToastProvider';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  type Department,
} from '@/services/departmentService';

const DepartmentManagement: React.FC = () => {
  const toast = useToastContext();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDivOpen, setIsDivOpen] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [divForm, setDivForm] = useState({ name: '', code: '', description: '' });
  const debouncedSearch = useDebounce(search, 400);

  const { data: departments = [], isLoading } = useGetDepartmentsQuery(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );
  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();
  const deleteMutation = useDeleteDepartmentMutation();

  const handleOpenForm = (dept?: Department) => {
    setSelected(dept || null);
    setFormData(dept ? { name: dept.name, code: dept.code || '', description: dept.description || '' } : { name: '', code: '', description: '' });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, data: formData });
        toast.success('Department updated');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Department created');
      }
      setIsFormOpen(false);
    } catch (err: any) { toast.error(err?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success('Department deleted');
      setIsDeleteOpen(false);
    } catch (err: any) { toast.error(err?.data?.message || 'Failed to delete'); }
  };

  const handleAddDivision = (dept: Department) => {
    setSelected(dept);
    setDivForm({ name: '', code: '', description: '' });
    setIsDivOpen(true);
  };

  const handleSubmitDivision = async () => {
    if (!selected || !divForm.name.trim()) { toast.error('Division name is required'); return; }
    try {
      const res = await fetch(`/api/v1/department/${selected.id}/divisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('tekxai_access_token')}` },
        body: JSON.stringify(divForm),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Division created');
      setIsDivOpen(false);
    } catch { toast.error('Failed to create division'); }
  };

  const columns: Column<Department>[] = [
    { header: 'S.No', key: 'id', width: '60px', render: (_, i) => <span className="text-gray-400">{i + 1}</span> },
    {
      header: 'Department', key: 'name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><Building2 size={16} /></div>
          <div>
            <p className="font-black text-gray-900">{item.name}</p>
            {item.code && <p className="text-xs text-gray-400 font-mono">{item.code}</p>}
          </div>
        </div>
      ),
    },
    { header: 'Description', key: 'description', render: (item) => <span className="text-gray-500 text-sm">{item.description || '—'}</span> },
    {
      header: 'Divisions', key: 'divisions',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(item.divisions || []).slice(0, 3).map((d) => (
            <Badge key={d.id} variant="default" className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 border-blue-100 border rounded-lg">
              {d.name}
            </Badge>
          ))}
          {(item.divisions || []).length > 3 && (
            <span className="text-xs text-gray-400">+{item.divisions!.length - 3} more</span>
          )}
          {(item.divisions || []).length === 0 && <span className="text-xs text-gray-300 italic">No divisions</span>}
        </div>
      ),
    },
    {
      header: 'Staff', key: '_count',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Users size={14} />
          <span className="font-bold text-sm">{(item._count as any)?.users ?? 0}</span>
        </div>
      ),
    },
    {
      header: 'Actions', key: 'id', align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleAddDivision(item)}
            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all" title="Add Division">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => handleOpenForm(item)}
            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all">
            <Edit2 size={16} />
          </button>
          <button onClick={() => { setSelected(item); setIsDeleteOpen(true); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const FormField = ({ label, field, placeholder }: { label: string; field: keyof typeof formData; placeholder: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{label}</label>
      <input value={formData[field]} onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
        placeholder={placeholder}
        className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none" />
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Department & Division Management</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Manage organizational structure, departments, and divisions.</p>
      </div>

      <Card className="flex flex-col gap-6 shadow-2xl border-none p-8 rounded-[2rem]">
        <div className="flex items-center justify-between gap-4">
          <Input placeholder="Search departments..." leftIcon={Search} value={search}
            onChange={(e) => setSearch(e.target.value)} containerClassName="min-w-[280px]" className="h-11 rounded-xl" />
          <Button variant="primary" size="md" onClick={() => handleOpenForm()}
            className="gap-2 rounded-xl h-11 font-black px-6 shadow-lg shadow-primary-100 shrink-0">
            <Plus size={18} /> Add Department
          </Button>
        </div>
        <Table columns={columns} data={departments} isLoading={isLoading} emptyMessage="No departments found." />
      </Card>

      {/* Department Form */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={selected ? 'Edit Department' : 'Add Department'}>
        <div className="flex flex-col gap-4 mt-4">
          <FormField label="Department Name *" field="name" placeholder="e.g. Engineering" />
          <FormField label="Code" field="code" placeholder="e.g. ENG" />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Department description..." rows={2}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}>
              {selected ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Division Form */}
      <Modal isOpen={isDivOpen} onClose={() => setIsDivOpen(false)}
        title={`Add Division to ${selected?.name}`}>
        <div className="flex flex-col gap-4 mt-4">
          {[{ label: 'Division Name *', field: 'name', ph: 'e.g. Frontend Development' },
            { label: 'Code', field: 'code', ph: 'e.g. ENG-FE' },
            { label: 'Description', field: 'description', ph: 'Brief description...' }].map(({ label, field, ph }) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{label}</label>
              <input value={(divForm as any)[field]} onChange={(e) => setDivForm((p) => ({ ...p, [field]: e.target.value }))}
                placeholder={ph}
                className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setIsDivOpen(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleSubmitDivision}>Create Division</Button>
          </div>
        </div>
      </Modal>

      <ActionModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete}
        loading={deleteMutation.isPending} title="Delete Department"
        description={`Delete "${selected?.name}"? All divisions will also be removed.`}
        confirmText="Delete" icon="delete" />
    </div>
  );
};

export default DepartmentManagement;
