import React, { useState, useMemo } from 'react';
import { useGetDashboardStatsQuery } from '@/services/adminService';
import { useGetProjects, ProjectDetail } from '@/services/projectService';
import { useGetWeeklyTimesheet, TimesheetEntry } from '@/services/timesheetService';
import { useGetRecentActivity } from '@/services/employeeService';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { Search, CheckCircle, Briefcase, FileText, Clock, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import ProjectDetailsSlideOver from '@/components/ui/ProjectDetailsSlideOver';
import { StatSkeleton, CardSkeleton } from '@/components/skeletons';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: timesheet, isLoading: timesheetLoading } = useGetWeeklyTimesheet();
  const { data: projects, isLoading: projectsLoading } = useGetProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const itemsPerPage = 8;

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) =>
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.status || '').toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [projects, searchTerm]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const timesheetRows: TimesheetEntry[] = timesheet?.rows?.filter((r) => r.has_entry) || [];

  const timesheetColumns: Column<TimesheetEntry>[] = [
    { header: 'Day', key: 'day_date', render: (item) => <span className="font-bold">{item.day_label || item.day_date}</span> },
    { header: 'Employee', key: 'employee', render: (item) => <span>{(item as any).employee || 'N/A'}</span> },
    { header: 'Check-in',  key: 'check_in',  render: (item) => <span className={!item.has_entry ? 'text-gray-400' : ''}>{item.check_in || '—'}</span> },
    { header: 'Check-out', key: 'check_out', render: (item) => <span className={!item.has_entry ? 'text-gray-400' : ''}>{item.check_out || '—'}</span> },
    { header: 'Duration',  key: 'duration_label', render: (item) => <span>{item.duration_label}</span> },
    {
      header: 'Status', key: 'status',
      render: (item) => {
        const styles: Record<string, string> = {
          'In Progress': 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
          'Overdue':     'bg-[#FFF1F3] text-[#C01048] border-[#FEB3B3]',
          'Pending':     'bg-[#FFF6ED] text-[#C4320A] border-[#FFD6AE]',
          'Completed':   'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]',
        };
        const label = item.status_label || item.status || '';
        return (
          <Badge variant="info" className={cn('rounded-lg px-3 py-1 text-[10px] font-bold border', styles[label] || '')}>
            {label}
          </Badge>
        );
      },
    },
  ];

  const projectColumns: Column<ProjectDetail>[] = [
    {
      header: 'Project Title', key: 'title',
      render: (item) => (
        <button onClick={() => setSelectedProject(item.id)}
          className="text-left font-black text-gray-900 hover:text-primary-500 hover:underline underline-offset-4">
          {item.title}
        </button>
      ),
    },
    {
      header: 'Members', key: 'members',
      render: (item) => (
        <div className="flex -space-x-2">
          {item.members?.slice(0, 3).map((m: any, i: number) => (
            <div key={i} className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
              {m?.first_name?.[0] || 'U'}
            </div>
          ))}
          {(item.member_count || 0) > 3 && (
            <div className="h-7 w-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
              +{item.member_count - 3}
            </div>
          )}
        </div>
      ),
    },
    { header: 'Hours', key: 'total_hours', render: (item) => `${item.total_hours || 0}h` },
    {
      header: 'Progress', key: 'progress',
      render: (item) => (
        <div className="flex flex-col gap-1 w-28">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#005CDA] to-[#0148FF] rounded-full"
              style={{ width: `${item.progress || 0}%` }} />
          </div>
          <span className="text-[10px] font-bold text-gray-400">{item.progress || 0}%</span>
        </div>
      ),
    },
    {
      header: 'Status', key: 'status',
      render: (item) => {
        const styles: Record<string, string> = {
          IN_PROGRESS: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
          OVERDUE:     'bg-[#FFF1F3] text-[#C01048] border-[#FEB3B3]',
          PENDING:     'bg-[#FFF6ED] text-[#C4320A] border-[#FFD6AE]',
          COMPLETED:   'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]',
        };
        const key = (item.status || 'PENDING').toUpperCase();
        return (
          <Badge variant="info" className={cn('rounded-lg px-3 py-1 text-[10px] font-bold border', styles[key] || '')}>
            {key.replace('_', ' ')}
          </Badge>
        );
      },
    },
    { header: 'Due Date', key: 'end_date', render: (item) => item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <ProjectDetailsSlideOver isOpen={!!selectedProject} onClose={() => setSelectedProject(null)}
        projectId={selectedProject} routePrefix="/admin" />

      {/* Stats Row */}
      <div className="p-3 rounded-[8px] bg-white">
        <div className="bg-[#F8F8F8] grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 py-4">
          {statsLoading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <DashboardStatCard showDivider icon={<CheckCircle size={20} />} iconClassName="bg-blue-50 text-primary-600"
                value={stats?.completedProjects ?? 0} label="Completed Projects"
                subtext={<>Total Projects: <span className="text-primary-600 font-semibold">{stats?.totalProjects ?? 0}</span></>} />
              <DashboardStatCard showDivider icon={<FileText size={20} />} iconClassName="bg-orange-50 text-orange-500"
                value={stats?.overdueProjects ?? 0} label="Overdue Projects" subtext="Needs attention" />
              <DashboardStatCard showDivider icon={<Clock size={20} />} iconClassName="bg-sky-50 text-sky-600"
                value={stats?.pendingTimesheets ?? 0} label="Edit Requests" subtext="Awaiting review" />
              <DashboardStatCard icon={<Users size={20} />} iconClassName="bg-green-50 text-green-600"
                value={stats?.pendingTimeOff ?? 0} label="Time-Off Requests" subtext="Pending approval" />
            </>
          )}
        </div>
      </div>

      {/* Middle: Timesheet + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card isLoading={timesheetLoading} className="lg:col-span-3 flex flex-col gap-6 border-none">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Weekly Timesheet</h2>
          <Table columns={timesheetColumns} data={timesheetRows} isLoading={timesheetLoading}
            className="border-none shadow-none" emptyMessage="No timesheet entries this week." />
        </Card>

        <Card isLoading={activityLoading} className="lg:col-span-2 flex flex-col gap-6 border-none">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Activity</h2>
          {activityLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} className="!p-0 !bg-transparent !border-0 !shadow-none" />)}
            </div>
          ) : (activity && activity.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activity.map((act) => <RecentActivityCard key={act.id} activity={act} />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-medium text-center py-8">No recent activity</p>
          )}
        </Card>
      </div>

      {/* Projects Summary */}
      <Card isLoading={projectsLoading} className="flex flex-col gap-6 border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 text-primary-500 rounded-xl"><Briefcase size={20} /></div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Projects Summary</h2>
          </div>
          <Input placeholder="Search projects..." leftIcon={Search} value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            containerClassName="w-full md:w-64" />
        </div>
        <Table columns={projectColumns} data={paginatedProjects} isLoading={projectsLoading}
          pagination={{ currentPage, totalPages, onPageChange: setCurrentPage, totalEntries: filteredProjects.length, entriesPerPage: itemsPerPage }}
          emptyMessage="No projects found." />
      </Card>
    </div>
  );
};

export default Dashboard;
