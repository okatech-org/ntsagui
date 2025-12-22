import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileDown, Save, Link, Copy, Check, Share2, Eye, Pencil, Mail, MessageCircle } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logoNtsagui from "@/assets/logo-ntsagui.png";
import tamponNtsagui from "@/assets/tampon-ntsagui.png";
import { QRCodeSVG } from "qrcode.react";

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  description: string;
  unit: string;
}

interface InvoiceViewEditDialogProps {
  document: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function InvoiceViewEditDialog({ document: doc, open, onOpenChange }: InvoiceViewEditDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("view");
  const [linkCopied, setLinkCopied] = useState(false);
  const [editData, setEditData] = useState({
    notes: doc?.notes || '',
    payment_due_date: doc?.payment_due_date || '',
  });
  const previewRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: client } = useQuery({
    queryKey: ['billing-client', doc?.client_id],
    queryFn: async () => {
      if (!doc?.client_id) return null;
      const { data, error } = await supabase
        .from('billing_clients')
        .select('*')
        .eq('id', doc.client_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!doc?.client_id
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<typeof editData>) => {
      const { error } = await supabase
        .from('billing_documents')
        .update(updates)
        .eq('id', doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-documents'] });
      toast.success("Facture mise à jour");
      setActiveTab("view");
    },
    onError: () => toast.error("Erreur lors de la mise à jour")
  });

  if (!doc) return null;

  const items: InvoiceItem[] = Array.isArray(doc.items) ? doc.items : [];
  const subtotal = Number(doc.subtotal) || 0;
  const total = Number(doc.total) || 0;
  const taxAmount = total - subtotal;
  const isTaxExempt = taxAmount === 0;

  const formattedIssueDate = new Date(doc.date).toLocaleDateString('fr-FR', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  const formattedDueDate = doc.payment_due_date 
    ? new Date(doc.payment_due_date).toLocaleDateString('fr-FR', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })
    : 'Non spécifiée';

  const getPublicInvoiceUrl = () => {
    return doc.public_token ? `${window.location.origin}/invoice/${doc.public_token}` : null;
  };

  const copyLink = async () => {
    const url = getPublicInvoiceUrl();
    if (!url) {
      toast.error("Lien non disponible");
      return;
    }
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const shareViaWhatsApp = () => {
    const url = getPublicInvoiceUrl();
    if (!url) return;
    const message = `Bonjour ${client?.contact_name || client?.name || ''},\n\nVeuillez trouver ci-joint votre facture N° ${doc.number}.\n\nConsultez et confirmez votre paiement ici : ${url}\n\nCordialement,\nNTSAGUI Digital`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    const url = getPublicInvoiceUrl();
    if (!url) return;
    const subject = `Facture N° ${doc.number} - NTSAGUI Digital`;
    const body = `Bonjour ${client?.contact_name || client?.name || ''},\n\nVeuillez trouver ci-joint votre facture N° ${doc.number}.\n\nConsultez et confirmez votre paiement ici : ${url}\n\nCordialement,\nNTSAGUI Digital`;
    window.open(`mailto:${client?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const exportToPDF = async () => {
    if (!previewRef.current) {
      toast.error("Erreur lors de la génération du PDF");
      return;
    }

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;

      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Facture-${doc.number}.pdf`);

      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({
      notes: editData.notes,
      payment_due_date: editData.payment_due_date || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Facture {doc.number}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Modifier
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Partager
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="flex-1 overflow-auto mt-4">
            <div className="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-lg">
              <div
                ref={previewRef}
                className="mx-auto shadow-xl"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '12mm 15mm 10mm 15mm',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '9pt',
                  lineHeight: '1.3',
                  boxSizing: 'border-box',
                  transform: 'scale(0.55)',
                  transformOrigin: 'top center',
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  color: '#111827'
                }}
              >
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
                  <h1 style={{ fontSize: '18pt', fontWeight: 'bold', color: '#1e40af', margin: 0, letterSpacing: '1px' }}>FACTURE</h1>
                </div>

                {/* Invoice Info and Client */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '15px' }}>
                  <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '8pt', fontWeight: 'bold', color: '#1e40af', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Détails</h3>
                    <div style={{ fontSize: '8pt' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span style={{ color: '#64748b' }}>N° Facture:</span>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{doc.number}</span>
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
                      <p style={{ fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{doc.client_name}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {doc.notes && (
                  <div style={{ backgroundColor: '#fef3c7', padding: '6px 10px', borderRadius: '4px', marginBottom: '12px', borderLeft: '3px solid #f59e0b' }}>
                    <p style={{ fontSize: '8pt', color: '#92400e', margin: 0 }}>{doc.notes}</p>
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
                          <p style={{ fontWeight: '600', margin: 0 }}>{item.productName}</p>
                          {item.description && (
                            <p style={{ color: '#64748b', fontSize: '7pt', margin: '2px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>{item.description}</p>
                          )}
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#1e293b', fontSize: '8pt' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#1e293b', textTransform: 'capitalize', fontSize: '8pt' }}>{item.unit}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#1e293b', fontSize: '8pt' }}>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#1e293b', fontWeight: '600', fontSize: '8pt' }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals and Stamp */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <img src={tamponNtsagui} alt="Tampon" style={{ height: '90px', width: 'auto' }} />
                  </div>

                  {doc.public_token && (
                    <div style={{ textAlign: 'center', padding: '6px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <QRCodeSVG value={getPublicInvoiceUrl() || ''} size={65} level="M" />
                      <p style={{ fontSize: '6pt', color: '#64748b', margin: '3px 0 0 0' }}>Scanner pour confirmer</p>
                    </div>
                  )}

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
                    <strong>Montant à régler:</strong> {formatCurrency(subtotal)} avant le {formattedDueDate}
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

            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={exportToPDF} className="gap-2">
                <FileDown className="h-4 w-4" />
                Télécharger PDF
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="flex-1 overflow-auto mt-4 space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Numéro de facture</Label>
                  <Input value={doc.number} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input value={doc.client_name} disabled className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date d'émission</Label>
                  <Input value={new Date(doc.date).toLocaleDateString('fr-FR')} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Date d'échéance</Label>
                  <Input
                    type="date"
                    value={editData.payment_due_date}
                    onChange={(e) => setEditData({ ...editData, payment_due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  placeholder="Notes, conditions de paiement..."
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Articles ({items.length})</h4>
                <div className="space-y-2 text-sm">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.productName} x{item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Les articles ne peuvent pas être modifiés. Pour modifier les articles, créez une nouvelle facture.
                </p>
              </div>

              <Button 
                onClick={handleSaveEdit} 
                className="w-full gap-2"
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="flex-1 overflow-auto mt-4 space-y-4">
            {doc.public_token ? (
              <>
                <div className="space-y-2">
                  <Label>Lien public de la facture</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={getPublicInvoiceUrl() || ''} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" onClick={copyLink} className="shrink-0">
                      {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ce lien permet au client de visualiser et confirmer le paiement de la facture.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={shareViaWhatsApp} variant="outline" className="gap-2 h-16 flex-col">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <span>Envoyer via WhatsApp</span>
                  </Button>
                  <Button onClick={shareViaEmail} variant="outline" className="gap-2 h-16 flex-col">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span>Envoyer par Email</span>
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-3">QR Code de la facture</p>
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <QRCodeSVG value={getPublicInvoiceUrl() || ''} size={150} level="M" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Le client peut scanner ce code pour accéder à la facture
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun lien public disponible pour cette facture.</p>
                <p className="text-sm mt-2">Le lien est généré automatiquement lors de la création.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
