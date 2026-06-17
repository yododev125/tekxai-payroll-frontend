import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { FileText, Plus, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToastContext } from '@/components/toast/ToastProvider';
import { useGetDailyReportsQuery, useCreateDailyReportMutation, type DailyReport } from '@/services/performanceService';
import { useAuth } from '@/hooks/useAuth';
import Modal from '@/components/ui/Modal';
import { useGetProjects } from '@/services/projectService';

const DailyReportPage: React.FC = () => {
  const toast = useToastContext();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    todays_progress: '',
    completion_percentage: 0,
    blockers: '',
    tomorrow_plan: '',
    project_id: '',
  });

  const { data: reportsData, isLoading } = useGetDailyReportsQuery({ limit: 10 });
  const { data: projects = [] } = useGetProjects();
  const createMutation = useCreateDailyReportMutation();

  const reports: DailyReport[] = (reportsData as any)?.records || [];
  const total: number = (reportsData as any)?.total || 0;

  const handleSubmit = async () => {
    if (!form.todays_progress.trim()) {
      toast.error("Today's progress is required");
      return;
    }
    try {
      await createMutation.mutateAsync({ ...form, date: new Date().toISOString() });
      toast.success("Daily report submitted!");
      setIsOpen(false);
      setForm({ todays_progress: '', completion_percentage: 0, blockers: '', tomorrow_plan: '', project_id: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit report');
    }
  };

  const columns: Column<DailyReport>[] = [
    {
      header: 'Date', key: 'date',
      render: (item) => <span className="font-bold text-gray-700">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>,
    },
    { header: "Today's Progress", key: 'todays_progress', render: (item) => <span className="text-sm text-gray-700 line-clamp-2">{item.todays_progress}</span> },
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
    { header: 'Blockers', key: 'blockers', render: (item) => <span className="text-sm text-gray-500">{item.blockers || 'None'}</span> },
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

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Daily Progress Reports</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Submit and track your daily work progress.</p>
        </div>
        <Button variant="primary" className="rounded-xl gap-2 h-11 px-6 font-black" onClick={() => setIsOpen(true)}>
          <Plus size={18} /> Submit Today's Report
        </Button>
      </div>

      {/* Today's prompt */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="font-black text-gray-900 text-lg">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.first_name}!</p>
            <p className="text-gray-500 font-medium text-sm">Don't forget to submit your daily progress report before end of day.</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
              <CheckCircle size={16} className="text-green-500" />
              {total} reports submitted
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-none shadow-sm">
        <h2 className="text-lg font-black text-gray-900 mb-4">My Reports</h2>
        <Table columns={columns} data={reports} isLoading={isLoading} emptyMessage="No reports yet. Submit your first report!" />
      </Card>

      {/* Submit Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Submit Daily Report">
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Today's Progress *</label>
            <textarea rows={3} value={form.todays_progress}
              onChange={(e) => setForm((p) => ({ ...p, todays_progress: e.target.value }))}
              placeholder="What did you accomplish today?"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Completion % — {form.completion_percentage}%</label>
            <input type="range" min="0" max="100" value={form.completion_percentage}
              onChange={(e) => setForm((p) => ({ ...p, completion_percentage: +e.target.value }))}
              className="w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Blockers / Issues</label>
            <textarea rows={2} value={form.blockers}
              onChange={(e) => setForm((p) => ({ ...p, blockers: e.target.value }))}
              placeholder="Any blockers or issues? (optional)"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Tomorrow's Plan</label>
            <textarea rows={2} value={form.tomorrow_plan}
              onChange={(e) => setForm((p) => ({ ...p, tomorrow_plan: e.target.value }))}
              placeholder="What will you work on tomorrow? (optional)"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleSubmit} loading={createMutation.isPending}>
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DailyReportPage;
