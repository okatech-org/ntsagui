import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Package, FileText, DollarSign, AlertCircle, CheckCircle, Clock } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(amount);
};

export function BillingDashboard() {
  const { data: clients = [] } = useQuery({
    queryKey: ['billing-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['billing-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: documents = [] } = useQuery({
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

  const devis = documents.filter(d => d.type === 'devis');
  const commandes = documents.filter(d => d.type === 'commande');
  const factures = documents.filter(d => d.type === 'facture');
  const totalFactures = factures.reduce((sum, f) => sum + Number(f.total || 0), 0);
  const totalPaid = factures.reduce((sum, f) => sum + Number(f.amount_paid || 0), 0);
  const pendingInvoices = factures.filter(f => f.payment_status === 'pending' || f.payment_status === 'partial');
  const overdueInvoices = factures.filter(f => f.payment_status === 'overdue');
  const paidInvoices = factures.filter(f => f.payment_status === 'paid');

  const stats = [
    { 
      title: "Clients", 
      value: clients.length, 
      subtitle: "Clients enregistrés",
      icon: Users,
      gradient: "from-primary to-primary/80"
    },
    { 
      title: "Produits & Services", 
      value: products.length, 
      subtitle: "Articles au catalogue",
      icon: Package,
      gradient: "from-emerald-500 to-emerald-400"
    },
    { 
      title: "Chiffre d'affaires", 
      value: formatCurrency(totalFactures), 
      subtitle: `${formatCurrency(totalPaid)} encaissé`,
      icon: DollarSign,
      gradient: "from-violet-500 to-violet-400"
    },
    { 
      title: "Solde à percevoir", 
      value: formatCurrency(totalFactures - totalPaid), 
      subtitle: `${pendingInvoices.length} factures en attente`,
      icon: Clock,
      gradient: "from-amber-500 to-amber-400"
    },
  ];

  const paymentStats = [
    { 
      label: "Payées", 
      count: paidInvoices.length, 
      icon: CheckCircle, 
      color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200" 
    },
    { 
      label: "En attente", 
      count: pendingInvoices.length, 
      icon: Clock, 
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-200" 
    },
    { 
      label: "En retard", 
      count: overdueInvoices.length, 
      icon: AlertCircle, 
      color: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200" 
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Tableau de bord Facturation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`bg-gradient-to-br ${stat.gradient} text-white border-0`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <stat.icon className="h-4 w-4" />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs opacity-80 mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Suivi des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paymentStats.map((stat, index) => (
              <div key={index} className={`flex items-center gap-3 p-4 rounded-lg ${stat.color}`}>
                <stat.icon className="h-8 w-8" />
                <div>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Derniers clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun client enregistré</p>
            ) : (
              <div className="space-y-3">
                {clients.slice(0, 5).map(client => (
                  <div key={client.id} className="p-3 border-b last:border-0">
                    <strong className="text-foreground">{client.name}</strong>
                    <p className="text-sm text-muted-foreground">
                      {client.email} • {client.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Documents récents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun document créé</p>
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 5).map(doc => (
                  <div key={doc.id} className="p-3 border-b last:border-0 flex justify-between items-center">
                    <div>
                      <strong className="text-foreground">{doc.type.toUpperCase()} #{doc.number}</strong>
                      <p className="text-sm text-muted-foreground">
                        {doc.client_name} • {formatCurrency(Number(doc.total))}
                      </p>
                    </div>
                    {doc.type === 'facture' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doc.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        doc.payment_status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.payment_status === 'paid' ? 'Payé' : 
                         doc.payment_status === 'overdue' ? 'En retard' : 'En attente'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
