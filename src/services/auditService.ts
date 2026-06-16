import { supabase } from '@/integrations/supabase/client';

export interface AuditNeighborhood {
  id: string;
  auditId: string;
  neighborhoodName: string;
  inspectionId: string | null;
  displayOrder: number;
  createdAt: string;
}

export interface Audit {
  id: string;
  name: string;
  status: 'in-progress' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  neighborhoods: AuditNeighborhood[];
}

const mapAudit = (a: any): Audit => ({
  id: a.id,
  name: a.name,
  status: a.status as 'in-progress' | 'completed',
  createdBy: a.created_by,
  createdAt: a.created_at,
  updatedAt: a.updated_at,
  neighborhoods: ((a.audit_neighborhoods as any[]) || [])
    .sort((x, y) => x.display_order - y.display_order)
    .map(n => ({
      id: n.id,
      auditId: n.audit_id,
      neighborhoodName: n.neighborhood_name,
      inspectionId: n.inspection_id,
      displayOrder: n.display_order,
      createdAt: n.created_at,
    })),
});

export const auditService = {
  async getAllAudits(): Promise<Audit[]> {
    const { data, error } = await (supabase as any)
      .from('audits')
      .select('*, audit_neighborhoods(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audits:', error);
      return [];
    }
    return (data || []).map(mapAudit);
  },

  async getAudit(id: string): Promise<Audit | null> {
    const { data, error } = await (supabase as any)
      .from('audits')
      .select('*, audit_neighborhoods(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapAudit(data);
  },

  async createAudit(name: string, neighborhoodNames: string[]): Promise<Audit | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data: audit, error: auditError } = await (supabase as any)
      .from('audits')
      .insert({ name, created_by: userData.user.id })
      .select()
      .single();

    if (auditError || !audit) {
      console.error('Error creating audit:', auditError);
      return null;
    }

    if (neighborhoodNames.length > 0) {
      const rows = neighborhoodNames.map((nhName, index) => ({
        audit_id: audit.id,
        neighborhood_name: nhName,
        display_order: index,
      }));

      const { error: nhError } = await (supabase as any)
        .from('audit_neighborhoods')
        .insert(rows);

      if (nhError) console.error('Error creating audit neighborhoods:', nhError);
    }

    return auditService.getAudit(audit.id);
  },

  async linkInspectionToNeighborhood(auditNeighborhoodId: string, inspectionId: string): Promise<boolean> {
    const { error } = await (supabase as any)
      .from('audit_neighborhoods')
      .update({ inspection_id: inspectionId })
      .eq('id', auditNeighborhoodId);

    if (error) {
      console.error('Error linking inspection to audit neighborhood:', error);
      return false;
    }
    return true;
  },

  async completeAudit(auditId: string): Promise<boolean> {
    const { error } = await (supabase as any)
      .from('audits')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', auditId);

    return !error;
  },

  async deleteAudit(auditId: string): Promise<boolean> {
    const { error } = await (supabase as any)
      .from('audits')
      .delete()
      .eq('id', auditId);

    if (error) {
      console.error('Error deleting audit:', error);
      return false;
    }
    return true;
  },
};
