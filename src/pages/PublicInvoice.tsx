import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, FileText, Building2, Calendar, CreditCard, Download } from "lucide-react";
import logoNtsagui from "@/assets/logo-ntsagui.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
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

  const items: DocumentItem[] = Array.isArray(document?.items) ? document.items : [];
  const subtotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || item.price || 0)), 0);
  const taxExempt = client?.tax_exempt || false;
  const taxAmount = taxExempt ? 0 : subtotal * 0.18;
  const total = subtotal + taxAmount;

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
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Document non trouvé</h2>
            <p className="text-muted-foreground">Ce lien n'est plus valide ou le document a été supprimé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'facture': return 'Facture';
      case 'devis': return 'Devis';
      case 'bon_commande': return 'Bon de Commande';
      default: return 'Document';
    }
  };

  const exportToPDF = async () => {
    if (!invoiceRef.current) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${getDocumentTitle(document.type)}_${document.number}.pdf`);
      
      toast.success('PDF téléchargé avec succès !');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Download Button */}
        <div className="flex justify-end print:hidden">
          <Button onClick={exportToPDF} disabled={exporting} variant="outline" className="gap-2">
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Génération...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Télécharger PDF
              </>
            )}
          </Button>
        </div>

        {/* Printable Invoice Content */}
        <div ref={invoiceRef} className="bg-white dark:bg-background p-6 rounded-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={logoNtsagui} alt="NTSAGUI Digital" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary">
              {getDocumentTitle(document.type)} N° {document.number}
            </h1>
            <p className="text-muted-foreground">Émise le {formatDate(document.date)}</p>
          </div>

        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-bold text-lg">{document.client_name}</p>
              {client?.rccm && <p className="text-sm text-muted-foreground">RCCM: {client.rccm}</p>}
              {client?.nif && <p className="text-sm text-muted-foreground">NIF: {client.nif}</p>}
              {client?.contact_name && <p className="text-sm">Contact: {client.contact_name}</p>}
              {(client?.email || client?.phone) && (
                <p className="text-sm text-muted-foreground">
                  {[client?.email, client?.phone].filter(Boolean).join(' / ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Détail des prestations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-center">Qté</th>
                    <th className="p-3 text-right">P.U.</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.description || item.productName}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unitPrice || item.price || 0)}</td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency((item.quantity || 0) * (item.unitPrice || item.price || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="bg-muted p-4 rounded-lg min-w-[250px]">
                <div className="flex justify-between py-1 border-b">
                  <span>Sous-total HT:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>TVA ({taxExempt ? 'Exonéré' : '18%'}):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-primary text-lg border-t-2 border-primary mt-2">
                  <span>TOTAL {taxExempt ? '' : 'TTC'}:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
