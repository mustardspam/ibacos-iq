
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, User } from 'lucide-react';
import { Inspection } from '@/types/inspection';

interface RecentInspectionsProps {
  inspections: Inspection[];
}

const RecentInspections = ({ inspections }: RecentInspectionsProps) => {
  return (
    <Card className="rounded-sm border shadow-none" style={{ borderColor: 'hsl(220, 14%, 88%)' }}>
      <CardHeader className="pb-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'hsl(220, 12%, 46%)' }}>Recent Inspections</p>
        <CardDescription className="text-xs">Latest completed audits from all team members</CardDescription>
      </CardHeader>
      <CardContent>
        {inspections.length > 0 ? (
          <div className="divide-y" style={{ borderColor: 'hsl(220, 14%, 92%)' }}>
            {inspections.map((inspection) => (
              <div key={inspection.id} className="flex items-center justify-between py-4 first:pt-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(215, 44%, 94%)' }}>
                    <MapPin className="h-4 w-4" style={{ color: 'hsl(215, 44%, 28%)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'hsl(220, 30%, 12%)' }}>{inspection.neighborhood}</p>
                    <div className="flex items-center space-x-2 text-xs mt-0.5" style={{ color: 'hsl(220, 12%, 52%)' }}>
                      <span>{new Date(inspection.date).toLocaleDateString()}</span>
                      {inspection.inspectorName && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {inspection.inspectorName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-light text-2xl" style={{ color: 'hsl(220, 30%, 12%)' }}>
                    {inspection.averageScore.toFixed(2)}
                  </p>
                  <p className="text-[10px] tracking-wider" style={{ color: 'hsl(220, 12%, 60%)' }}>
                    / 3.52
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-10 text-sm tracking-wide" style={{ color: 'hsl(220, 12%, 60%)' }}>No completed inspections yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentInspections;
