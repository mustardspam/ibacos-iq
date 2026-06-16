
import { useEffect, useRef, useState } from 'react';
import { useInspection } from '@/contexts/InspectionContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import NeighborhoodSelection from '@/components/NeighborhoodSelection';
import InspectionHeader from '@/components/InspectionHeader';
import InspectionTabs from '@/components/InspectionTabs';
import { Button } from '@/components/ui/button';
import { Save, Send, ChevronLeft, ChevronRight } from 'lucide-react';

const Inspection = () => {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [auditLoading, setAuditLoading] = useState(false);
  const {
    currentInspection,
    startNewInspection,
    startAuditNeighborhoodInspection,
    continueAuditNeighborhood,
    saveInspection,
    submitInspection,
    deleteInspection,
    canDeleteCurrentInspection
  } = useInspection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Audit context from URL params
  const auditId = searchParams.get('auditId');
  const auditNeighborhoodId = searchParams.get('auditNeighborhoodId');
  const neighborhoodName = searchParams.get('neighborhoodName');
  const existingInspectionId = searchParams.get('existingInspectionId');

  const isAuditMode = !!auditId;

  // Auto-start/load the inspection when entering audit mode
  useEffect(() => {
    if (!isAuditMode || currentInspection) return;

    const init = async () => {
      setAuditLoading(true);
      try {
        if (existingInspectionId) {
          await continueAuditNeighborhood(existingInspectionId);
        } else if (neighborhoodName && auditNeighborhoodId) {
          await startAuditNeighborhoodInspection(neighborhoodName, auditId, auditNeighborhoodId);
        }
      } finally {
        setAuditLoading(false);
      }
    };

    init();
  }, [isAuditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCategories = () => {
    if (!currentInspection) return [];
    return [...new Set(currentInspection.items.map(item => item.category))].sort();
  };

  const categories = getCategories();
  const currentCategoryIndex = categories.indexOf(currentCategory);
  const previousCategory = currentCategoryIndex > 0 ? categories[currentCategoryIndex - 1] : null;
  const nextCategory = currentCategoryIndex < categories.length - 1 ? categories[currentCategoryIndex + 1] : null;

  useEffect(() => {
    if (currentInspection && categories.length > 0 && !currentCategory) {
      setCurrentCategory(categories[0]);
    }
  }, [currentInspection, categories.length, currentCategory]);

  const saveInspectionRef = useRef(saveInspection);
  useEffect(() => { saveInspectionRef.current = saveInspection; }, [saveInspection]);

  useEffect(() => {
    if (!currentInspection?.id || !autoSaveEnabled) return;
    const autoSaveInterval = setInterval(() => {
      saveInspectionRef.current();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [currentInspection?.id, autoSaveEnabled]);

  const handleManualSave = async () => {
    await saveInspection();
    toast({ title: "Saved", description: "Inspection progress has been saved" });
  };

  const handleSubmit = async () => {
    if (!currentInspection) return;

    const incompleteItems = currentInspection.items.filter(item => item.score === null);
    if (incompleteItems.length > 0) {
      toast({
        title: "Incomplete Inspection",
        description: `Please score all items before submitting. ${incompleteItems.length} items remaining.`,
        variant: "destructive",
      });
      return;
    }

    await submitInspection();
    toast({
      title: "Inspection Submitted",
      description: "Report has been generated and emailed to stakeholders",
    });

    if (isAuditMode && auditId) {
      navigate(`/audits/${auditId}`);
    } else {
      navigate('/reports');
    }
  };

  const handleDelete = async () => {
    await deleteInspection();
    if (isAuditMode && auditId) {
      navigate(`/audits/${auditId}`);
    } else {
      navigate('/');
    }
  };

  const handleBack = () => {
    if (isAuditMode && auditId) {
      navigate(`/audits/${auditId}`);
    } else {
      navigate('/');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const handlePreviousSection = () => {
    if (previousCategory) {
      setCurrentCategory(previousCategory);
      setTimeout(scrollToTop, 100);
    }
  };

  const handleNextSection = () => {
    if (nextCategory) {
      setCurrentCategory(nextCategory);
      setTimeout(scrollToTop, 100);
    }
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setTimeout(scrollToTop, 100);
  };

  const getProgress = () => {
    if (!currentInspection) return 0;
    const completedItems = currentInspection.items.filter(item => item.score !== null).length;
    return Math.round((completedItems / currentInspection.items.length) * 100);
  };

  const isComplete = () => {
    if (!currentInspection) return false;
    return currentInspection.items.every(item => item.score !== null);
  };

  // Loading state while audit inspection is being set up
  if (auditLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Loading inspection…</p>
        </div>
      </div>
    );
  }

  // Non-audit mode: show neighborhood selector if no inspection active
  if (!currentInspection && !isAuditMode) {
    return (
      <>
        <Navigation />
        <NeighborhoodSelection onStartInspection={startNewInspection} />
      </>
    );
  }

  if (!currentInspection) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-6xl">
        <InspectionHeader
          neighborhood={currentInspection.neighborhood}
          date={currentInspection.date}
          status={currentInspection.status}
          progress={getProgress()}
          onSave={handleManualSave}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onBack={handleBack}
          isComplete={isComplete()}
          canDelete={canDeleteCurrentInspection()}
          isAuditMode={isAuditMode}
        />

        <InspectionTabs
          inspection={currentInspection}
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Bottom action bar */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex-1 min-w-0">
              {previousCategory && (
                <Button onClick={handlePreviousSection} variant="outline" size="lg" className="w-full sm:w-auto">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={handleManualSave} variant="outline" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={handleSubmit}
                className={`${isComplete() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={!isComplete() || currentInspection.status === 'completed'}
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>

            <div className="flex-1 min-w-0 flex justify-end">
              {nextCategory && (
                <Button onClick={handleNextSection} variant="outline" size="lg" className="w-full sm:w-auto">
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {!isComplete() && (
            <p className="text-center text-sm text-gray-500 mt-3">
              {currentInspection.items.filter(item => item.score === null).length} items remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inspection;
