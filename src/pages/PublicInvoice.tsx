import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, CreditCard, Download, Eye, Share2, Copy, Mail, MessageCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { generateInvoicePDF } from "@/lib/pdfInvoiceGenerator";
import { InvoicePreview, formatDate, getDocumentTitle } from "@/components/billing/InvoicePreview";

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
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("view");

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

  const getPublicInvoiceUrl = () => {
    return `${window.location.origin}/invoice/${token}`;
  };

  const copyLink = async () => {
    const url = getPublicInvoiceUrl();
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const shareViaWhatsApp = () => {
    const url = getPublicInvoiceUrl();
    const docType = document.type === 'facture' ? 'la facture' : document.type === 'devis' ? 'le devis' : 'le document';
    const message = `Bonjour,\n\nVeuillez trouver ci-joint ${docType} N° ${document?.number}.\n\nConsultez et confirmez votre paiement ici : ${url}\n\nCordialement,\nNTSAGUI Digital`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    const url = getPublicInvoiceUrl();
    const docType = document.type === 'facture' ? 'Facture' : document.type === 'devis' ? 'Devis' : 'Document';
    const subject = `${docType} N° ${document?.number} - NTSAGUI Digital`;
    const body = `Bonjour,\n\nVeuillez trouver ci-joint ${docType.toLowerCase()} N° ${document?.number}.\n\nConsultez et confirmez votre paiement ici : ${url}\n\nCordialement,\nNTSAGUI Digital`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const items: DocumentItem[] = document ? (Array.isArray(document.items) ? document.items : []) : [];
  const subtotal = document ? (Number(document.subtotal) || 0) : 0;
  const total = document ? (Number(document.total) || 0) : 0;

  const exportToPDF = async () => {
    if (!document) return;
    
    setExporting(true);
    
    try {
      await generateInvoicePDF(
        {
          number: document.number,
          type: document.type,
          date: document.date,
          payment_due_date: document.payment_due_date,
          client_name: document.client_name,
          notes: document.notes,
          items: items,
          subtotal: subtotal,
          total: total,
          client_confirmed_payment: document.client_confirmed_payment,
          public_token: document.public_token
        },
        client
      );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center">
              {getDocumentTitle(document.type)} N° {document.number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="share" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Partager
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="mt-4">
                {/* Invoice Preview - Using shared component */}
                <InvoicePreview
                  document={{
                    number: document.number,
                    type: document.type,
                    date: document.date,
                    payment_due_date: document.payment_due_date,
                    client_name: document.client_name,
                    notes: document.notes,
                    items: items,
                    subtotal: subtotal,
                    total: total,
                    client_confirmed_payment: document.client_confirmed_payment,
                    public_token: document.public_token
                  }}
                  client={client}
                  showQRCode={true}
                />

                {/* Download Button */}
                <div className="flex justify-center mt-4">
                  <Button onClick={exportToPDF} disabled={exporting} className="gap-2">
                    {exporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
              </TabsContent>

              <TabsContent value="share" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Lien du document</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={getPublicInvoiceUrl()} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" onClick={copyLink} className="shrink-0">
                      {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Partagez ce lien pour permettre à d'autres de voir ce document.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={shareViaWhatsApp} variant="outline" className="gap-2 h-16 flex-col">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <span>Partager via WhatsApp</span>
                  </Button>
                  <Button onClick={shareViaEmail} variant="outline" className="gap-2 h-16 flex-col">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span>Partager par Email</span>
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-3">QR Code du document</p>
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <QRCodeSVG value={getPublicInvoiceUrl()} size={150} level="M" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Scannez ce code pour accéder au document
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
