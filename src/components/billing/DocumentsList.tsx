import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, Trash2, ArrowRight, CreditCard, Clock, CheckCircle, AlertCircle, UserCheck, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(amount);
};

const getTypeLabel = (type: string) => {
  switch(type) {
    case 'devis': return 'Devis';
    case 'commande': return 'Bon de commande';
    case 'facture': return 'Facture';
    default: return type;
  }
};

const getTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
  switch(type) {
    case 'devis': return 'secondary';
    case 'commande': return 'outline';
    case 'facture': return 'default';
    default: return 'default';
  }
};

const getPaymentStatusConfig = (status: string) => {
  switch(status) {
    case 'paid':
      return { label: 'Payé', icon: CheckCircle, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    case 'partial':
      return { label: 'Partiel', icon: Clock, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    case 'overdue':
      return { label: 'En retard', icon: AlertCircle, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    default:
      return { label: 'En attente', icon: Clock, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
  }
};

export function DocumentsList() {
  const [filter, setFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['billing-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('billing_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-documents'] });
      toast.success("Document supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: async (doc: any) => {
      const year = new Date().getFullYear();
      const invoiceCount = documents.filter(d => d.type === 'facture').length + 1;
      const newNumber = `FA-${year}-${String(invoiceCount).padStart(4, '0')}`;
      
      const { error } = await supabase.from('billing_documents').insert([{
        type: 'facture',
        number: newNumber,
        date: new Date().toISOString().split('T')[0],
        client_id: doc.client_id,
        client_name: doc.client_name,
        items: doc.items,
        subtotal: doc.subtotal,
        total: doc.total,
        notes: doc.notes,
        source_document_id: doc.id,
        payment_status: 'pending',
        payment_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-documents'] });
      toast.success("Facture créée à partir du devis !");
    },
    onError: () => toast.error("Erreur lors de la conversion")
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, amount, status }: { id: string; amount: number; status: string }) => {
      const { error } = await supabase.from('billing_documents').update({
        amount_paid: amount,
        payment_status: status,
        payment_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-documents'] });
      toast.success("Paiement mis à jour");
      setSelectedDoc(null);
      setPaymentAmount('');
    },
    onError: () => toast.error("Erreur lors de la mise à jour")
  });

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleConvertToInvoice = (doc: any) => {
    if (confirm('Convertir ce devis en facture ?')) {
      convertToInvoiceMutation.mutate(doc);
    }
  };

  const handlePaymentUpdate = () => {
    if (!selectedDoc || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    const total = Number(selectedDoc.total);
    let status = 'pending';
    if (amount >= total) status = 'paid';
    else if (amount > 0) status = 'partial';
    
    updatePaymentMutation.mutate({ id: selectedDoc.id, amount, status });
  };

  const filteredDocs = documents
    .filter(d => filter === 'all' || d.type === filter)
    .filter(d => {
      if (paymentFilter === 'all') return true;
      if (d.type !== 'facture') return paymentFilter === 'all';
      if (paymentFilter === 'client_confirmed') return d.client_confirmed_payment;
      return d.payment_status === paymentFilter;
    });

  const devisCount = documents.filter(d => d.type === 'devis').length;
  const commandesCount = documents.filter(d => d.type === 'commande').length;
  const facturesCount = documents.filter(d => d.type === 'facture').length;
  const overdueCount = documents.filter(d => d.type === 'facture' && d.payment_status === 'overdue').length;
  const pendingCount = documents.filter(d => d.type === 'facture' && d.payment_status === 'pending').length;
  const clientConfirmedCount = documents.filter(d => d.type === 'facture' && d.client_confirmed_payment).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-primary">Mes documents</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Tous ({documents.length})
          </Button>
          <Button 
            variant={filter === 'devis' ? 'default' : 'outline'}
            onClick={() => setFilter('devis')}
            size="sm"
          >
            Devis ({devisCount})
          </Button>
          <Button 
            variant={filter === 'commande' ? 'default' : 'outline'}
            onClick={() => setFilter('commande')}
            size="sm"
          >
            Commandes ({commandesCount})
          </Button>
          <Button 
            variant={filter === 'facture' ? 'default' : 'outline'}
            onClick={() => setFilter('facture')}
            size="sm"
          >
            Factures ({facturesCount})
          </Button>
        </div>
      </div>

      {/* Payment status filter for invoices */}
      {filter === 'facture' && (
        <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium mr-2">Statut paiement:</span>
          {[
            { value: 'all', label: 'Tous' },
            { value: 'pending', label: `En attente (${pendingCount})` },
            { value: 'partial', label: 'Partiels' },
            { value: 'paid', label: 'Payés' },
            { value: 'overdue', label: `En retard (${overdueCount})`, className: overdueCount > 0 ? 'text-red-600' : '' },
            { value: 'client_confirmed', label: `Validés client (${clientConfirmedCount})`, className: 'text-blue-600' }
          ].map(item => (
            <Button
              key={item.value}
              variant={paymentFilter === item.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPaymentFilter(item.value)}
              className={item.className}
            >
              {item.label}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
      ) : filteredDocs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Aucun document</p>
            <p className="text-sm mt-2">Créez votre premier document (devis, bon de commande ou facture)</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary text-primary-foreground">
                  <TableHead className="text-primary-foreground">Type</TableHead>
                  <TableHead className="text-primary-foreground">Numéro</TableHead>
                  <TableHead className="text-primary-foreground">Date</TableHead>
                  <TableHead className="text-primary-foreground">Client</TableHead>
                  <TableHead className="text-primary-foreground">Montant</TableHead>
                  <TableHead className="text-primary-foreground">Statut</TableHead>
                  <TableHead className="text-primary-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map(doc => {
                  const paymentConfig = getPaymentStatusConfig(doc.payment_status || 'pending');
                  const PaymentIcon = paymentConfig.icon;
                  
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(doc.type)}>
                          {getTypeLabel(doc.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">{doc.number}</TableCell>
                      <TableCell>{new Date(doc.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{doc.client_name}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(Number(doc.total))}</TableCell>
                      <TableCell>
                        {doc.type === 'facture' ? (
                          <div className="flex flex-col gap-1">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentConfig.className}`}>
                              <PaymentIcon className="h-3 w-3" />
                              {paymentConfig.label}
                              {doc.payment_status === 'partial' && (
                                <span className="ml-1">({formatCurrency(Number(doc.amount_paid || 0))})</span>
                              )}
                            </div>
                            {doc.client_confirmed_payment && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer">
                                    <UserCheck className="h-3 w-3" />
                                    Validé par client
                                    <Info className="h-3 w-3 ml-1" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                      <UserCheck className="h-4 w-4 text-blue-600" />
                                      Confirmation client
                                    </h4>
                                    <div className="text-sm space-y-1">
                                      <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Date:</span>{' '}
                                        {doc.client_confirmation_date 
                                          ? new Date(doc.client_confirmation_date).toLocaleString('fr-FR', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })
                                          : 'Non spécifiée'}
                                      </p>
                                      {doc.client_confirmation_note && (
                                        <div>
                                          <span className="font-medium text-foreground">Note:</span>
                                          <p className="mt-1 p-2 bg-muted rounded text-muted-foreground italic">
                                            "{doc.client_confirmation_note}"
                                          </p>
                                        </div>
                                      )}
                                      {!doc.client_confirmation_note && (
                                        <p className="text-muted-foreground italic">Aucune note</p>
                                      )}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {doc.type === 'devis' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleConvertToInvoice(doc)}
                              title="Convertir en facture"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                          {doc.type === 'facture' && doc.payment_status !== 'paid' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setPaymentAmount(doc.amount_paid?.toString() || '');
                                  }}
                                  title="Enregistrer paiement"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Enregistrer un paiement</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Facture: {doc.number}</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Total: {formatCurrency(Number(doc.total))}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Montant payé (XAF)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={Number(doc.total)}
                                      value={paymentAmount}
                                      onChange={e => setPaymentAmount(e.target.value)}
                                      placeholder="Montant reçu"
                                    />
                                  </div>
                                  <Button 
                                    onClick={handlePaymentUpdate} 
                                    className="w-full"
                                    disabled={updatePaymentMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Enregistrer le paiement
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
