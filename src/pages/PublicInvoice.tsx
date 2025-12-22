import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, CreditCard, Download } from "lucide-react";
import logoNtsagui from "@/assets/logo-ntsagui.png";
import tamponNtsagui from "@/assets/tampon-ntsagui.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";

const COMPANY_INFO = {
  name: "NTSAGUI Digital",
  tagline: "Intelligence Artificielle & Machine Learning",
  address: "Batterie IV - BP 638",
  city: "Libreville",
  country: "Gabon",
  phone: "+241 77 51 14 85",
  email: "contact@ntsagui.com",
  website: "www.ntsagui.com",
  legalForm: "SARL au Capital de 5 000 000 FCFA",
  rccm: "GA-LBV-01-2025-B12-01029",
  nif: "2025 0102 2429 R",
  anpi: "ANPI24208339150I1"
};

const formatCurrency = (amount: number, currency = 'XAF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

interface DocumentItem {
  productId?: string;
  productName?: string;
  description: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  unit?: string;
}

export default function PublicInvoice() {
  const { token } = useParams<{ token: string }>();
  const [document, setDocument] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmNote, setConfirmNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      fetchDocument();
    }
  }, [token]);

  const fetchDocument = async () => {
    try {
      const { data: doc, error } = await supabase
        .from('billing_documents')
        .select('*')
        .eq('public_token', token)
        .maybeSingle();

      if (error) throw error;
      if (!doc) {
        toast.error('Document non trouvé');
        return;
      }

      setDocument(doc);

      if (doc.client_id) {
        const { data: clientData } = await supabase
          .from('billing_clients')
          .select('*')
          .eq('id', doc.client_id)
          .maybeSingle();
        setClient(clientData);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!document) return;
    
    setConfirming(true);
    try {
      const { error } = await supabase
        .from('billing_documents')
        .update({
          client_confirmed_payment: true,
          client_confirmation_date: new Date().toISOString(),
          client_confirmation_note: confirmNote || null
        })
        .eq('public_token', token);

      if (error) throw error;

      toast.success('Confirmation de paiement enregistrée !');
      fetchDocument();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Erreur lors de la confirmation');
    } finally {
      setConfirming(false);
    }
  };

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'facture': return 'FACTURE';
      case 'devis': return 'DEVIS';
      case 'bon_commande': return 'BON DE COMMANDE';
      default: return 'DOCUMENT';
    }
  };

  const getPublicInvoiceUrl = () => {
    return `${window.location.origin}/invoice/${token}`;
  };

  const exportToPDF = async () => {
    if (!invoiceRef.current) return;
    
    setExporting(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 0,
        windowWidth: invoiceRef.current.scrollWidth,
        windowHeight: invoiceRef.current.scrollHeight
      });
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: false
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio, undefined, 'NONE');
      pdf.save(`${getDocumentTitle(document.type)}_${document.number}.pdf`);
      
      toast.success('PDF téléchargé avec succès !');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Download className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Document non trouvé</h2>
            <p className="text-muted-foreground">Ce lien n'est plus valide ou le document a été supprimé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items: DocumentItem[] = Array.isArray(document?.items) ? document.items : [];
  const subtotal = Number(document.subtotal) || 0;
  const total = Number(document.total) || 0;
  const taxAmount = total - subtotal;
  const isTaxExempt = taxAmount === 0;

  const formattedIssueDate = formatDate(document.date);
  const formattedDueDate = document.payment_due_date 
    ? formatDate(document.payment_due_date)
    : 'Non spécifiée';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Download Button */}
        <div className="flex justify-center print:hidden">
          <Button onClick={exportToPDF} disabled={exporting} size="lg" className="gap-2">
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Génération...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Télécharger PDF
              </>
            )}
          </Button>
        </div>

        {/* Invoice Preview - Same format as admin */}
        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-lg overflow-auto">
          <div
            ref={invoiceRef}
            className="mx-auto shadow-xl"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '12mm 15mm 10mm 15mm',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: '9pt',
              lineHeight: '1.3',
              boxSizing: 'border-box',
              position: 'relative',
              backgroundColor: '#ffffff',
              color: '#111827'
            }}
          >
            {/* PAID Watermark */}
            {document.client_confirmed_payment && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-35deg)',
                fontSize: '120px',
                fontWeight: 'bold',
                color: 'rgba(34, 197, 94, 0.15)',
                textTransform: 'uppercase',
                letterSpacing: '20px',
                pointerEvents: 'none',
                zIndex: 1,
                whiteSpace: 'nowrap'
              }}>
                PAYÉ
              </div>
            )}
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', borderBottom: '2px solid #1e40af', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={logoNtsagui} alt="NTSAGUI Digital" style={{ height: '35px', width: 'auto' }} />
                <div>
                  <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>{COMPANY_INFO.name}</h2>
                  <p style={{ fontSize: '7pt', color: '#64748b', margin: 0 }}>{COMPANY_INFO.tagline}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '7pt', color: '#64748b', lineHeight: '1.4' }}>
                <p style={{ margin: 0 }}>{COMPANY_INFO.address}, {COMPANY_INFO.city} - {COMPANY_INFO.country}</p>
                <p style={{ margin: 0 }}>{COMPANY_INFO.phone} • {COMPANY_INFO.email}</p>
                <p style={{ margin: 0 }}>RCCM: {COMPANY_INFO.rccm} • NIF: {COMPANY_INFO.nif}</p>
              </div>
            </div>

            {/* Document Title */}
            <div style={{ textAlign: 'center', margin: '10px 0 15px 0' }}>
              <h1 style={{ fontSize: '18pt', fontWeight: 'bold', color: '#1e40af', margin: 0, letterSpacing: '1px' }}>{getDocumentTitle(document.type)}</h1>
            </div>

            {/* Invoice Info and Client */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '15px' }}>
              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '8pt', fontWeight: 'bold', color: '#1e40af', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Détails</h3>
                <div style={{ fontSize: '8pt' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ color: '#64748b' }}>N° {document.type === 'facture' ? 'Facture' : document.type === 'devis' ? 'Devis' : 'Document'}:</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{document.number}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ color: '#64748b' }}>Émis le:</span>
                    <span style={{ color: '#1e293b' }}>{formattedIssueDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ color: '#64748b' }}>Échéance:</span>
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{formattedDueDate}</span>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '8pt', fontWeight: 'bold', color: '#1e40af', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Facturer à</h3>
                {client ? (
                  <div style={{ fontSize: '8pt', lineHeight: '1.6' }}>
                    <p style={{ fontWeight: 'bold', color: '#1e293b', margin: 0, fontSize: '9pt' }}>
                      {client.name}{client.company && ` (${client.company})`}
                    </p>
                    {client.rccm && <p style={{ color: '#1e293b', margin: '3px 0 0 0', fontSize: '7pt' }}>RCCM: {client.rccm}</p>}
                    {client.nif && <p style={{ color: '#1e293b', margin: '1px 0 0 0', fontSize: '7pt' }}>NIF: {client.nif}</p>}
                    {client.contact_name && (
                      <>
                        <p style={{ color: '#1e293b', margin: '6px 0 0 0', fontSize: '7pt' }}>Contact:</p>
                        <p style={{ color: '#1e293b', margin: '1px 0 0 0', fontSize: '7pt' }}>{client.contact_name}</p>
                      </>
                    )}
                    {(client.address || client.city || client.country) && (
                      <p style={{ color: '#1e293b', margin: '4px 0 0 0', fontSize: '7pt' }}>
                        {[client.address, client.city, client.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p style={{ color: '#1e293b', margin: '1px 0 0 0', fontSize: '7pt' }}>
                      {[client.email, client.phone].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{document.client_name}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {document.notes && (
              <div style={{ backgroundColor: '#fef3c7', padding: '6px 10px', borderRadius: '4px', marginBottom: '12px', borderLeft: '3px solid #f59e0b' }}>
                <p style={{ fontSize: '8pt', color: '#92400e', margin: 0 }}>{document.notes}</p>
              </div>
            )}

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e40af', color: 'white' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: '8pt', fontWeight: '600' }}>Description</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '8pt', fontWeight: '600', width: '45px' }}>Qté</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '8pt', fontWeight: '600', width: '55px' }}>Unité</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '8pt', fontWeight: '600', width: '85px' }}>Prix unit.</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '8pt', fontWeight: '600', width: '85px' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '8px 6px', color: '#1e293b', fontSize: '8pt' }}>
                      <p style={{ fontWeight: '600', margin: 0 }}>{item.productName || item.description}</p>
                      {item.description && item.productName && (
                        <p style={{ color: '#64748b', fontSize: '7pt', margin: '2px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>{item.description}</p>
                      )}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', color: '#1e293b', fontSize: '8pt' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', color: '#1e293b', textTransform: 'capitalize', fontSize: '8pt' }}>{item.unit || 'unité'}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right', color: '#1e293b', fontSize: '8pt' }}>{formatCurrency(item.unitPrice || item.price || 0)}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right', color: '#1e293b', fontWeight: '600', fontSize: '8pt' }}>{formatCurrency((item.quantity || 0) * (item.unitPrice || item.price || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals and Stamp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
              <div style={{ textAlign: 'center', backgroundColor: 'transparent' }}>
                <img src={tamponNtsagui} alt="Tampon" style={{ height: '90px', width: 'auto', mixBlendMode: 'multiply' }} />
              </div>

              <div style={{ textAlign: 'center', padding: '6px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <QRCodeSVG value={getPublicInvoiceUrl()} size={65} level="M" />
                <p style={{ fontSize: '6pt', color: '#64748b', margin: '3px 0 0 0' }}>Scanner pour confirmer</p>
              </div>

              <div style={{ width: '200px', backgroundColor: '#f8fafc', border: '1px solid #1e40af', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
                    <span style={{ color: '#64748b' }}>Sous-total HT:</span>
                    <span style={{ color: '#1e293b' }}>{formatCurrency(subtotal)}</span>
                  </div>
                </div>
                <div style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
                    <span style={{ color: '#64748b' }}>TVA ({isTaxExempt ? 'Exonéré' : '18%'}):</span>
                    <span style={{ color: '#1e293b' }}>{formatCurrency(taxAmount)}</span>
                  </div>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: '#1e40af' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>TOTAL {isTaxExempt ? '' : 'TTC'}:</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div style={{ marginTop: '15px', padding: '8px 10px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '8pt', color: '#1e293b', margin: 0 }}>
                <strong>Montant à régler:</strong> {formatCurrency(total)} avant le {formattedDueDate}
              </p>
              <p style={{ fontSize: '7pt', color: '#64748b', margin: '4px 0 0 0' }}>
                Paiement à réception de facture. Pénalités de retard: 1,5%/mois.
              </p>
            </div>

            {/* Footer */}
            <div style={{
              position: 'absolute',
              bottom: '15mm',
              left: '20mm',
              right: '20mm',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '10px',
              textAlign: 'center',
              fontSize: '7pt',
              color: '#94a3b8'
            }}>
              <p style={{ margin: '2px 0' }}>{COMPANY_INFO.name} • {COMPANY_INFO.legalForm}</p>
              <p style={{ margin: '2px 0' }}>RCCM: {COMPANY_INFO.rccm} • NIF: {COMPANY_INFO.nif} • ANPI: {COMPANY_INFO.anpi}</p>
              <p style={{ margin: '2px 0' }}>{COMPANY_INFO.address}, {COMPANY_INFO.city} - {COMPANY_INFO.country} • {COMPANY_INFO.website}</p>
            </div>
          </div>
        </div>

        {/* Payment Confirmation */}
        <Card className={document.client_confirmed_payment ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Confirmation de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {document.client_confirmed_payment ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-600 mb-2">Paiement confirmé</h3>
                <p className="text-sm text-muted-foreground">
                  Confirmé le {formatDate(document.client_confirmation_date)}
                </p>
                {document.client_confirmation_note && (
                  <p className="mt-2 text-sm bg-white dark:bg-background p-3 rounded border">
                    "{document.client_confirmation_note}"
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Vous avez effectué le paiement de cette facture ? Confirmez-le ci-dessous pour nous en informer.
                </p>
                <div className="space-y-2">
                  <Label>Note (optionnel)</Label>
                  <Textarea
                    placeholder="Ex: Virement effectué le 15/01/2025, référence ABC123..."
                    value={confirmNote}
                    onChange={(e) => setConfirmNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleConfirmPayment} 
                  disabled={confirming}
                  className="w-full"
                  size="lg"
                >
                  {confirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Confirmation en cours...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Je confirme avoir effectué le paiement
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Document généré par NTSAGUI Digital</p>
          <p>Intelligence Artificielle & Machine Learning</p>
        </div>
      </div>
    </div>
  );
}