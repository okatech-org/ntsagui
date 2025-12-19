import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  report: string;
  fitScore: number;
  createdAt: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
}

interface LeadInsert {
  name: string;
  email: string;
  company: string;
  phone?: string;
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  report: string;
  fitScore: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
}

/**
 * LeadStorageService - Supabase-backed lead storage
 * 
 * This service persists leads to Supabase instead of localStorage,
 * ensuring data is not lost when the browser is closed or device changes.
 * 
 * Data model:
 * - leads table: name, email, company, phone, status
 * - conversations table: messages (jsonb), report, compatibility_score
 */
class LeadStorageService {
  
  async getAllLeads(): Promise<Lead[]> {
    try {
      // Fetch leads with their conversations
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        return [];
      }

      if (!leads || leads.length === 0) {
        return [];
      }

      // Fetch all conversations for these leads
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .in('lead_id', leads.map(l => l.id));

      if (convError) {
        console.error('Error fetching conversations:', convError);
      }

      // Map to Lead interface
      return leads.map(lead => {
        const conv = conversations?.find(c => c.lead_id === lead.id);
        return {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          phone: lead.phone || undefined,
          createdAt: lead.created_at || new Date().toISOString(),
          // Use status from leads table if available, fallback to 'new'
          status: ((lead as unknown as { status?: string }).status || 'new') as Lead['status'],
          // Conversation data
          conversation: (conv?.messages as Array<{ role: 'user' | 'assistant'; content: string }>) || [],
          report: conv?.report || '',
          fitScore: conv?.compatibility_score || 0,
        };
      });
    } catch (error) {
      console.error('Error in getAllLeads:', error);
      return [];
    }
  }

  async getLead(id: string): Promise<Lead | null> {
    try {
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (leadError || !lead) {
        return null;
      }

      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('lead_id', id)
        .single();

      return {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        phone: lead.phone || undefined,
        createdAt: lead.created_at || new Date().toISOString(),
        status: ((lead as unknown as { status?: string }).status || 'new') as Lead['status'],
        conversation: (conv?.messages as Array<{ role: 'user' | 'assistant'; content: string }>) || [],
        report: conv?.report || '',
        fitScore: conv?.compatibility_score || 0,
      };
    } catch (error) {
      console.error('Error in getLead:', error);
      return null;
    }
  }

  async saveLead(leadData: LeadInsert): Promise<Lead> {
    // 1. Insert lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        phone: leadData.phone || null,
      })
      .select()
      .single();

    if (leadError || !lead) {
      console.error('Error inserting lead:', leadError);
      throw new Error('Failed to save lead');
    }

    // 2. Insert conversation with report and score
    const { error: convError } = await supabase
      .from('conversations')
      .insert({
        lead_id: lead.id,
        messages: leadData.conversation,
        report: leadData.report,
        compatibility_score: leadData.fitScore,
        phase: leadData.conversation.length > 6 ? 3 : leadData.conversation.length > 3 ? 2 : 1,
      });

    if (convError) {
      console.error('Error inserting conversation:', convError);
    }

    // 3. Update status if column exists (graceful degradation)
    await supabase
      .from('leads')
      .update({ status: leadData.status } as Record<string, unknown>)
      .eq('id', lead.id);

    const savedLead: Lead = {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      phone: lead.phone || undefined,
      createdAt: lead.created_at || new Date().toISOString(),
      status: leadData.status,
      conversation: leadData.conversation,
      report: leadData.report,
      fitScore: leadData.fitScore,
    };

    console.log('Lead saved to Supabase:', savedLead.id);
    return savedLead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    try {
      // Update lead info
      const leadUpdates: Record<string, unknown> = {};
      if (updates.name) leadUpdates.name = updates.name;
      if (updates.email) leadUpdates.email = updates.email;
      if (updates.company) leadUpdates.company = updates.company;
      if (updates.phone !== undefined) leadUpdates.phone = updates.phone;
      if (updates.status) leadUpdates.status = updates.status;

      if (Object.keys(leadUpdates).length > 0) {
        const { error } = await supabase
          .from('leads')
          .update(leadUpdates)
          .eq('id', id);

        if (error) {
          console.error('Error updating lead:', error);
          return null;
        }
      }

      // Update conversation data if provided
      if (updates.conversation || updates.report || updates.fitScore !== undefined) {
        const convUpdates: Record<string, unknown> = {};
        if (updates.conversation) convUpdates.messages = updates.conversation;
        if (updates.report) convUpdates.report = updates.report;
        if (updates.fitScore !== undefined) convUpdates.compatibility_score = updates.fitScore;

        await supabase
          .from('conversations')
          .update(convUpdates)
          .eq('lead_id', id);
      }

      return this.getLead(id);
    } catch (error) {
      console.error('Error in updateLead:', error);
      return null;
    }
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      // Conversations are deleted via CASCADE
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lead:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in deleteLead:', error);
      return false;
    }
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    const allLeads = await this.getAllLeads();
    return allLeads.filter(lead => lead.status === status);
  }

  async getLeadsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting leads:', error);
      return 0;
    }
    return count || 0;
  }

  async exportLeads(format: 'json' | 'csv' = 'json'): Promise<string> {
    const leads = await this.getAllLeads();

    if (format === 'json') {
      return JSON.stringify(leads, null, 2);
    }

    if (format === 'csv') {
      const headers = ['ID', 'Nom', 'Email', 'Entreprise', 'Téléphone', 'Score', 'Statut', 'Date'];
      const rows = leads.map(lead => [
        lead.id,
        lead.name,
        lead.email,
        lead.company,
        lead.phone || '',
        lead.fitScore,
        lead.status,
        lead.createdAt,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return csv;
    }

    return '';
  }

  async clearAllLeads(): Promise<void> {
    // This is a destructive operation - use with caution
    const { error } = await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error clearing leads:', error);
    }
    console.log('All leads have been deleted from Supabase');
  }

  // Migration helper: Import leads from localStorage to Supabase
  async migrateFromLocalStorage(): Promise<number> {
    const storageKey = 'ntsagui_leads';
    const localData = localStorage.getItem(storageKey);
    
    if (!localData) {
      console.log('No local leads to migrate');
      return 0;
    }

    try {
      const localLeads: Lead[] = JSON.parse(localData);
      let migrated = 0;

      for (const lead of localLeads) {
        // Check if lead already exists in Supabase (by email)
        const { data: existing } = await supabase
          .from('leads')
          .select('id')
          .eq('email', lead.email)
          .single();

        if (!existing) {
          await this.saveLead({
            name: lead.name,
            email: lead.email,
            company: lead.company,
            phone: lead.phone,
            conversation: lead.conversation,
            report: lead.report,
            fitScore: lead.fitScore,
            status: lead.status,
          });
          migrated++;
        }
      }

      console.log(`Migrated ${migrated} leads from localStorage to Supabase`);
      
      // Optionally clear localStorage after successful migration
      // localStorage.removeItem(storageKey);
      
      return migrated;
    } catch (error) {
      console.error('Error migrating leads:', error);
      return 0;
    }
  }
}

export const leadStorage = new LeadStorageService();
export default leadStorage;
