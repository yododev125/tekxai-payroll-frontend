import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Users, Clock, TrendingUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToastContext } from '@/components/toast/ToastProvider';
import { useGetTimesheetRequests, useApproveTimeOffMutation, useRejectTimeOffMutation, type TimeOffRequest } from '@/services/timesheetService';
import { useFetchUsersQuery } from '@/services/userService';
import { useGetBonusRecordsQuery, useApproveBonusMutation } from '@/services/performanceService';
import { StatSkeleton } from '@/components/skeletons';

const HR_TABS = ['Leave Requests', 'Attendance Overview', 'Bonus Approvals'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  APPROVED: 'bg-green-50 text-green-600 border-green-100',
  REJECTED: 'bg-red-50 text-red-600 border-red-100',
};

const HRDashboard: React.FC = () => {
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState('Leave Requests');
  const [period, setPeriod] = useState('June 2026');

  const { data: requestData, isLoading: reqLoading } = useGetTimesheetRequests();
  const { data: users = [], isLoading: usersLoading } = useFetchUsersQuery({});
  const { data: bonusData, isLoading: bonusLoading } = useGetBonusRecordsQuery({ period });

  const approveMutation = useApproveTimeOffMutation();
  const rejectMutation = useRejectTimeOffMutation();
  const approveBonus = useApproveBonusMutation();

  const timeOffReqs: TimeOffRequest[] = requestData?.time_off_requests || [];
  const bonusRecords: any[] = (bonusData as any)?.records || [];

  const stats = [
    { label: 'Total Employees', value: users.length, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Leave', value: timeOffReqs.filter((r) => r.status === 'PENDING').length, icon: <Clock size={20} />, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Approved This Month', value: timeOffReqs.filter((r) => r.status === 'APPROVED').length, icon: <CheckCircle size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Bonuses', value: bonusRecords.filter((b) => b.approval_status === 'PENDING').length, icon: <TrendingUp size={20} />, color: 'bg-purple-50 text-purple-600' },
  ];

  const handleApprove = async (id: string) => {
    try { await approveMutation.mutateAsync(id); toast.success('Approved'); }
    catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id: string) => {
    try { await rejectMutation.mutateAsync(id); toast.success('Rejected'); }
    catch { toast.error('Failed to reject'); }
  };

  const leaveColumns: Column<TimeOffRequest>[] = [
    {
      header: 'Employee', key: 'user_id',
      render: (item) => <span className="font-bold">{item.name || 'Unknown'}</span>,
    },
    { header: 'Policy', key: 'policy_name', render: (item) => <span className="text-gray-600">{item.policy_name || 'Leave'}</span> },
    { header: 'Duration', key: 'date_range_label', render: (item) => <span className="text-sm text-gray-500">{item.date_range_label}</span> },
    { header: 'Days', key: 'days', render: (item) => <span className="font-bold">{item.days || 1} days</span> },
    {
      header: 'Status', key: 'status',
      render: (item) => (
        <Badge variant="info" className={cn('text-[10px] font-bold border rounded-lg px-2 py-0.5',
          STATUS_COLORS[item.status || 'PENDING'] || STATUS_COLORS.PENDING)}>
          {item.status_label || item.status}
        </Badge>
      ),
    },
    {
      header: 'Actions', key: 'id', align: 'right',
      render: (item: any) => item.status === 'PENDING' ? (
        <div className="flex gap-2 justify-end">
          <button onClick={() => handleApprove(item.id)}
            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-all" title="Approve">
            <CheckCircle size={16} />
          </button>
          <button onClick={() => handleReject(item.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Reject">
            <XCircle size={16} />
          </button>
        </div>
      ) : null,
    },
  ];

  const userColumns: Column<any>[] = [
    {
      header: 'Employee', key: 'first_name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm">
            {item.first_name?.[0]}{item.last_name?.[0]}
          </div>
          <div>
            <p className="font-black text-gray-900">{item.first_name} {item.last_name}</p>
            <p className="text-xs text-gray-400">{item.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Department', key: 'department', render: (item) => <span className="text-gray-600">{item.department || '—'}</span> },
    { header: 'Role', key: 'role', render: (item) => <span className="font-bold text-gray-700">{item.role_name || item.role?.name || 'Employee'}</span> },
    {
      header: 'Status', key: 'status',
      render: (item) => (
        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'error'}
          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg">
          {item.status || 'INACTIVE'}
        </Badge>
      ),
    },
  ];

  const bonusColumns: Column<any>[] = [
    { header: 'Employee ID', key: 'user_id', render: (item) => <span className="font-mono text-xs">{item.user_id?.slice(0, 12)}…</span> },
    { header: 'Period', key: 'period', render: (item) => <span className="font-bold">{item.period}</span> },
    { header: 'Score', key: 'average_score', render: (item) => <span className="font-black text-lg">{item.average_score}</span> },
    { header: 'Level', key: 'performance_level', render: (item) => <span className="font-bold text-gray-700">{item.performance_level || '—'}</span> },
    { header: 'Bonus (PKR)', key: 'bonus_amount', render: (item) => <span className={cn('font-black', item.bonus_eligible ? 'text-green-600' : 'text-gray-400')}>{item.bonus_eligible ? `PKR ${item.bonus_amount?.toLocaleString()}` : '—'}</span> },
    {
      header: 'Status', key: 'approval_status',
      render: (item) => (
        <Badge variant="info" className={cn('text-[10px] font-bold border rounded-lg px-2 py-0.5',
          STATUS_COLORS[item.approval_status] || STATUS_COLORS.PENDING)}>
          {item.approval_status}
        </Badge>
      ),
    },
    {
      header: 'Actions', key: 'id', align: 'right',
      render: (item) => item.approval_status === 'PENDING' && item.bonus_eligible ? (
        <Button size="sm" variant="primary" animation="none" rounded={false} className="rounded-lg h-8 text-xs"
          onClick={() => approveBonus.mutateAsync(item.id).then(() => toast.success('Bonus approved')).catch(() => toast.error('Failed'))}
          loading={approveBonus.isPending}>
          Approve
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">HR Dashboard</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Manage leave requests, attendance, and bonus approvals.</p>
      </div>

      {/* Stats */}
      <div className="p-3 bg-white rounded-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8F8F8] p-3 rounded-lg">
          {usersLoading || reqLoading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) :
            stats.map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', s.color)}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs font-bold text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <Tabs options={HR_TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === 'Leave Requests' && (
        <Card className="border-none shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">Time-Off Requests</h2>
          <Table columns={leaveColumns} data={timeOffReqs} isLoading={reqLoading} emptyMessage="No leave requests." />
        </Card>
      )}

      {activeTab === 'Attendance Overview' && (
        <Card className="border-none shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">All Employees</h2>
          <Table columns={userColumns} data={users} isLoading={usersLoading} emptyMessage="No employees found." />
        </Card>
      )}

      {activeTab === 'Bonus Approvals' && (
        <Card className="border-none shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-black text-gray-900">Bonus Approvals</h2>
            <div className="w-36">
              <Select options={[{ value: 'June 2026', label: 'Jun 2026' }, { value: 'May 2026', label: 'May 2026' }]}
                value={period} onChange={(v) => setPeriod(v as string)} className="h-9 !rounded-xl text-xs" />
            </div>
          </div>
          <Table columns={bonusColumns} data={bonusRecords} isLoading={bonusLoading} emptyMessage="No bonus records." />
        </Card>
      )}
    </div>
  );
};

export default HRDashboard;
