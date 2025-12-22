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

interface InvoiceItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  description: string;
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

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export function MinimalInvoice() {
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ productId: '', quantity: 1, unitPrice: 0, description: '' }]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');
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

  const generateInvoiceNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += i % 2 === 0 ? chars[Math.floor(Math.random() * chars.length)] : nums[Math.floor(Math.random() * nums.length)];
    }
    const count = documents.filter(d => d.type === 'facture').length + 1;
    return `${code}-${String(count).padStart(4, '0')}`;
  };

  useEffect(() => {
    if (documents.length >= 0) {
      setInvoiceNumber(generateInvoiceNumber());
    }
  }, [documents.length]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const client = clients.find(c => c.id === selectedClient);
      if (!client) throw new Error('Client non sélectionné');

      const { error } = await supabase.from('billing_documents').insert([{
        type: 'facture',
        number: invoiceNumber,
        date: issueDate,
        client_id: selectedClient,
        client_name: client.name,
        items: items as any,
        subtotal: calculateTotal(),
        total: calculateTotal(),
        notes,
        payment_due_date: dueDate
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-documents'] });
      toast.success('Facture enregistrée avec succès !');
      resetForm();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement")
  });

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0, description: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unitPrice = Number(product.price);
        newItems[index].description = product.description || product.name;
      }
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const getSelectedClient = () => {
    return clients.find(c => c.id === selectedClient);
  };

  const resetForm = () => {
    setSelectedClient('');
    setItems([{ productId: '', quantity: 1, unitPrice: 0, description: '' }]);
    setInvoiceNumber(generateInvoiceNumber());
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date().toISOString().split('T')[0]);
    setNotes('');
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
      toast.error("Veuillez d'abord créer la facture");
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
      pdf.save(`Invoice-${invoiceNumber}.pdf`);
      
      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const client = getSelectedClient();
  const formattedIssueDate = new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Créer une Facture (Style Minimal)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Numéro de facture</Label>
                  <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="XAF">XAF (FCFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date d'émission</Label>
                  <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date d'échéance</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
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
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes additionnelles..."
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
                              {product.name} - {formatCurrency(Number(product.price), currency)}
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
                  <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea 
                      value={item.description}
                      onChange={e => updateItem(index, 'description', e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
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
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Montant</Label>
                      <Input value={formatCurrency(item.quantity * item.unitPrice, currency)} disabled className="font-bold" />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t text-right">
                <p className="text-2xl font-bold text-primary">Total: {formatCurrency(calculateTotal(), currency)}</p>
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

        {/* Preview Section - Minimal Cursor-like Design */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de la facture</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={previewRef} 
                className="bg-white text-gray-900 p-8 rounded-lg border"
                style={{ minHeight: '700px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {/* Header */}
                <h1 className="text-4xl font-light text-gray-900 mb-8">Invoice</h1>

                {/* Invoice Meta */}
                <div className="grid grid-cols-3 gap-8 mb-8 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Invoice number</p>
                    <p className="text-gray-900">{invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Date of issue</p>
                    <p className="text-gray-900">{formattedIssueDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Date due</p>
                    <p className="text-gray-900">{formattedDueDate}</p>
                  </div>
                </div>

                {/* Company and Client Info */}
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">{COMPANY_INFO.name}</p>
                    <p className="text-gray-500 text-xs italic mb-2">{COMPANY_INFO.tagline}</p>
                    <p className="text-gray-600">{COMPANY_INFO.address}</p>
                    <p className="text-gray-600">{COMPANY_INFO.city}, {COMPANY_INFO.country}</p>
                    <p className="text-gray-600">{COMPANY_INFO.phone}</p>
                    <p className="text-gray-600">{COMPANY_INFO.email}</p>
                    <p className="text-gray-600">{COMPANY_INFO.website}</p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-gray-500 text-xs">{COMPANY_INFO.legalForm}</p>
                      <p className="text-gray-500 text-xs">RCCM: {COMPANY_INFO.rccm}</p>
                      <p className="text-gray-500 text-xs">NIF: {COMPANY_INFO.nif}</p>
                      <p className="text-gray-500 text-xs">ANPI: {COMPANY_INFO.anpi}</p>
                    </div>
                  </div>
                  {client && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Bill to</p>
                      <p className="text-gray-900 font-medium">{client.name}</p>
                      {client.address && <p className="text-gray-600">{client.address}</p>}
                      {client.city && <p className="text-gray-600">{client.city}</p>}
                      <p className="text-gray-600">{client.country || 'France'}</p>
                      {client.phone && <p className="text-gray-600">{client.phone}</p>}
                      <p className="text-gray-600">{client.email}</p>
                    </div>
                  )}
                </div>

                {/* Amount Due Banner */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formatCurrency(calculateTotal(), currency)} due {formattedDueDate}
                  </h2>
                </div>

                {/* Items Description */}
                {notes && (
                  <p className="text-gray-600 text-sm mb-4">{notes}</p>
                )}

                {/* Items Table */}
                <table className="w-full mb-8 text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-gray-500 font-medium">Description</th>
                      <th className="text-center py-3 text-gray-500 font-medium w-16">Qty</th>
                      <th className="text-right py-3 text-gray-500 font-medium w-24">Unit price</th>
                      <th className="text-right py-3 text-gray-500 font-medium w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(item => item.productId).map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 text-gray-900 pr-4">
                          <p className="whitespace-pre-wrap">{item.description}</p>
                        </td>
                        <td className="py-4 text-center text-gray-900">{item.quantity}</td>
                        <td className="py-4 text-right text-gray-900">{formatCurrency(item.unitPrice, currency)}</td>
                        <td className="py-4 text-right text-gray-900">{formatCurrency(item.quantity * item.unitPrice, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 text-sm">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(calculateTotal(), currency)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200">
                      <span className="text-gray-500">Total</span>
                      <span className="text-gray-900">{formatCurrency(calculateTotal(), currency)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-900 font-semibold">
                      <span className="text-gray-900">Amount due</span>
                      <span className="text-gray-900">{formatCurrency(calculateTotal(), currency)} {currency}</span>
                    </div>
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
