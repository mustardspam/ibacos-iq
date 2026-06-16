
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, Play, RotateCcw, Eye, CheckCircle2, Clock, Circle,
  TrendingUp, ClipboardList, CheckCheck
} from 'lucide-react';
import { auditService, Audit, AuditNeighborhood } from '@/services/auditService';
import { useInspection } from '@/contexts/InspectionContext';
import { useAuth } from '@/contexts/AuthContext';
import { calculateAuditScore } from '@/utils/auditCalculations';
import { toast } from '@/hooks/use-toast';
import { Inspection } from '@/types/inspection';

const AuditDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { getAllInspections, setCurrentInspection } = useInspection();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const allInspections = getAllInspections();

  const loadAudit = useCallback(async () => {
    if (!id) return;
    const data = await auditService.getAudit(id);
    setAudit(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Loading audit…</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Audit not found.</p>
        </div>
      </div>
    );
  }

  const isCreator = audit.createdBy === user?.id;
  const isAdmin = profile?.role === 'admin';
  const canScore = isCreator || isAdmin;

  // Map each neighborhood slot to its inspection
  const neighborhoodInspections = audit.neighborhoods.map(n => ({
    neighborhood: n,
    inspection: allInspections.find(i => i.id === n.inspectionId) ?? null,
  }));

  // Items from all inspections that have any scores
  const scoredInspectionItems = neighborhoodInspections
    .filter(({ inspection }) => inspection !== null)
    .map(({ inspection }) => inspection!.items);

  const auditScore = scoredInspectionItems.length > 0
    ? calculateAuditScore(scoredInspectionItems)
    : null;

  const completedCount = neighborhoodInspections.filter(
    ({ inspection }) => inspection?.status === 'completed'
  ).length;

  const allComplete = completedCount === audit.neighborhoods.length;
  const progress = audit.neighborhoods.length > 0
    ? Math.round((completedCount / audit.neighborhoods.length) * 100)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 3.1) return 'text-green-600';
    if (score >= 2.6) return 'text-blue-600';
    if (score >= 2.2) return 'text-yellow-600';
    if (score >= 1.8) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleStartNeighborhood = (n: AuditNeighborhood) => {
    setCurrentInspection(null);
    navigate(
      `/inspection?auditId=${audit.id}&auditNeighborhoodId=${n.id}&neighborhoodName=${encodeURIComponent(n.neighborhoodName)}`
    );
  };

  const handleContinueNeighborhood = (n: AuditNeighborhood) => {
    setCurrentInspection(null);
    navigate(
      `/inspection?auditId=${audit.id}&auditNeighborhoodId=${n.id}&existingInspectionId=${n.inspectionId}`
    );
  };

  const handleViewNeighborhood = (inspection: Inspection) => {
    setCurrentInspection(inspection);
    navigate(`/inspection?auditId=${audit.id}`);
  };

  const handleMarkComplete = async () => {
    if (!id) return;
    setCompleting(true);
    const ok = await auditService.completeAudit(id);
    setCompleting(false);
    if (ok) {
      toast({ title: 'Audit completed', description: 'The audit has been marked as complete.' });
      loadAudit();
    } else {
      toast({ title: 'Error', description: 'Failed to mark audit complete.', variant: 'destructive' });
    }
    setShowComplete(false);
  };

  const getNeighborhoodStatus = (inspection: Inspection | null) => {
    if (!inspection) return 'not-started';
    if (inspection.status === 'completed') return 'completed';
    return 'in-progress';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate('/audits')} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          All Audits
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{audit.name}</h1>
            </div>
            <p className="text-sm text-gray-500">Created {new Date(audit.createdAt).toLocaleDateString()}</p>
          </div>
          <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
            {audit.status === 'completed' ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" />Complete</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" />Active</>
            )}
          </Badge>
        </div>

        {/* Score + progress card */}
        <Card className="mb-6 border-blue-100 bg-blue-50/50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Composite Audit Score</p>
                {auditScore !== null ? (
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-bold ${getScoreColor(auditScore)}`}>
                      {auditScore.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-400 mb-1">/ 3.52</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-300">—</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Running score updates as neighborhoods complete</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                  <span>Neighborhoods</span>
                  <span>{completedCount} / {audit.neighborhoods.length}</span>
                </div>
                <Progress value={progress} className="h-2.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Neighborhoods list */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-700">Neighborhoods</h2>
          {neighborhoodInspections.map(({ neighborhood: n, inspection }, idx) => {
            const nhStatus = getNeighborhoodStatus(inspection);
            return (
              <Card key={n.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: number + name + status */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{n.neighborhoodName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {nhStatus === 'completed' && (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">Complete</span>
                              {inspection && (
                                <span className={`text-xs font-bold ml-2 ${getScoreColor(inspection.averageScore)}`}>
                                  {inspection.averageScore.toFixed(2)}/3.52
                                </span>
                              )}
                            </>
                          )}
                          {nhStatus === 'in-progress' && (
                            <>
                              <Clock className="h-3.5 w-3.5 text-orange-500" />
                              <span className="text-xs text-orange-600 font-medium">In Progress</span>
                              {inspection && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {inspection.items.filter(i => i.score !== null).length}/{inspection.items.length} items
                                </span>
                              )}
                            </>
                          )}
                          {nhStatus === 'not-started' && (
                            <>
                              <Circle className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-500">Not started</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: action button */}
                    <div className="flex-shrink-0">
                      {nhStatus === 'not-started' && canScore && audit.status === 'in-progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartNeighborhood(n)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-3.5 w-3.5 mr-1" />
                          Start
                        </Button>
                      )}
                      {nhStatus === 'in-progress' && canScore && audit.status === 'in-progress' && (
                        <Button size="sm" variant="outline" onClick={() => handleContinueNeighborhood(n)}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Continue
                        </Button>
                      )}
                      {nhStatus === 'completed' && inspection && (
                        <Button size="sm" variant="outline" onClick={() => handleViewNeighborhood(inspection)}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Complete audit button */}
        {canScore && allComplete && audit.status === 'in-progress' && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setShowComplete(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark Audit Complete
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showComplete} onOpenChange={setShowComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark audit as complete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will lock the audit. All {audit.neighborhoods.length} neighborhoods are finished.
              Final composite score: {auditScore?.toFixed(2) ?? '—'} / 3.52
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkComplete}
              disabled={completing}
              className="bg-green-600 hover:bg-green-700"
            >
              {completing ? 'Saving…' : 'Complete Audit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AuditDetail;
