
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClipboardList, Plus, ArrowRight, X, CheckCircle2, Clock } from 'lucide-react';
import { auditService, Audit } from '@/services/auditService';
import { useInspection } from '@/contexts/InspectionContext';
import { calculateAuditScore } from '@/utils/auditCalculations';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Audits = () => {
  const navigate = useNavigate();
  const { getAllInspections } = useInspection();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [auditName, setAuditName] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<{ id: string; name: string }[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [neighborhoodPick, setNeighborhoodPick] = useState('');

  useEffect(() => {
    loadAudits();
    loadNeighborhoods();
  }, []);

  const loadAudits = async () => {
    setLoading(true);
    const data = await auditService.getAllAudits();
    setAudits(data);
    setLoading(false);
  };

  const loadNeighborhoods = async () => {
    const { data } = await supabase.from('neighborhoods').select('*').order('name');
    setNeighborhoods(data || []);
  };

  const addNeighborhood = () => {
    if (!neighborhoodPick) return;
    setSelectedNeighborhoods(prev => [...prev, neighborhoodPick]);
    setNeighborhoodPick('');
  };

  const removeNeighborhood = (index: number) => {
    setSelectedNeighborhoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!auditName.trim()) {
      toast({ title: 'Name required', description: 'Please enter an audit name.', variant: 'destructive' });
      return;
    }
    if (selectedNeighborhoods.length < 2) {
      toast({ title: 'Select at least 2 neighborhoods', description: 'An audit requires 2 or more neighborhoods.', variant: 'destructive' });
      return;
    }

    setCreating(true);
    const audit = await auditService.createAudit(auditName.trim(), selectedNeighborhoods);
    setCreating(false);

    if (audit) {
      setShowCreate(false);
      setAuditName('');
      setSelectedNeighborhoods([]);
      navigate(`/audits/${audit.id}`);
    } else {
      toast({ title: 'Error', description: 'Failed to create audit.', variant: 'destructive' });
    }
  };

  // Compute running score for each audit from loaded inspections
  const allInspections = getAllInspections();
  const getAuditScore = (audit: Audit) => {
    const completedIds = audit.neighborhoods
      .map(n => n.inspectionId)
      .filter(Boolean) as string[];
    const matchingInspections = allInspections.filter(i => completedIds.includes(i.id));
    if (matchingInspections.length === 0) return null;
    return calculateAuditScore(matchingInspections.map(i => i.items));
  };

  const getScoreColor = (score: number) => {
    if (score >= 3.1) return 'text-green-600';
    if (score >= 2.6) return 'text-primary';
    if (score >= 2.2) return 'text-yellow-600';
    if (score >= 1.8) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Audits</h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">Multi-neighborhood official audit simulations</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="">
            <Plus className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">New Audit</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading audits…</div>
        ) : audits.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <ClipboardList className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audits yet</h3>
              <p className="text-gray-500 mb-6 text-sm">Create a multi-neighborhood audit to simulate an official inspection.</p>
              <Button onClick={() => setShowCreate(true)} className="">
                <Plus className="h-4 w-4 mr-2" />
                Create First Audit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audits.map(audit => {
              const score = getAuditScore(audit);
              const completedCount = audit.neighborhoods.filter(n => {
                const insp = allInspections.find(i => i.id === n.inspectionId);
                return insp?.status === 'completed';
              }).length;
              const total = audit.neighborhoods.length;

              return (
                <Card
                  key={audit.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/audits/${audit.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base md:text-lg leading-tight">{audit.name}</CardTitle>
                      <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'} className="flex-shrink-0">
                        {audit.status === 'completed' ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />Done</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" />Active</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(audit.createdAt).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {completedCount} / {total} neighborhoods complete
                        </p>
                        <div className="flex gap-1 mt-2">
                          {audit.neighborhoods.map((n, i) => {
                            const insp = allInspections.find(ins => ins.id === n.inspectionId);
                            const done = insp?.status === 'completed';
                            const active = insp?.status === 'in-progress';
                            return (
                              <div
                                key={i}
                                className={`h-2 flex-1 rounded-full ${done ? 'bg-green-500' : active ? 'bg-orange-400' : 'bg-gray-200'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        {score !== null ? (
                          <>
                            <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">/ 3.52</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">No score yet</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <span className="text-primary text-sm flex items-center gap-1">
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Audit Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>New Audit</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="audit-name">Audit Name</Label>
              <Input
                id="audit-name"
                value={auditName}
                onChange={e => setAuditName(e.target.value)}
                placeholder="e.g. Q2 2026 Official Audit"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Neighborhoods</Label>
              <p className="text-xs text-gray-500 mb-2">Add 2–8 neighborhoods. The same neighborhood can appear more than once.</p>
              <div className="flex gap-2 mt-1">
                <Select value={neighborhoodPick} onValueChange={setNeighborhoodPick}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select neighborhood" />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map(n => (
                      <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={addNeighborhood}
                  disabled={!neighborhoodPick || selectedNeighborhoods.length >= 8}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {selectedNeighborhoods.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedNeighborhoods.map((name, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                      <span className="text-sm font-medium">{i + 1}. {name}</span>
                      <button onClick={() => removeNeighborhood(i)} className="text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !auditName.trim() || selectedNeighborhoods.length < 2}
                         >
              {creating ? 'Creating…' : 'Create Audit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Audits;
