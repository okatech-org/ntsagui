import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillingDashboard } from "./BillingDashboard";
import { ClientsManager } from "./ClientsManager";
import { ProductsManager } from "./ProductsManager";
import { DocumentCreator } from "./DocumentCreator";
import { DocumentsList } from "./DocumentsList";
import { MinimalInvoice } from "./MinimalInvoice";
import { LayoutDashboard, Users, Package, FileText, ShoppingCart, Receipt, FolderOpen, Sparkles } from "lucide-react";

export function BillingSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div className="text-center py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg">
        <h1 className="text-2xl font-bold">💼 Système de Facturation</h1>
        <p className="text-sm opacity-90">NTSAGUI DIGITAL - Solutions d'Intelligence Artificielle</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 flex-1 min-w-[120px]">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2 flex-1 min-w-[100px]">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Clients</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2 flex-1 min-w-[100px]">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Produits</span>
          </TabsTrigger>
          <TabsTrigger value="devis" className="flex items-center gap-2 flex-1 min-w-[80px]">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Devis</span>
          </TabsTrigger>
          <TabsTrigger value="commande" className="flex items-center gap-2 flex-1 min-w-[100px]">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Commande</span>
          </TabsTrigger>
          <TabsTrigger value="facture" className="flex items-center gap-2 flex-1 min-w-[100px]">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Factures</span>
          </TabsTrigger>
          <TabsTrigger value="facture-minimal" className="flex items-center gap-2 flex-1 min-w-[130px]">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Facture Pro</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 flex-1 min-w-[100px]">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <BillingDashboard />
        </TabsContent>
        <TabsContent value="clients" className="mt-6">
          <ClientsManager />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <ProductsManager />
        </TabsContent>
        <TabsContent value="devis" className="mt-6">
          <DocumentCreator type="devis" />
        </TabsContent>
        <TabsContent value="commande" className="mt-6">
          <DocumentCreator type="commande" />
        </TabsContent>
        <TabsContent value="facture" className="mt-6">
          <DocumentCreator type="facture" />
        </TabsContent>
        <TabsContent value="facture-minimal" className="mt-6">
          <MinimalInvoice />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <DocumentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
