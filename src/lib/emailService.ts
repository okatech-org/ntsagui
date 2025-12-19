import { Lead } from "./leadStorage";

interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'log';
  apiKey?: string;
  senderEmail?: string;
}

class EmailService {
  private config: EmailConfig = {
    provider: 'log',
    senderEmail: 'noreply@oka-tech.fr',
  };

  setConfig(config: EmailConfig) {
    this.config = config;
  }

  async sendLeadReport(lead: Lead, pdfUrl?: string): Promise<boolean> {
    const emailContent = this.generateReportEmailHTML(lead);

    try {
      if (this.config.provider === 'sendgrid') {
        return await this.sendViaSendGrid(lead.email, 'Votre rapport d\'analyse NTSAGUI Digital', emailContent);
      } else if (this.config.provider === 'mailgun') {
        return await this.sendViaMailgun(lead.email, 'Votre rapport d\'analyse NTSAGUI Digital', emailContent);
      } else {
        return await this.logEmail(lead.email, emailContent);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendAdminNotification(lead: Lead, adminEmails: string[]): Promise<boolean> {
    const emailContent = this.generateAdminNotificationHTML(lead);

    try {
      for (const adminEmail of adminEmails) {
        if (this.config.provider === 'sendgrid') {
          await this.sendViaSendGrid(adminEmail, `Nouveau lead: ${lead.name}`, emailContent);
        } else if (this.config.provider === 'mailgun') {
          await this.sendViaMailgun(adminEmail, `Nouveau lead: ${lead.name}`, emailContent);
        } else {
          await this.logEmail(adminEmail, emailContent);
        }
      }
      return true;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return false;
    }
  }

  private async sendViaSendGrid(to: string, subject: string, htmlContent: string): Promise<boolean> {
    if (!this.config.apiKey) {
      console.error('SendGrid API key not configured');
      return false;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: this.config.senderEmail },
          subject,
          content: [{ type: 'text/html', value: htmlContent }],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }

  private async sendViaMailgun(to: string, subject: string, htmlContent: string): Promise<boolean> {
    if (!this.config.apiKey) {
      console.error('Mailgun API key not configured');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('from', this.config.senderEmail!);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', htmlContent);

      const response = await fetch('https://api.mailgun.net/v3/oka-tech.fr/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`,
        },
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error('Mailgun error:', error);
      return false;
    }
  }

  private async logEmail(to: string, content: string): Promise<boolean> {
    console.log(`Email to: ${to}`);
    console.log(`Content: ${content}`);
    return true;
  }

  private generateReportEmailHTML(lead: Lead): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NTSAGUI Digital - Rapport d'Analyse</h1>
            <p>Votre consultation personnalisée</p>
          </div>

          <div class="content">
            <p>Bonjour ${lead.name},</p>
            
            <p>Nous avons le plaisir de vous transmettre votre rapport d'analyse personnalisé suite à votre consultation avec notre assistant IA.</p>

            <h3>Résumé</h3>
            <p>${lead.report.substring(0, 300)}...</p>

            <h3>Score de Compatibilité</h3>
            <p><strong>${lead.fitScore}/100</strong> - Niveau de compatibilité avec NTSAGUI Digital</p>

            <p>Votre rapport complet est disponible en pièce jointe (PDF).</p>

            <p style="text-align: center;">
              <a href="https://oka-tech.fr/contact" class="button">Discuter de vos besoins</a>
            </p>
          </div>

          <div class="footer">
            <p>NTSAGUI Digital - Paris, France</p>
            <p>Email: contact@ntsagui.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAdminNotificationHTML(lead: Lead): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 15px; border-radius: 8px; }
          .info { background: #f0f4ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; }
          .button { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Nouveau Lead Qualifié</h2>
          </div>

          <div class="info">
            <h3>${lead.name}</h3>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Entreprise:</strong> ${lead.company}</p>
            <p><strong>Téléphone:</strong> ${lead.phone || 'Non fourni'}</p>
            <p><strong>Score:</strong> ${lead.fitScore}/100</p>
            <p><strong>Date:</strong> ${new Date(lead.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>

          <p>
            <a href="https://oka-tech.fr/admin" class="button">Voir le lead complet</a>
          </p>

          <p>Le rapport complet et l'historique de la conversation sont disponibles dans le dashboard admin.</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
export default emailService;
