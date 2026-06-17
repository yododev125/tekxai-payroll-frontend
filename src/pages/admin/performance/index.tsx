import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Select from '@/components/ui/Select';
import { Trophy, Star, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToastContext } from '@/components/toast/ToastProvider';
import {
  useGetDailyReportsQuery, useGetPerformanceScoresQuery,
  useGetBonusRecordsQuery, useCalculateBonusMutation, useApproveBonusMutation,
  type DailyReport, type PerformanceScore, type BonusRecord,
} from '@/services/performanceService';

const PERIOD_OPTIONS = [
  { value: 'June 2026', label: 'Jun 2026' },
  { value: 'May 2026',  label: 'May 2026' },
  { value: 'April 2026',label: 'Apr 2026' },
];

const LEVEL_COLORS: Record<string, string> = {
  Outstanding:        'bg-purple-50 text-purple-700 border-purple-100',
  Excellent:          'bg-blue-50   text-blue-700   border-blue-100',
  Good:               'bg-green-50  text-green-700  border-green-100',
  Average:            'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Needs Improvement':'bg-red-50    text-red-700    border-red-100',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:  'bg-yellow-50 text-yellow-600 border-yellow-100',
  APPROVED: 'bg-green-50  text-green-600  border-green-100',
  REJECTED: 'bg-red-50    text-red-600    border-red-100',
  PAID:     'bg-blue-50   text-blue-600   border-blue-100',
};

