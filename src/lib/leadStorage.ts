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

class LeadStorageService {
  private storageKey = 'oka_tech_leads';

  getAllLeads(): Lead[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la lecture des leads:', error);
      return [];
    }
  }

  getLead(id: string): Lead | null {
    const leads = this.getAllLeads();
    return leads.find(lead => lead.id === id) || null;
  }

  saveLead(lead: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const leads = this.getAllLeads();
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    leads.push(newLead);
    localStorage.setItem(this.storageKey, JSON.stringify(leads));
    console.log('Lead sauvegardé:', newLead);
    return newLead;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const leads = this.getAllLeads();
    const index = leads.findIndex(lead => lead.id === id);
    
    if (index === -1) return null;
    
    leads[index] = { ...leads[index], ...updates };
    localStorage.setItem(this.storageKey, JSON.stringify(leads));
    return leads[index];
  }

  deleteLead(id: string): boolean {
    const leads = this.getAllLeads();
    const filtered = leads.filter(lead => lead.id !== id);
    if (filtered.length === leads.length) return false;
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }

  getLeadsByStatus(status: string): Lead[] {
    return this.getAllLeads().filter(lead => lead.status === status);
  }

  getLeadsCount(): number {
    return this.getAllLeads().length;
  }

  exportLeads(format: 'json' | 'csv' = 'json'): string {
    const leads = this.getAllLeads();
    
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

  clearAllLeads(): void {
    localStorage.removeItem(this.storageKey);
    console.log('Tous les leads ont été supprimés');
  }
}

export const leadStorage = new LeadStorageService();
export default leadStorage;
