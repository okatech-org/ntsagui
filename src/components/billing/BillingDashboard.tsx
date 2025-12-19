import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Package, FileText, DollarSign } from "lucide-react";

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
      title: "Documents", 
      value: documents.length, 
      subtitle: `${devis.length} devis, ${commandes.length} commandes, ${factures.length} factures`,
      icon: FileText,
      gradient: "from-rose-500 to-rose-400"
    },
    { 
      title: "Chiffre d'affaires", 
      value: formatCurrency(totalFactures), 
      subtitle: "Total des factures",
      icon: DollarSign,
      gradient: "from-violet-500 to-violet-400"
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
                  <div key={doc.id} className="p-3 border-b last:border-0">
                    <strong className="text-foreground">{doc.type.toUpperCase()} #{doc.number}</strong>
                    <p className="text-sm text-muted-foreground">
                      {doc.client_name} • {formatCurrency(Number(doc.total))} • {new Date(doc.date).toLocaleDateString('fr-FR')}
                    </p>
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
