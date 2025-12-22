import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save, FileDown } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import tamponNtsagui from "@/assets/tampon-ntsagui.png";

interface DocumentItem {
  productId: string;
  quantity: number;
  price: number;
  description: string;
}

interface DocumentCreatorProps {
  type: 'devis' | 'commande' | 'facture';
}

const COMPANY_INFO = {
  name: "NTSAGUI DIGITAL",
  legalForm: "SARL",
  capital: "5 000 000 FCFA",
  rccm: "GA-LBV-01-2025-B12-01029",
  nif: "2025 0102 2429 R",
  address: "Rue des résidences, Batterie IV",
  city: "Libreville",
  country: "Gabon",
  bp: "638",
  phone: "066830673",
  manager: "Yoann ETENO-MBOUROU"
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(amount);
};

const getDocumentTitle = (type: string) => {
  switch (type) {
    case 'devis': return 'DEVIS';
    case 'commande': return 'BON DE COMMANDE';
    case 'facture': return 'FACTURE';
    default: return '';
  }
};

const getDocumentPrefix = (type: string) => {
  switch (type) {
    case 'devis': return 'DEV';
    case 'commande': return 'BC';
    case 'facture': return 'FA';
    default: return '';
  }
};

export function DocumentCreator({ type }: DocumentCreatorProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<DocumentItem[]>([{ productId: '', quantity: 1, price: 0, description: '' }]);
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const previewRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['billing-clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('billing_clients').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['billing-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('billing_products').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['billing-documents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('billing_documents').select('*');
      if (error) throw error;
      return data;
    }
  });

  const generateDocNumber = () => {
    const year = new Date().getFullYear();
    const count = documents.filter(d => d.type === type).length + 1;
    return `${getDocumentPrefix(type)}-${year}-${String(count).padStart(4, '0')}`;
  };

  useEffect(() => {
    if (documents.length >= 0) {
      setDocNumber(generateDocNumber());
    }
  }, [type, documents.length]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const client = clients.find(c => c.id === selectedClient);
      if (!client) throw new Error('Client non sélectionné');

      const { error } = await supabase.from('billing_documents').insert([{
        type,
        number: docNumber,
        date: docDate,
        client_id: selectedClient,
        client_name: client.name,
        items: items as any,
        subtotal: calculateTotal(),
        total: calculateTotal(),
        notes,
        validity_days: validityDays
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-documents'] });
      toast.success(`${getDocumentTitle(type)} enregistré avec succès !`);
      resetForm();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement")
  });

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0, description: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DocumentItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].price = Number(product.price);
        newItems[index].description = product.name;
      }
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const getSelectedClient = () => {
    return clients.find(c => c.id === selectedClient);
  };

  const resetForm = () => {
    setSelectedClient('');
    setItems([{ productId: '', quantity: 1, price: 0, description: '' }]);
    setDocNumber(generateDocNumber());
    setDocDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setValidityDays(30);
  };

  const handleSave = () => {
    if (!selectedClient || items.length === 0 || !items[0].productId) {
      toast.error('Veuillez sélectionner un client et ajouter au moins un article');
      return;
    }
    createMutation.mutate();
  };

  const exportToPDF = async () => {
    if (!selectedClient || !previewRef.current) {
      toast.error("Veuillez d'abord créer le document");
      return;
    }

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
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
      pdf.save(`${docNumber}.pdf`);

      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const client = getSelectedClient();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Créer un {getDocumentTitle(type)}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Numéro de document</Label>
                <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} />
              </div>
              {type === 'devis' && (
                <div className="space-y-2">
                  <Label>Validité (jours)</Label>
                  <Input type="number" min={1} value={validityDays} onChange={e => setValidityDays(parseInt(e.target.value))} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes / Conditions</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Conditions de paiement, garanties, etc."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Articles</CardTitle>
              <Button size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Produit/Service</Label>
                      <Select value={item.productId} onValueChange={value => updateItem(index, 'productId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {formatCurrency(Number(product.price))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {items.length > 1 && (
                      <Button size="icon" variant="destructive" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prix unitaire</Label>
                      <Input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <Input value={formatCurrency(item.quantity * item.price)} disabled className="font-bold" />
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t text-right">
                <p className="text-2xl font-bold text-primary">Total: {formatCurrency(calculateTotal())}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={createMutation.isPending} className="flex-1">
              <Save className="h-4 w-4 mr-2" /> Enregistrer
            </Button>
            <Button onClick={exportToPDF} variant="outline" disabled={!selectedClient}>
              <FileDown className="h-4 w-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du document</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={previewRef} className="p-6 bg-white border rounded-lg text-sm" style={{ minHeight: '600px' }}>
                <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-primary">
                  <div>
                    <h2 className="text-xl font-bold text-primary">{COMPANY_INFO.name}</h2>
                    <p className="text-muted-foreground text-xs mt-1">
                      {COMPANY_INFO.legalForm} au capital de {COMPANY_INFO.capital}<br />
                      RCCM: {COMPANY_INFO.rccm}<br />
                      NIF: {COMPANY_INFO.nif}<br />
                      {COMPANY_INFO.address}, {COMPANY_INFO.city}<br />
                      Tél: {COMPANY_INFO.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{docNumber}</p>
                    <p className="text-muted-foreground text-xs">Date: {new Date(docDate).toLocaleDateString('fr-FR')}</p>
                    {type === 'devis' && (
                      <p className="text-muted-foreground text-xs">Validité: {validityDays} jours</p>
                    )}
                  </div>
                </div>

                <div className="text-center py-3 px-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg mb-6">
                  {getDocumentTitle(type)}
                </div>

                {client && (
                  <div className="bg-muted p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-primary mb-2">Client</h4>
                    <p className="font-bold text-foreground">
                      {client.name}{client.company && ` (${client.company})`}
                    </p>
                    {(client as any).rccm && (
                      <p className="text-foreground text-xs">RCCM: {(client as any).rccm}</p>
                    )}
                    {(client as any).nif && (
                      <p className="text-foreground text-xs">NIF: {(client as any).nif}</p>
                    )}
                    {(client as any).contact_name && (
                      <>
                        <p className="text-foreground text-xs mt-2">Contact:</p>
                        <p className="text-foreground text-xs">{(client as any).contact_name}</p>
                      </>
                    )}
                    <p className="text-foreground text-xs">
                      {[client.email, client.phone].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                )}

                <table className="w-full mb-6 text-xs">
                  <thead className="bg-primary text-primary-foreground">
                    <tr>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-center">Qté</th>
                      <th className="p-2 text-right">Prix unit.</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(item => item.productId).map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mb-6">
                  <div className="bg-muted p-4 rounded-lg min-w-[200px]">
                    <div className="flex justify-between py-1 border-b">
                      <span>Sous-total:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-primary text-lg border-t-2 border-primary mt-2">
                      <span>TOTAL XAF:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                {notes && (
                  <div className="bg-muted p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-primary mb-2">Notes et conditions</h4>
                    <p className="whitespace-pre-wrap text-muted-foreground text-xs">{notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-end pt-4 border-t mt-8">
                  <p className="text-xs text-muted-foreground">Gérant: {COMPANY_INFO.manager}</p>
                  <div className="text-center flex flex-col items-center">
                    <p className="text-muted-foreground text-xs mb-2">Signature et cachet</p>
                    <img
                      src={tamponNtsagui}
                      alt="Tampon NTSAGUI Digital"
                      className="h-20 w-auto opacity-90"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
