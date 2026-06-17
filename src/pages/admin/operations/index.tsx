import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import { Package, Wrench, MapPin, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useGetAssetsQuery, type Asset } from '@/services/assetService';
import { StatSkeleton } from '@/components/skeletons';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:   'bg-green-50  text-green-600  border-green-100',
  ASSIGNED:    'bg-blue-50   text-blue-600   border-blue-100',
  MAINTENANCE: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  DAMAGED:     'bg-red-50    text-red-600    border-red-100',
  RETIRED:     'bg-gray-50   text-gray-400   border-gray-100',
};

const OPS_TABS = ['Asset Overview', 'Maintenance Schedule', 'Location Map'];

const OperationsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Asset Overview');
  const { data: assetsData, isLoading } = useGetAssetsQuery({});
  const assets: Asset[] = (assetsData as any)?.records || [];
  const total: number = (assetsData as any)?.total || 0;

  const stats = [
    { label: 'Total Assets', value: total, icon: <Package size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Available', value: assets.filter((a) => a.status === 'AVAILABLE').length, icon: <Package size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'Assigned', value: assets.filter((a) => a.status === 'ASSIGNED').length, icon: <Package size={20} />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'In Maintenance', value: assets.filter((a) => a.status === 'MAINTENANCE').length, icon: <Wrench size={20} />, color: 'bg-yellow-50 text-yellow-600' },
  ];

  const assetColumns: Column<Asset>[] = [
    {
      header: 'Asset', key: 'name',
      render: (item) => (
        <div>
          <p className="font-black text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-400 font-mono">{item.asset_tag}</p>
        </div>
      ),
    },
    { header: 'Category', key: 'category', render: (item) => <span className="text-gray-600">{item.category?.name || '—'}</span> },
    { header: 'Brand/Model', key: 'brand', render: (item) => <span className="text-gray-500 text-sm">{[item.brand, item.model].filter(Boolean).join(' / ') || '—'}</span> },
    {
      header: 'Location', key: 'location',
      render: (item) => item.location ? (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <MapPin size={12} />
          {item.location.office} – {item.location.floor || ''} {item.location.room || ''}
        </div>
      ) : <span className="text-gray-300">—</span>,
    },
    {
      header: 'Status', key: 'status',
      render: (item) => (
        <Badge variant="info" className={cn('text-[10px] font-bold border rounded-lg px-2 py-0.5', STATUS_COLORS[item.status] || '')}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: 'Warranty Expiry', key: 'warranty_expiry',
      render: (item) => {
        if (!item.warranty_expiry) return <span className="text-gray-300">—</span>;
        const exp = new Date(item.warranty_expiry);
        const soon = exp.getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000;
        return (
          <span className={cn('font-bold text-sm', soon ? 'text-red-500' : 'text-gray-600')}>
            {exp.toLocaleDateString()}
            {soon && <span className="ml-1 text-[10px] bg-red-50 text-red-500 px-1 rounded">Expiring</span>}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Operations Dashboard</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Facility management, asset tracking, and procurement overview.</p>
      </div>

      {/* Stats */}
      <div className="p-3 bg-white rounded-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8F8F8] p-3 rounded-lg">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) :
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

      <Tabs options={OPS_TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === 'Asset Overview' && (
        <Card className="border-none shadow-sm">
          <Table columns={assetColumns} data={assets} isLoading={isLoading} emptyMessage="No assets recorded." />
        </Card>
      )}

      {activeTab === 'Maintenance Schedule' && (
        <Card className="border-none shadow-sm">
          <div className="text-center py-16">
            <Wrench size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="font-black text-gray-400 text-lg">Maintenance Logs</p>
            <p className="text-sm text-gray-300 mt-2">View and schedule maintenance from the Asset Management panel.</p>
          </div>
        </Card>
      )}

      {activeTab === 'Location Map' && (
        <Card className="border-none shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-4">Assets by Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Marketing Office', 'Operations Office'].map((office) => {
              const officeAssets = assets.filter((a) => a.location?.office === office);
              return (
                <div key={office} className="border border-gray-100 rounded-2xl p-5">
                  <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin size={16} className="text-primary-500" />{office}
                  </h4>
                  <p className="text-3xl font-black text-primary-600">{officeAssets.length}</p>
                  <p className="text-xs text-gray-400 font-bold mt-1">assets registered</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {['Ground Floor', 'First Floor', 'Second Floor'].map((floor) => {
                      const cnt = officeAssets.filter((a) => a.location?.floor === floor).length;
                      return cnt > 0 ? (
                        <span key={floor} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-lg font-bold">
                          {floor}: {cnt}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OperationsDashboard;
