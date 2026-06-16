import { useCallback } from 'react';
import { Inspection, InspectionItem } from '@/types/inspection';
import { allInspectionItems } from '@/data/inspectionItems';
import { calculateWeightedAverageScore, calculateTotalScore } from '@/utils/inspectionCalculations';
import { downloadPDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { auditService } from '@/services/auditService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UseInspectionActionsProps {
  currentInspection: Inspection | null;
  setCurrentInspection: (inspection: Inspection | null) => void;
  saveInspectionToStorage: (inspection: Inspection) => Promise<boolean>;
  findExistingInspection: (neighborhood: string) => Promise<Inspection | null>;
  getInspectionById: (inspectionId: string) => Inspection | undefined;
  getInspectionByIdFromDB: (inspectionId: string) => Promise<Inspection | null>;
  deleteInspectionFromStorage: (inspectionId: string) => Promise<boolean>;
}

export const useInspectionActions = ({
  currentInspection,
  setCurrentInspection,
  saveInspectionToStorage,
  findExistingInspection,
  getInspectionById,
  getInspectionByIdFromDB,
  deleteInspectionFromStorage
}: UseInspectionActionsProps) => {
  const { user, profile } = useAuth();
  
  const startNewInspection = useCallback(async (neighborhood: string, forceNew: boolean = false) => {
    const existingInspection = await findExistingInspection(neighborhood);

    if (existingInspection && !forceNew) {
      return { hasExisting: true, existingInspection };
    }

    const newInspection: Inspection = {
      id: crypto.randomUUID(),
      neighborhood,
      date: new Date().toISOString(),
      status: 'in-progress',
      items: allInspectionItems.map(item => ({
        ...item,
        score: null
      })),
      totalScore: 0,
      maxScore: allInspectionItems.length * 4,
      averageScore: 0,
      inspectorName: profile?.name || user?.email || 'Unknown',
      inspectorEmail: user?.email || 'unknown@email.com'
    };

    setCurrentInspection(newInspection);
    return { hasExisting: false, newInspection };
  }, [findExistingInspection, setCurrentInspection, user, profile]);

  const continueExistingInspection = useCallback(async (neighborhood: string) => {
    const existingInspection = await findExistingInspection(neighborhood);
    if (existingInspection) {
      setCurrentInspection(existingInspection);
      return true;
    }
    return false;
  }, [findExistingInspection, setCurrentInspection]);

  const updateItemScore = useCallback((itemId: string, score: number | string) => {
    if (!currentInspection) return;
    
    const updatedItems = currentInspection.items.map(item =>
      item.id === itemId ? { ...item, score } : item
    );
    
    const totalScore = calculateTotalScore(updatedItems);
    const averageScore = calculateWeightedAverageScore(updatedItems);
    
    setCurrentInspection({
      ...currentInspection,
      items: updatedItems,
      totalScore,
      averageScore
    });
  }, [currentInspection, setCurrentInspection]);

  const saveInspection = useCallback(async () => {
    if (!currentInspection) return false;
    return await saveInspectionToStorage(currentInspection);
  }, [currentInspection, saveInspectionToStorage]);

  const submitInspection = useCallback(async () => {
    if (!currentInspection) return;
    
    const completedInspection = {
      ...currentInspection,
      status: 'completed' as const
    };
    
    const success = await saveInspectionToStorage(completedInspection);
    
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to save inspection",
        variant: "destructive"
      });
      return;
    }
    
    // Generate and download PDF
    try {
      await downloadPDF(completedInspection);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Error",
        description: "Failed to generate PDF, but inspection was saved",
        variant: "destructive"
      });
    }

    // Send email report
    try {
      const { data, error } = await supabase.functions.invoke('send-inspection-report', {
        body: { inspection: completedInspection }
      });

      if (error) {
        console.error('Error sending email:', error);
        toast({
          title: "Email Error",
          description: "Inspection saved but failed to send email report",
          variant: "destructive"
        });
      } else if (data?.success) {
        toast({
          title: "Email Sent",
          description: `Report emailed to ${data.recipients} recipient(s)`,
        });
      } else {
        toast({
          title: "No Email Recipients",
          description: "Inspection saved but no email recipients are configured",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error calling email function:', error);
      toast({
        title: "Email Error",
        description: "Inspection saved but failed to send email report",
        variant: "destructive"
      });
    }
    
    setCurrentInspection(null);
  }, [currentInspection, saveInspectionToStorage, setCurrentInspection]);

  // Start an inspection that belongs to an audit neighborhood slot.
  // Saves immediately so the DB row exists for the audit link.
  const startAuditNeighborhoodInspection = useCallback(async (
    neighborhoodName: string,
    auditId: string,
    auditNeighborhoodId: string
  ): Promise<Inspection | null> => {
    const newInspection: Inspection = {
      id: crypto.randomUUID(),
      neighborhood: neighborhoodName,
      date: new Date().toISOString(),
      status: 'in-progress',
      items: allInspectionItems.map(item => ({ ...item, score: null })),
      totalScore: 0,
      maxScore: allInspectionItems.length * 4,
      averageScore: 0,
      inspectorName: profile?.name || user?.email || 'Unknown',
      inspectorEmail: user?.email || 'unknown@email.com',
      auditId,
    };

    setCurrentInspection(newInspection);
    const saved = await saveInspectionToStorage(newInspection);
    if (saved) {
      await auditService.linkInspectionToNeighborhood(auditNeighborhoodId, newInspection.id);
    }
    return newInspection;
  }, [saveInspectionToStorage, setCurrentInspection, user, profile]);

  // Load an audit neighborhood inspection from DB by its inspection ID.
  const continueAuditNeighborhood = useCallback(async (inspectionId: string): Promise<boolean> => {
    const inspection = await getInspectionByIdFromDB(inspectionId);
    if (inspection) {
      setCurrentInspection(inspection);
      return true;
    }
    return false;
  }, [getInspectionByIdFromDB, setCurrentInspection]);

  const loadInspection = useCallback((inspectionId: string) => {
    const inspection = getInspectionById(inspectionId);
    if (inspection) {
      setCurrentInspection(inspection);
    }
  }, [getInspectionById, setCurrentInspection]);

  const deleteInspection = useCallback(async () => {
    if (!currentInspection) return;

    // Admins can delete any inspection; others can only delete in-progress ones
    if (profile?.role !== 'admin' && currentInspection.status !== 'in-progress') {
      toast({
        title: "Cannot Delete",
        description: "Completed inspections cannot be deleted to maintain data integrity.",
        variant: "destructive"
      });
      return;
    }

    const success = await deleteInspectionFromStorage(currentInspection.id);
    if (success) {
      setCurrentInspection(null);
      toast({
        title: "Inspection Deleted",
        description: "The inspection has been deleted.",
      });
    }
  }, [currentInspection, deleteInspectionFromStorage, setCurrentInspection, profile?.role]);

  return {
    startNewInspection,
    continueExistingInspection,
    startAuditNeighborhoodInspection,
    continueAuditNeighborhood,
    updateItemScore,
    saveInspection,
    submitInspection,
    loadInspection,
    deleteInspection
  };
};
