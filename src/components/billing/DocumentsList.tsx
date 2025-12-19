import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";

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

export function DocumentsList() {
  const [filter, setFilter] = useState<string>('all');
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

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredDocs = filter === 'all' 
    ? documents 
    : documents.filter(d => d.type === filter);

  const devisCount = documents.filter(d => d.type === 'devis').length;
  const commandesCount = documents.filter(d => d.type === 'commande').length;
  const facturesCount = documents.filter(d => d.type === 'facture').length;

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
                  <TableHead className="text-primary-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map(doc => (
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
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