const PerformanceManagement: React.FC = () => {
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState('Daily Reports');
  const [period, setPeriod] = useState('June 2026');

  const { data: reportsData, isLoading: reportsLoading } = useGetDailyReportsQuery({ limit: 20 });
  const { data: scores = [], isLoading: scoresLoading } = useGetPerformanceScoresQuery({ period });
  const { data: bonusData, isLoading: bonusLoading } = useGetBonusRecordsQuery({ period });

  const calcBonus = useCalculateBonusMutation();
  const approveBonus = useApproveBonusMutation();

  const reports: DailyReport[] = (reportsData as any)?.records || [];
  const bonusRecords: BonusRecord[] = (bonusData as any)?.records || [];

  const handleCalculateBonus = async (userId: string) => {
    try {
      await calcBonus.mutateAsync({ user_id: userId, period });
      toast.success('Bonus calculated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to calculate bonus');
    }
  };

  const handleApproveBonus = async (id: string) => {
    try {
      await approveBonus.mutateAsync(id);
      toast.success('Bonus approved');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to approve bonus');
    }
  };

  const reportColumns: Column<DailyReport>[] = [
    {
      header: 'Employee', key: 'user_id',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm">
            {item.user?.first_name?.[0]}{item.user?.last_name?.[0]}
          </div>
          <div>
            <p className="font-black text-gray-900">{item.user?.first_name} {item.user?.last_name}</p>
            <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</p>
          </div>
        </div>
      ),
    },
    { header: "Today's Progress", key: 'todays_progress', render: (item) => <span className="text-gray-700 text-sm line-clamp-2">{item.todays_progress}</span> },
    {
      header: 'Completion', key: 'completion_percentage',
      render: (item) => (
        <div className="flex items-center gap-2 w-28">
          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${item.completion_percentage}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-500">{item.completion_percentage}%</span>
        </div>
      ),
    },
    { header: 'Blockers', key: 'blockers', render: (item) => <span className="text-sm text-gray-500">{item.blockers || '—'}</span> },
    {
      header: 'Status', key: 'status',
      render: (item) => (
        <Badge variant="info" className={cn('text-[10px] font-bold border rounded-lg px-2 py-0.5',
          item.status === 'REVIEWED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100')}>
          {item.status}
        </Badge>
      ),
    },
  ];

  const scoreColumns: Column<PerformanceScore>[] = [
    {
      header: 'Employee', key: 'user_id',
      render: (item) => <span className="font-black text-gray-900">{item.user?.first_name} {item.user?.last_name}</span>,
    },
    { header: 'Period', key: 'period', render: (item) => <span className="font-bold text-gray-600">{item.period}</span> },
    { header: 'Delivery',    key: 'timely_delivery', render: (item) => <span className="font-bold">{item.timely_delivery}/35</span> },
    { header: 'Quality',     key: 'quality_score',   render: (item) => <span className="font-bold">{item.quality_score}/35</span> },
    { header: 'Regularity',  key: 'regularity',      render: (item) => <span className="font-bold">{item.regularity}/10</span> },
    { header: 'Punctuality', key: 'punctuality',     render: (item) => <span className="font-bold">{item.punctuality}/10</span> },
    { header: 'Dress Code',  key: 'dress_code',      render: (item) => <span className="font-bold">{item.dress_code}/10</span> },
    {
      header: 'Total', key: 'total_score',
      render: (item) => (
        <span className={cn('font-black text-lg', item.total_score >= 85 ? 'text-green-600' : item.total_score >= 75 ? 'text-blue-600' : item.total_score >= 50 ? 'text-yellow-600' : 'text-red-600')}>
          {item.total_score}
        </span>
      ),
    },
    {
      header: 'Bonus', key: 'total_score',
      render: (item) => (
        <Button size="sm" variant="outline" animation="none" rounded={false}
          className="rounded-lg h-8 text-xs" onClick={() => handleCalculateBonus(item.user_id)}
          loading={calcBonus.isPending}>
          Calculate
        </Button>
      ),
    },
  ];

  const bonusColumns: Column<BonusRecord>[] = [
    { header: 'User ID', key: 'user_id', render: (item) => <span className="font-mono text-xs text-gray-500">{item.user_id.slice(0, 8)}…</span> },
    { header: 'Period', key: 'period', render: (item) => <span className="font-bold">{item.period}</span> },
    {
      header: 'Score', key: 'average_score',
      render: (item) => <span className="font-black text-lg text-gray-900">{item.average_score}</span>,
    },
    {
      header: 'Level', key: 'performance_level',
      render: (item) => item.performance_level ? (
        <Badge variant="info" className={cn('text-[10px] font-bold border rounded-lg px-2 py-0.5', LEVEL_COLORS[item.performance_level] || '')}>
          {item.performance_level}
        </Badge>
      ) : <span>—</span>,
    },
    {
      header: 'Bonus (PKR)', key: 'bonus_amount',
      render: (item) => (
        <span className={cn('font-black', item.bonus_eligible ? 'text-green-600' : 'text-gray-400')}>
          {item.bonus_eligible ? `PKR ${item.bonus_amount.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      header: 'Status', key: 'approval_status',
      render: (item) => (
        <Badge variant="info" className={cn('text-[10px] font-bold border rounded-lg px-2 py-0.5', STATUS_COLORS[item.approval_status] || '')}>
          {item.approval_status}
        </Badge>
      ),
    },
    {
      header: 'Actions', key: 'id', align: 'right',
      render: (item) => item.approval_status === 'PENDING' && item.bonus_eligible ? (
        <Button size="sm" variant="primary" animation="none" rounded={false}
          className="rounded-lg h-8 text-xs" onClick={() => handleApproveBonus(item.id)}
          loading={approveBonus.isPending}>
          Approve
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Performance Management</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Track employee performance, scores and bonus eligibility.</p>
      </div>

      <Tabs options={['Daily Reports', 'Performance Scores', 'Bonus Records']} value={activeTab} onChange={setActiveTab} />

      {activeTab !== 'Daily Reports' && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-500">Period:</span>
          <div className="w-40">
            <Select options={PERIOD_OPTIONS} value={period} onChange={(v) => setPeriod(v as string)}
              className="h-10 !rounded-xl text-xs font-bold" />
          </div>
        </div>
      )}

      {activeTab === 'Daily Reports' && (
        <Card className="border-none shadow-sm">
          <Table columns={reportColumns} data={reports} isLoading={reportsLoading}
            emptyMessage="No daily reports submitted yet." />
        </Card>
      )}

      {activeTab === 'Performance Scores' && (
        <Card className="border-none shadow-sm">
          <Table columns={scoreColumns} data={scores} isLoading={scoresLoading}
            emptyMessage="No performance scores for this period." />
        </Card>
      )}

      {activeTab === 'Bonus Records' && (
        <Card className="border-none shadow-sm">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Eligible for Bonus', value: bonusRecords.filter((b) => b.bonus_eligible).length, icon: <Trophy size={20} />, color: 'text-yellow-500 bg-yellow-50' },
              { label: 'Approved', value: bonusRecords.filter((b) => b.approval_status === 'APPROVED').length, icon: <Star size={20} />, color: 'text-green-500 bg-green-50' },
              { label: 'Total Payout (PKR)', value: bonusRecords.filter((b) => b.approval_status === 'APPROVED').reduce((s, b) => s + b.bonus_amount, 0).toLocaleString(), icon: <DollarSign size={20} />, color: 'text-blue-500 bg-blue-50' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', stat.color)}>{stat.icon}</div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs font-bold text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
          <Table columns={bonusColumns} data={bonusRecords} isLoading={bonusLoading}
            emptyMessage="No bonus records for this period." />
        </Card>
      )}
    </div>
  );
};

export default PerformanceManagement;
