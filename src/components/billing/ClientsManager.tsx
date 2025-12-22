import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";

interface ClientFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  rccm: string;
  nif: string;
  contact_name: string;
  tax_exempt: boolean;
}

const initialFormData: ClientFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Gabon',
  rccm: '',
  nif: '',
  contact_name: '',
  tax_exempt: false
};

export function ClientsManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const { error } = await supabase.from('billing_clients').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-clients'] });
      toast.success("Client ajouté avec succès");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de l'ajout du client")
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientFormData }) => {
      const { error } = await supabase.from('billing_clients').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-clients'] });
      toast.success("Client mis à jour");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la mise à jour")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('billing_clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-clients'] });
      toast.success("Client supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (client: any) => {
    setFormData({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || 'Gabon',
      rccm: client.rccm || '',
      nif: client.nif || '',
      contact_name: client.contact_name || '',
      tax_exempt: client.tax_exempt || false
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Gestion des clients</h2>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? <><X className="h-4 w-4 mr-2" /> Annuler</> : <><Plus className="h-4 w-4 mr-2" /> Nouveau client</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier le client' : 'Nouveau client'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Raison sociale / Nom *</Label>
                  <Input
                    required
                    placeholder="Centre Gabonais de l'Innovation (CGI)"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>RCCM</Label>
                  <Input
                    placeholder="GA-LBV-01-2024-B17-00045"
                    value={formData.rccm}
                    onChange={e => setFormData({ ...formData, rccm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIF</Label>
                  <Input
                    placeholder="2024 0101 4129 E"
                    value={formData.nif}
                    onChange={e => setFormData({ ...formData, nif: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact (Personne)</Label>
                  <Input
                    placeholder="Landry Stéphane ZENG EYIDANGA"
                    value={formData.contact_name}
                    onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    placeholder="contact@cgi.ga"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    placeholder="+241 XX XX XX XX"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Adresse</Label>
                  <Input
                    placeholder="Quartier, BP..."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    placeholder="Libreville"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="tax_exempt"
                    checked={formData.tax_exempt}
                    onCheckedChange={checked => setFormData({ ...formData, tax_exempt: checked })}
                  />
                  <Label htmlFor="tax_exempt" className="cursor-pointer">Exonéré de TVA</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Mettre à jour' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Aucun client enregistré</p>
            <p className="text-sm mt-2">Ajoutez votre premier client</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary text-primary-foreground">
                  <TableHead className="text-primary-foreground">Raison sociale</TableHead>
                  <TableHead className="text-primary-foreground">RCCM</TableHead>
                  <TableHead className="text-primary-foreground">NIF</TableHead>
                  <TableHead className="text-primary-foreground">Contact</TableHead>
                  <TableHead className="text-primary-foreground">Email</TableHead>
                  <TableHead className="text-primary-foreground">TVA</TableHead>
                  <TableHead className="text-primary-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-xs font-mono">{(client as any).rccm || '-'}</TableCell>
                    <TableCell className="text-xs font-mono">{(client as any).nif || '-'}</TableCell>
                    <TableCell className="text-sm">{(client as any).contact_name || '-'}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${(client as any).tax_exempt ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {(client as any).tax_exempt ? 'Exonéré' : '18%'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id)}>
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
