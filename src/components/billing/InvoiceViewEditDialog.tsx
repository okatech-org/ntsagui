import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileDown, Save, Copy, Check, Share2, Eye, Pencil, Mail, MessageCircle, Link2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { generateInvoicePDF } from "@/lib/pdfInvoiceGenerator";
import { InvoicePreview, formatCurrency } from "@/components/billing/InvoicePreview";

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

export function InvoiceViewEditDialog({ document: doc, open, onOpenChange }: InvoiceViewEditDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("view");
  const [linkCopied, setLinkCopied] = useState(false);
  const [editData, setEditData] = useState({
    notes: doc?.notes || '',
    payment_due_date: doc?.payment_due_date || '',
  });
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
    try {
      await generateInvoicePDF(
        {
          number: doc.number,
          type: doc.type,
          date: doc.date,
          payment_due_date: doc.payment_due_date,
          client_name: doc.client_name,
          notes: doc.notes,
          items: items,
          subtotal: subtotal,
          total: total,
          client_confirmed_payment: doc.client_confirmed_payment,
          public_token: doc.public_token
        },
        client
      );
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
            {/* Invoice Preview - Using shared component */}
            <InvoicePreview
              document={{
                number: doc.number,
                type: doc.type,
                date: doc.date,
                payment_due_date: doc.payment_due_date,
                client_name: doc.client_name,
                notes: doc.notes,
                items: items,
                subtotal: subtotal,
                total: total,
                client_confirmed_payment: doc.client_confirmed_payment,
                public_token: doc.public_token
              }}
              client={client}
              showQRCode={!!doc.public_token}
            />

            <div className="flex justify-center mt-4">
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
                <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
