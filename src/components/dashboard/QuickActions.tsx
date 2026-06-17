
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInspection } from '@/contexts/InspectionContext';

interface QuickActionsProps {
  onStartNewInspection: () => void;
  onViewReports: () => void;
}

const QuickActions = ({ onStartNewInspection, onViewReports }: QuickActionsProps) => {
  const { clearCurrentInspection } = useInspection();

  const handleStartNewInspection = () => {
    // Clear any existing current inspection to ensure we go to neighborhood selection
    clearCurrentInspection();
    onStartNewInspection();
  };

  return (
    <Card className="rounded-sm border shadow-none" style={{ borderColor: 'hsl(220, 14%, 88%)' }}>
      <CardHeader className="pb-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'hsl(220, 12%, 46%)' }}>Quick Actions</p>
        <CardDescription className="text-xs">Start a new inspection or view reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleStartNewInspection}
          className="w-full h-11 rounded-sm text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'hsl(215, 44%, 18%)', color: 'white' }}
        >
          Start New Inspection
        </Button>
        <Button
          onClick={onViewReports}
          variant="outline"
          className="w-full h-11 rounded-sm text-xs font-semibold tracking-widest uppercase"
          style={{ borderColor: 'hsl(215, 44%, 18%)', color: 'hsl(215, 44%, 18%)' }}
        >
          View All Reports
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
