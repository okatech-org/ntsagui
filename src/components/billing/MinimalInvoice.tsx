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
import { Plus, Trash2, Save, FileDown, Eye, EyeOff, GripVertical, Package, Calculator, Share2, Link, Copy, Check } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logoNtsagui from "@/assets/logo-ntsagui.png";
import tamponNtsagui from "@/assets/tampon-ntsagui.png";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  description: string;
  unit: string;
}

const UNIT_OPTIONS = [
  { value: 'unité', label: 'Unité' },
  { value: 'jour', label: 'Jour' },
  { value: 'heure', label: 'Heure' },
  { value: 'mois', label: 'Mois' },
  { value: 'an', label: 'An' },
  { value: 'forfait', label: 'Forfait' },
];

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

export function MinimalInvoice() {
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ productId: '', productName: '', quantity: 1, unitPrice: 0, description: '', unit: 'unité' }]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('XAF');
  const [showPreview, setShowPreview] = useState(true);
  const [savedDocumentToken, setSavedDocumentToken] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
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

      const { data, error } = await supabase.from('billing_documents').insert([{
        type: 'facture',
        number: invoiceNumber,
        date: issueDate,
        client_id: selectedClient,
        client_name: client.name,
        items: items as any,
        subtotal: calculateTotal(),
        total: getTotalTTC(),
        notes,
        payment_due_date: dueDate
      }]).select('public_token').single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['billing-documents'] });
      toast.success('Facture enregistrée avec succès !');
      if (data?.public_token) {
        setSavedDocumentToken(data.public_token);
      }
    },
    onError: () => toast.error("Erreur lors de l'enregistrement")
  });

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, description: '', unit: 'unité' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = Number(product.price);
        newItems[index].description = product.description || '';
        newItems[index].unit = product.unit || 'unité';
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

  const isTaxExempt = () => {
    const client = getSelectedClient();
    return (client as any)?.tax_exempt || false;
  };

  const getTaxAmount = () => {
    return isTaxExempt() ? 0 : calculateTotal() * 0.18;
  };

  const getTotalTTC = () => {
    return calculateTotal() + getTaxAmount();
  };

  const resetForm = () => {
    setSelectedClient('');
    setItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, description: '', unit: 'unité' }]);
    setInvoiceNumber(generateInvoiceNumber());
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setSavedDocumentToken(null);
    setLinkCopied(false);
  };

  const getPublicInvoiceUrl = (token: string) => {
    return `${window.location.origin}/invoice/${token}`;
  };

  const copyLink = async () => {
    if (!savedDocumentToken) return;
    const url = getPublicInvoiceUrl(savedDocumentToken);
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const shareViaWhatsApp = () => {
    if (!savedDocumentToken) return;
    const url = getPublicInvoiceUrl(savedDocumentToken);
    const client = getSelectedClient();
    const message = `Bonjour ${client?.contact_name || client?.name || ''},\n\nVeuillez trouver ci-joint votre facture N° ${invoiceNumber}.\n\nConsultez et confirmez votre paiement ici : ${url}\n\nCordialement,\nNTSAGUI Digital`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!savedDocumentToken) return;
    const url = getPublicInvoiceUrl(savedDocumentToken);
    const client = getSelectedClient();
    const subject = `Facture N° ${invoiceNumber} - NTSAGUI Digital`;
    const body = `Bonjour ${client?.contact_name || client?.name || ''},\n\nVeuillez trouver ci-joint votre facture N° ${invoiceNumber}.\n\nConsultez et confirmez votre paiement ici : ${url}\n\nCordialement,\nNTSAGUI Digital`;
    window.open(`mailto:${client?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
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
  const formattedIssueDate = new Date(issueDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedDueDate = new Date(dueDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const validItems = items.filter(item => item.productId);

  return (
    <div className="space-y-6">
      {/* Header with Title and Preview Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Créer une Facture
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Remplissez les informations ci-dessous pour générer votre facture
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? 'Masquer aperçu' : 'Afficher aperçu'}
        </Button>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'xl:grid-cols-2' : 'grid-cols-1 max-w-3xl'}`}>
        {/* Form Section */}
        <div className="space-y-6">
          {/* Invoice Info Card */}
          <Card className="border-2 border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">#</span>
                </div>
                Informations de la facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Numéro de facture</Label>
                  <Input
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="font-mono bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Devise</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XAF">XAF (FCFA)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date d'émission</Label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date d'échéance</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Client <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className={`bg-muted/50 ${!selectedClient && 'border-dashed'}`}>
                    <SelectValue placeholder="Sélectionner un client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {client.name.charAt(0)}
                          </div>
                          <span>{client.name}</span>
                          {client.company && <span className="text-muted-foreground">({client.company})</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes (optionnel)</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Conditions de paiement, mentions spéciales..."
                  className="bg-muted/50 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Articles Card */}
          <Card className="border-2 border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  Articles
                  <span className="text-sm font-normal text-muted-foreground">
                    ({validItems.length} article{validItems.length !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
                <Button size="sm" onClick={addItem} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="group relative p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
                  >
                    {/* Article Number Badge */}
                    <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                      {index + 1}
                    </div>

                    {/* Delete Button */}
                    {items.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(index)}
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <div className="space-y-4 pt-2">
                      {/* Product Selection */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Produit/Service
                        </Label>
                        <Select value={item.productId} onValueChange={value => updateItem(index, 'productId', value)}>
                          <SelectTrigger className={`bg-background ${!item.productId && 'border-dashed border-primary/50'}`}>
                            <SelectValue placeholder="Choisir un produit..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex items-center justify-between w-full gap-4">
                                  <span>{product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatCurrency(Number(product.price), currency)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Description
                        </Label>
                        <Textarea
                          value={item.description}
                          onChange={e => updateItem(index, 'description', e.target.value)}
                          rows={2}
                          className="text-sm bg-background resize-none"
                          placeholder="Détails de la prestation..."
                        />
                      </div>

                      {/* Quantity, Unit, Price Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Qté</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="bg-background text-center"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Unité</Label>
                          <Select value={item.unit} onValueChange={value => updateItem(index, 'unit', value)}>
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Prix unit.</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.unitPrice}
                            onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Montant</Label>
                          <div className="h-10 px-3 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-end">
                            <span className="font-semibold text-primary text-sm">
                              {formatCurrency(item.quantity * item.unitPrice, currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Total Section */}
              <motion.div
                layout
                className="pt-4 mt-4 border-t-2 border-dashed border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-muted-foreground">Total</span>
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {formatCurrency(calculateTotal(), currency)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          {/* Share Section - After Save */}
          {savedDocumentToken && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-400">Facture enregistrée !</h4>
                      <p className="text-sm text-muted-foreground">Partagez le lien avec votre client</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={copyLink} variant="outline" size="sm" className="flex-1">
                      {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {linkCopied ? 'Copié !' : 'Copier le lien'}
                    </Button>
                    <Button onClick={shareViaWhatsApp} variant="outline" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button onClick={shareViaEmail} variant="outline" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>

                  <div className="mt-3 p-2 bg-white dark:bg-background rounded border text-xs text-muted-foreground break-all">
                    <Link className="h-3 w-3 inline mr-1" />
                    {getPublicInvoiceUrl(savedDocumentToken)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons - Sticky on Mobile */}
          <div className="sticky bottom-4 z-10 flex gap-3 p-4 -mx-4 bg-gradient-to-t from-background via-background to-transparent">
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || !selectedClient || !validItems.length}
              className="flex-1 h-12 text-base font-semibold shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              onClick={exportToPDF}
              variant="outline"
              disabled={!selectedClient || !validItems.length}
              className="h-12 px-6 shadow-lg"
            >
              <FileDown className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            {savedDocumentToken && (
              <Button
                onClick={resetForm}
                variant="ghost"
                className="h-12 px-4"
              >
                Nouvelle facture
              </Button>
            )}
          </div>
        </div>

        {/* Preview Section - Sticky on Desktop */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="hidden xl:block"
            >
              <div className="sticky top-6">
                <Card className="border-2 border-border/50 shadow-lg overflow-hidden">
                  <CardHeader className="pb-3 bg-muted/30">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Aperçu en temps réel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[calc(100vh-200px)] overflow-auto p-4 bg-neutral-100 dark:bg-neutral-800/50">
                      <div
                        ref={previewRef}
                        className="bg-white text-gray-900 mx-auto shadow-xl"
                        style={{
                          width: '210mm',
                          minHeight: '297mm',
                          padding: '12mm 15mm 10mm 15mm',
                          fontFamily: 'Arial, Helvetica, sans-serif',
                          fontSize: '9pt',
                          lineHeight: '1.3',
                          boxSizing: 'border-box',
                          transform: 'scale(0.5)',
                          transformOrigin: 'top center',
                          position: 'relative'
                        }}
                      >
                        {/* Header Row - Logo and Company Info - Compact */}
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

                        {/* Document Title - Compact */}
                        <div style={{ textAlign: 'center', margin: '10px 0 15px 0' }}>
                          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', color: '#1e40af', margin: 0, letterSpacing: '1px' }}>FACTURE</h1>
                        </div>

                        {/* Invoice Info and Client - Two Columns - Compact */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '15px' }}>
                          {/* Invoice Details */}
                          <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '8pt', fontWeight: 'bold', color: '#1e40af', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Détails</h3>
                            <div style={{ fontSize: '8pt' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                <span style={{ color: '#64748b' }}>N° Facture:</span>
                                <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{invoiceNumber}</span>
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

                          {/* Client Details */}
                          <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '8pt', fontWeight: 'bold', color: '#1e40af', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Facturer à</h3>
                            {client ? (
                              <div style={{ fontSize: '8pt', lineHeight: '1.6' }}>
                                <p style={{ fontWeight: 'bold', color: '#1e293b', margin: 0, fontSize: '9pt' }}>
                                  {client.name}{client.company && ` (${client.company})`}
                                </p>
                                {client.rccm && (
                                  <p style={{ color: '#1e293b', margin: '3px 0 0 0', fontSize: '7pt' }}>
                                    RCCM: {client.rccm}
                                  </p>
                                )}
                                {client.nif && (
                                  <p style={{ color: '#1e293b', margin: '1px 0 0 0', fontSize: '7pt' }}>
                                    NIF: {client.nif}
                                  </p>
                                )}
                                {client.contact_name && (
                                  <>
                                    <p style={{ color: '#1e293b', margin: '6px 0 0 0', fontSize: '7pt' }}>
                                      Contact:
                                    </p>
                                    <p style={{ color: '#1e293b', margin: '1px 0 0 0', fontSize: '7pt' }}>
                                      {client.contact_name}
                                    </p>
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
                              <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '8pt', margin: 0 }}>Sélectionnez un client</p>
                            )}
                          </div>
                        </div>

                        {/* Notes/Description */}
                        {notes && (
                          <div style={{ backgroundColor: '#fef3c7', padding: '6px 10px', borderRadius: '4px', marginBottom: '12px', borderLeft: '3px solid #f59e0b' }}>
                            <p style={{ fontSize: '8pt', color: '#92400e', margin: 0 }}>{notes}</p>
                          </div>
                        )}

                        {/* Items Table - Compact */}
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
                            {validItems.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ padding: '25px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', backgroundColor: '#f8fafc', fontSize: '8pt' }}>
                                  Aucun article ajouté
                                </td>
                              </tr>
                            ) : (
                              validItems.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                  <td style={{ padding: '8px 6px', color: '#1e293b', fontSize: '8pt' }}>
                                    <p style={{ fontWeight: '600', margin: 0 }}>{item.productName}</p>
                                    {item.description && (
                                      <p style={{ color: '#64748b', fontSize: '7pt', margin: '2px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>{item.description}</p>
                                    )}
                                  </td>
                                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#1e293b', fontSize: '8pt' }}>{item.quantity}</td>
                                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#1e293b', textTransform: 'capitalize', fontSize: '8pt' }}>{item.unit}</td>
                                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#1e293b', fontSize: '8pt' }}>{formatCurrency(item.unitPrice, currency)}</td>
                                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#1e293b', fontWeight: '600', fontSize: '8pt' }}>{formatCurrency(item.quantity * item.unitPrice, currency)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>

                        {/* Totals and Stamp Row - Compact */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                          {/* Company Stamp */}
                          <div style={{ textAlign: 'center' }}>
                            <img
                              src={tamponNtsagui}
                              alt="Tampon NTSAGUI Digital"
                              style={{ height: '90px', width: 'auto' }}
                            />
                          </div>

                          {/* QR Code for payment confirmation */}
                          {savedDocumentToken && (
                            <div style={{ textAlign: 'center', padding: '6px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <QRCodeSVG 
                                value={getPublicInvoiceUrl(savedDocumentToken)} 
                                size={65}
                                level="M"
                              />
                              <p style={{ fontSize: '6pt', color: '#64748b', margin: '3px 0 0 0' }}>Scanner pour confirmer</p>
                            </div>
                          )}

                          {/* Totals Box - Compact */}
                          <div style={{ width: '200px', backgroundColor: '#f8fafc', border: '1px solid #1e40af', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
                                <span style={{ color: '#64748b' }}>Sous-total HT:</span>
                                <span style={{ color: '#1e293b' }}>{formatCurrency(calculateTotal(), currency)}</span>
                              </div>
                            </div>
                            <div style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
                                <span style={{ color: '#64748b' }}>TVA ({isTaxExempt() ? 'Exonéré' : '18%'}):</span>
                                <span style={{ color: '#1e293b' }}>{formatCurrency(getTaxAmount(), currency)}</span>
                              </div>
                            </div>
                            <div style={{ padding: '8px 10px', backgroundColor: '#1e40af' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                                <span style={{ color: 'white', fontWeight: 'bold' }}>TOTAL {isTaxExempt() ? '' : 'TTC'}:</span>
                                <span style={{ color: 'white', fontWeight: 'bold' }}>{formatCurrency(getTotalTTC(), currency)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Info - Compact */}
                        <div style={{ marginTop: '15px', padding: '8px 10px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                          <p style={{ fontSize: '8pt', color: '#1e293b', margin: 0 }}>
                            <strong>Montant à régler:</strong> {formatCurrency(calculateTotal(), currency)} avant le {formattedDueDate}
                          </p>
                          <p style={{ fontSize: '7pt', color: '#64748b', margin: '4px 0 0 0' }}>
                            Paiement à réception de facture. Pénalités de retard: 1,5%/mois.
                          </p>
                        </div>

                        {/* Footer - Legal info */}
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
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Preview Modal/Sheet could be added here for better mobile UX */}
    </div >
  );
}
