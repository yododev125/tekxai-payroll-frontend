import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { Calculator, Plus, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToastContext } from '@/components/toast/ToastProvider';
import { useGetPerformanceScoresQuery, useUpsertScoreMutation, type PerformanceScore } from '@/services/performanceService';
import { useFetchUsersQuery } from '@/services/userService';

/**
 * Estimator Performance Scoring:
 * Accuracy of Estimates: 40
 * Timely Submission:     25
 * Documentation Quality: 15
 * Team Collaboration:    10
 * Attendance:            10
 * Total:                100
 */

const PERIOD_OPTIONS = [
  { value: 'June 2026', label: 'Jun 2026' },
  { value: 'May 2026', label: 'May 2026' },
  { value: 'April 2026', label: 'Apr 2026' },
];

const EST_DIVISIONS = [
  { id: 'EST-PAINT-AUS', label: 'Paint Team Australia' },
  { id: 'EST-GC-AUS', label: 'GC Team Australia' },
  { id: 'EST-HYDRO-AUS', label: 'Hydro Team Australia' },
  { id: 'EST-GC-US', label: 'GC Team United States' },
];

const EstimatorTracker: React.FC = () => {
  const toast = useToastContext();
  const [period, setPeriod] = useState('June 2026');
  const [division, setDivision] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    user_id: '',
    period: 'June 2026',
    score_type: 'ESTIMATION',
    timely_delivery: 0,
    quality_score: 0,
    regularity: 0,
    punctuality: 0,
    dress_code: 0,
  });

  const { data: scores = [], isLoading } = useGetPerformanceScoresQuery({ period, score_type: 'ESTIMATION' });
  const { data: users = [] } = useFetchUsersQuery({});
  const upsertMutation = useUpsertScoreMutation();

  const scoreLabels = [
    { key: 'timely_delivery', label: 'Accuracy of Estimates', max: 40 },
    { key: 'quality_score', label: 'Timely Submission', max: 25 },
    { key: 'regularity', label: 'Documentation Quality', max: 15 },
    { key: 'punctuality', label: 'Team Collaboration', max: 10 },
    { key: 'dress_code', label: 'Attendance', max: 10 },
  ];

  const handleSubmitScore = async () => {
    if (!scoreForm.user_id) { toast.error('Select an employee'); return; }
    const total = scoreLabels.reduce((s, l) => s + (scoreForm as any)[l.key], 0);
    if (total > 100) { toast.error('Total score cannot exceed 100'); return; }
    try {
      await upsertMutation.mutateAsync({ ...scoreForm, period });
      toast.success('Score saved');
      setIsFormOpen(false);
    } catch (err: any) { toast.error(err?.data?.message || 'Failed to save score'); }
  };

  const getLevel = (score: number) => {
    if (score >= 95) return { label: 'Outstanding', color: 'bg-purple-50 text-purple-700 border-purple-100' };
    if (score >= 85) return { label: 'Excellent', color: 'bg-blue-50 text-blue-700 border-blue-100' };
    if (score >= 75) return { label: 'Good', color: 'bg-green-50 text-green-700 border-green-100' };
    if (score >= 50) return { label: 'Average', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' };
    return { label: 'Needs Improvement', color: 'bg-red-50 text-red-700 border-red-100' };
  };

  const columns: Column<PerformanceScore>[] = [
    { header: 'Employee', key: 'user_id', render: (item) => <span className="font-black text-gray-900">{item.user?.first_name} {item.user?.last_name}</span> },
    { header: 'Period', key: 'period', render: (item) => <span className="font-bold text-gray-600">{item.period}</span> },
    { header: 'Estimate Accuracy', key: 'timely_delivery', render: (item) => <span className="font-bold">{item.timely_delivery}/40</span> },
    { header: 'Timely Submission', key: 'quality_score', render: (item) => <span className="font-bold">{item.quality_score}/25</span> },
    { header: 'Doc Quality', key: 'regularity', render: (item) => <span className="font-bold">{item.regularity}/15</span> },
    { header: 'Collaboration', key: 'punctuality', render: (item) => <span className="font-bold">{item.punctuality}/10</span> },
    { header: 'Attendance', key: 'dress_code', render: (item) => <span className="font-bold">{item.dress_code}/10</span> },
    {
      header: 'Total', key: 'total_score',
      render: (item) => {
        const lvl = getLevel(item.total_score);
        return (
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-gray-900">{item.total_score}</span>
            <Badge variant="info" className={cn('text-[10px] font-bold border rounded-lg px-2 py-0.5', lvl.color)}>{lvl.label}</Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Estimator Performance Tracker</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Track estimator team performance across all divisions.</p>
      </div>

      {/* Division Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {EST_DIVISIONS.map((div) => (
          <Card key={div.id} className={cn('border-2 cursor-pointer transition-all', division === div.id ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-gray-200')}
            onClick={() => setDivision(division === div.id ? '' : div.id)}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                <Calculator size={18} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">{div.label}</p>
                <p className="text-xs text-gray-400 font-mono">{div.id}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-6 border-none shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-gray-900">Estimator Scores</h2>
            <div className="w-36">
              <Select options={PERIOD_OPTIONS} value={period} onChange={(v) => setPeriod(v as string)} className="h-9 !rounded-xl text-xs" />
            </div>
          </div>
          <Button variant="primary" size="md" onClick={() => setIsFormOpen(true)}
            className="gap-2 rounded-xl h-10 font-black px-5 shadow-lg shadow-primary-100">
            <Plus size={16} /> Add Score
          </Button>
        </div>
        <Table columns={columns} data={scores as any} isLoading={isLoading} emptyMessage="No estimator scores for this period." />
      </Card>

      {/* Score Entry Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Estimator Score">
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Employee</label>
            <select value={scoreForm.user_id} onChange={(e) => setScoreForm((p) => ({ ...p, user_id: e.target.value }))}
              className="h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-100 outline-none">
              <option value="">Select employee</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
            </select>
          </div>
          {scoreLabels.map(({ key, label, max }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{label}</label>
                <span className="text-[10px] font-bold text-gray-400">
                  {(scoreForm as any)[key]} / {max}
                </span>
              </div>
              <input type="range" min="0" max={max} value={(scoreForm as any)[key]}
                onChange={(e) => setScoreForm((p) => ({ ...p, [key]: +e.target.value }))}
                className="w-full" />
            </div>
          ))}
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-gray-500">Total Score</p>
            <p className="text-3xl font-black text-gray-900">
              {scoreLabels.reduce((s, l) => s + (scoreForm as any)[l.key], 0)} / 100
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleSubmitScore} loading={upsertMutation.isPending}>Save Score</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EstimatorTracker;
