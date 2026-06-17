
import { Card, CardContent } from '@/components/ui/card';
import { FileText, TrendingUp, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  totalInspections: number;
  avgScore: number;
  recentInspectionsCount: number;
}

const DashboardStats = ({ totalInspections, avgScore, recentInspectionsCount }: DashboardStatsProps) => {
  const stats = [
    { label: 'Total Inspections', value: totalInspections, sub: null, icon: FileText },
    { label: 'Average Score', value: avgScore || 0, sub: 'out of 3.52', icon: TrendingUp },
    { label: 'This Month', value: recentInspectionsCount, sub: null, icon: Calendar },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {stats.map(({ label, value, sub, icon: Icon }) => (
        <Card key={label} className="rounded-sm border shadow-none" style={{ borderColor: 'hsl(220, 14%, 88%)' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'hsl(220, 12%, 46%)' }}>
                  {label}
                </p>
                <p className="text-4xl font-light" style={{ color: 'hsl(220, 30%, 12%)' }}>{value}</p>
                {sub && <p className="text-xs mt-1" style={{ color: 'hsl(220, 12%, 60%)' }}>{sub}</p>}
              </div>
              <div className="p-2 rounded-sm" style={{ backgroundColor: 'hsl(215, 44%, 94%)' }}>
                <Icon className="h-5 w-5" style={{ color: 'hsl(215, 44%, 28%)' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
