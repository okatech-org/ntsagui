import html2pdf from 'html2pdf.js';
import { Lead } from './leadStorage';

class PDFGeneratorService {
  generateReportPDF(lead: Lead): void {
    const element = this.createReportHTML(lead);
    
    const options = {
      margin: 10,
      filename: `rapport_${lead.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
    };
    
    html2pdf().set(options).from(element).save();
  }

  private createReportHTML(lead: Lead): HTMLElement {
    const container = document.createElement('div');
    container.style.width = '210mm';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.color = '#333';
    
    const html = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
        <h1 style="color: #3b82f6; margin: 0; font-size: 32px;">OKA Tech</h1>
        <p style="margin: 5px 0; color: #666;">AI Solutions That Drive Results</p>
        <h2 style="margin: 15px 0 0 0; font-size: 20px;">Rapport d'Analyse Personnalisé</h2>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Informations du Prospect</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Nom</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Entreprise</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.company}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Téléphone</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.phone || 'Non fourni'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Date</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(lead.createdAt).toLocaleDateString('fr-FR')}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Résumé Exécutif</h3>
        <div style="background-color: #f0f4ff; padding: 15px; border-radius: 5px; line-height: 1.6;">
          ${lead.report.split('\n').map(line => `<p style="margin: 8px 0;">${line}</p>`).join('')}
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Score de Compatibilité</h3>
        <div style="background: linear-gradient(to right, #fee, #efe); padding: 20px; border-radius: 5px; text-align: center;">
          <div style="font-size: 48px; font-weight: bold; color: ${this.getScoreColor(lead.fitScore)};">
            ${lead.fitScore}/100
          </div>
          <p style="margin: 10px 0 0 0; color: #666;">Niveau de compatibilité avec OKA Tech</p>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Historique de la Conversation</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; max-height: 300px; overflow-y: auto;">
          ${lead.conversation.map(msg => `
            <div style="margin-bottom: 12px; padding: 10px; background: ${msg.role === 'user' ? '#e3f2fd' : '#f5f5f5'}; border-radius: 3px;">
              <strong style="color: ${msg.role === 'user' ? '#1976d2' : '#666'};">${msg.role === 'user' ? 'Vous' : 'Assistant IA'}:</strong>
              <p style="margin: 5px 0 0 0; font-size: 13px;">${msg.content}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>© 2024 OKA Tech - 50 Avenue des Champs Élysées, 75008 Paris</p>
        <p>SIREN: 988 507 356 | Email: info@oka-tech.fr</p>
      </div>
    `;
    
    container.innerHTML = html;
    return container;
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }

  downloadAsJSON(lead: Lead): void {
    const dataStr = JSON.stringify(lead, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_${lead.name.replace(/\s+/g, '_')}_${new Date().getTime()}.json`;
    link.click();
  }

  downloadAsCSV(leads: Lead[]): void {
    const headers = ['ID', 'Nom', 'Email', 'Entreprise', 'Score', 'Statut', 'Date'];
    const rows = leads.map(lead => [
      lead.id,
      lead.name,
      lead.email,
      lead.company,
      lead.fitScore,
      lead.status,
      new Date(lead.createdAt).toLocaleDateString('fr-FR'),
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapports_leads_${new Date().getTime()}.csv`;
    link.click();
  }
}

export const pdfGenerator = new PDFGeneratorService();
export default pdfGenerator;
