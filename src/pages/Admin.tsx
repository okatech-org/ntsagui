import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  FileText,
  Trash2,
  Eye,
  Mail,
  FileJson,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Activity,
  Calendar,
  LogOut,
  Search,
  Filter,
  MoreVertical,
  Bell,
  Settings,
  Receipt
} from "lucide-react";
import leadStorage, { Lead } from "@/lib/leadStorage";
import pdfGenerator from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabaseAuth } from "@/lib/supabaseAuth";
import { useNavigate } from "react-router-dom";
import { initializeDemoData } from "@/lib/demoData";
import LeadManagementAdvanced from "@/components/LeadManagementAdvanced";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import SettingsPanel from "@/components/SettingsPanel";
import AdminDropdown from "@/components/AdminDropdown";
import UserManagement from "@/components/UserManagement";
import { BillingSystem } from "@/components/billing/BillingSystem";
import { useLanguage } from "@/contexts/LanguageContext";

const Admin = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "users" | "billing" | "analytics" | "settings">("overview");

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    // Initialiser les données de démo si aucun lead existe
    const demoLeads = initializeDemoData();
    const allLeads = await leadStorage.getAllLeads();
    setLeads(allLeads.length > 0 ? allLeads : demoLeads);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteLead = async (id: string) => {
    if (window.confirm(t('admin.leadManagement.deleteConfirm'))) {
      await leadStorage.deleteLead(id);
      await loadLeads();
      toast.success(t('admin.leadManagement.leadDeleted'));
    }
  };

  const handleDownloadPDF = (lead: Lead) => {
    pdfGenerator.generateReportPDF(lead);
    toast.success(t('admin.leadManagement.pdfGenerated'));
  };

  const handleDownloadJSON = (lead: Lead) => {
    pdfGenerator.downloadAsJSON(lead);
    toast.success(t('admin.leadManagement.jsonDownloaded'));
  };

  const handleExportCSV = () => {
    pdfGenerator.downloadAsCSV(filteredLeads);
    toast.success(t('admin.leadManagement.csvExported'));
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await leadStorage.updateLead(id, { status: newStatus as any });
    await loadLeads();
    toast.success(t('admin.leadManagement.statusUpdated'));
  };

  const handleLogout = async () => {
    await supabaseAuth.signOut();
    toast.success(t('admin.settings.logoutConfirm'));
    navigate("/admin-login");
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    avgScore: leads.length > 0 ? (leads.reduce((sum, l) => sum + l.fitScore, 0) / leads.length).toFixed(1) : 0,
  };

  // Bleu professionnel - couleurs corporate
  const currentColors = isDarkMode
    ? {
      bg: '#0a1628',           // Bleu très sombre
      cardBg: '#0f1f35',       // Bleu sombre
      headerBg: '#0d1a2d',     // Bleu header
      hoverBg: '#142942',      // Bleu hover
      borderColor: '#1e3a5f',  // Bleu bordure
      textPrimary: '#f0f6ff',  // Blanc bleuté
      textSecondary: '#94a8c4', // Gris bleuté
      textMuted: '#5a7394',    // Gris bleu moyen
      accent: '#3b82f6',       // Bleu accent
    }
    : {
      bg: '#f8fafc',           // Gris bleuté très clair
      cardBg: '#ffffff',       // Blanc pur
      headerBg: '#ffffff',     // Blanc
      hoverBg: '#f1f5f9',      // Gris bleuté clair
      borderColor: '#e2e8f0',  // Gris bleuté bordure
      textPrimary: '#0f172a',  // Bleu très sombre
      textSecondary: '#475569', // Gris bleuté
      textMuted: '#94a3b8',    // Gris bleu clair
      accent: '#2563eb',       // Bleu accent
    };

  return (
    <div style={{
      background: currentColors.bg,
      minHeight: '100vh',
      transition: 'all 0.3s ease',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* SIDEBAR */}
      <div
        className="fixed left-0 top-0 h-full w-64 z-40 border-r"
        style={{
          background: currentColors.headerBg,
          borderColor: currentColors.borderColor
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}
            >
              <span className="font-bold text-white">N</span>
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ color: currentColors.textPrimary }}>
                NTSAGUI Digital
              </h1>
              <p className="text-xs" style={{ color: currentColors.textMuted }}>
                {t('admin.adminDashboard')}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview' as const, icon: Activity, label: t('admin.menu.overview'), count: null },
              { id: 'leads' as const, icon: Target, label: t('admin.menu.leads'), count: stats.total },
              { id: 'users' as const, icon: Users, label: 'Utilisateurs', count: null },
              { id: 'billing' as const, icon: Receipt, label: 'Facturation', count: null },
              { id: 'analytics' as const, icon: TrendingUp, label: t('admin.menu.analytics'), count: null },
              { id: 'settings' as const, icon: Settings, label: t('admin.menu.settings'), count: null },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all hover:bg-opacity-10"
                style={{
                  background: activeTab === item.id ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                  color: activeTab === item.id ? '#3b82f6' : currentColors.textSecondary
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.background = currentColors.hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.count !== null && (
                  <div
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: 'rgba(37, 99, 235, 0.2)',
                      color: '#3b82f6'
                    }}
                  >
                    {item.count}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-lg"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ml-64">
        {/* HEADER */}
        <div
          className="sticky top-0 z-30 backdrop-blur-lg border-b px-6 py-4"
          style={{
            background: currentColors.headerBg + 'CC',
            borderColor: currentColors.borderColor
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: currentColors.textPrimary }}>
                {t('admin.menu.overview')}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={16} style={{ color: currentColors.textMuted }} />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-sm bg-transparent border-0 outline-0"
                  style={{ color: currentColors.textSecondary }}
                >
                  <option value="week">{t('admin.analytics.periods.week')}</option>
                  <option value="month">{t('admin.analytics.periods.month')}</option>
                  <option value="quarter">{t('admin.analytics.periods.quarter')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell size={18} />
              </Button>
              <AdminDropdown
                isDarkMode={isDarkMode}
                currentColors={currentColors}
                onSettingsClick={() => setActiveTab('settings')}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    icon: Target,
                    label: "Total Leads",
                    value: stats.total.toString(),
                    change: "+12%",
                    trend: "up",
                    color: "#3b82f6"
                  },
                  {
                    icon: Target,
                    label: t('admin.leadManagement.qualified'),
                    value: stats.qualified.toString(),
                    change: "+8%",
                    trend: "up",
                    color: "#10B981"
                  },
                  {
                    icon: TrendingUp,
                    label: t('admin.analytics.conversionRate'),
                    value: stats.total > 0 ? `${((stats.converted / stats.total) * 100).toFixed(1)}%` : "0%",
                    change: "+5%",
                    trend: "up",
                    color: "#8B5CF6"
                  },
                  {
                    icon: Activity,
                    label: t('admin.analytics.avgScore'),
                    value: `${stats.avgScore}/100`,
                    change: parseFloat(stats.avgScore as string) >= 70 ? "+3%" : "-2%",
                    trend: parseFloat(stats.avgScore as string) >= 70 ? "up" : "down",
                    color: parseFloat(stats.avgScore as string) >= 70 ? "#10B981" : "#F59E0B"
                  }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-2xl border"
                    style={{
                      background: currentColors.cardBg,
                      borderColor: currentColors.borderColor
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="p-3 rounded-xl"
                        style={{ background: stat.color + '20' }}
                      >
                        <stat.icon size={24} style={{ color: stat.color }} />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold" style={{
                        color: stat.trend === 'up' ? '#10B981' : '#EF4444'
                      }}>
                        {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1" style={{ color: currentColors.textPrimary }}>
                      {stat.value}
                    </div>
                    <p className="text-sm font-medium" style={{ color: currentColors.textMuted }}>
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* LEADS MANAGEMENT */}
              <div
                className="rounded-2xl border p-6"
                style={{
                  background: currentColors.cardBg,
                  borderColor: currentColors.borderColor
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: currentColors.textPrimary }}>
                      {t('admin.leadManagement.title')}
                    </h2>
                    <p className="text-sm" style={{ color: currentColors.textMuted }}>
                      {filteredLeads.length} {t('admin.leadManagement.found')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleExportCSV}
                      disabled={filteredLeads.length === 0}
                      className="rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('admin.leadManagement.export')}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: currentColors.textMuted }} />
                    <input
                      placeholder={t('admin.leadManagement.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border font-medium"
                      style={{
                        background: currentColors.bg,
                        borderColor: currentColors.borderColor,
                        color: currentColors.textPrimary
                      }}
                    />
                  </div>
                  <div className="relative">
                    <Filter size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: currentColors.textMuted }} />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-12 pr-8 py-3 rounded-xl border font-medium"
                      style={{
                        background: currentColors.bg,
                        borderColor: currentColors.borderColor,
                        color: currentColors.textPrimary
                      }}
                    >
                      <option value="all">{t('admin.leadManagement.allStatus')}</option>
                      <option value="new">{t('admin.leadManagement.new')}</option>
                      <option value="contacted">{t('admin.leadManagement.contacted')}</option>
                      <option value="qualified">{t('admin.leadManagement.qualified')}</option>
                      <option value="converted">{t('admin.leadManagement.converted')}</option>
                    </select>
                  </div>
                </div>

                {/* LEADS TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${currentColors.borderColor}` }}>
                        <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                          {t('admin.leadManagement.columns.lead')}
                        </th>
                        <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                          {t('admin.leadManagement.columns.company')}
                        </th>
                        <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                          {t('admin.leadManagement.columns.score')}
                        </th>
                        <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                          {t('admin.leadManagement.columns.status')}
                        </th>
                        <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                          {t('admin.leadManagement.columns.date')}
                        </th>
                        <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                          {t('admin.leadManagement.columns.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center gap-4">
                              <Users size={48} className="opacity-20" style={{ color: currentColors.textMuted }} />
                              <div>
                                <p className="font-medium mb-1" style={{ color: currentColors.textMuted }}>
                                  {t('admin.leadManagement.noLeads')}
                                </p>
                                <p className="text-xs" style={{ color: currentColors.textMuted }}>
                                  {searchTerm || filterStatus !== 'all'
                                    ? t('admin.leadManagement.tryFilters')
                                    : t('admin.leadManagement.newLeadsAuto')
                                  }
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead, idx) => (
                          <motion.tr
                            key={lead.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="transition-all duration-200 cursor-pointer"
                            style={{ borderBottom: `1px solid ${currentColors.borderColor}` }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = currentColors.hoverBg;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                                  style={{
                                    background: `linear-gradient(135deg, #00D9FF, #8B5CF6)`,
                                    color: '#FFFFFF'
                                  }}
                                >
                                  {lead.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: currentColors.textPrimary }}>
                                    {lead.name}
                                  </p>
                                  <p className="text-xs" style={{ color: currentColors.textMuted }}>
                                    {lead.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-sm" style={{ color: currentColors.textSecondary }}>
                                {lead.company}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                                  style={{
                                    background: lead.fitScore >= 80 ? '#10B981' : lead.fitScore >= 60 ? '#F59E0B' : '#EF4444',
                                    color: '#FFFFFF'
                                  }}
                                >
                                  {lead.fitScore}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <select
                                value={lead.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(lead.id, e.target.value);
                                }}
                                className="px-3 py-1 rounded-full text-xs font-bold border-0"
                                style={{
                                  background: lead.status === 'new' ? '#00D9FF20' :
                                    lead.status === 'contacted' ? '#F59E0B20' :
                                      lead.status === 'qualified' ? '#10B98120' :
                                        '#8B5CF620',
                                  color: lead.status === 'new' ? '#00D9FF' :
                                    lead.status === 'contacted' ? '#F59E0B' :
                                      lead.status === 'qualified' ? '#10B981' :
                                        '#8B5CF6'
                                }}
                              >
                                <option value="new">{t('admin.leadManagement.new')}</option>
                                <option value="contacted">{t('admin.leadManagement.contacted')}</option>
                                <option value="qualified">{t('admin.leadManagement.qualified')}</option>
                                <option value="converted">{t('admin.leadManagement.converted')}</option>
                              </select>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm" style={{ color: currentColors.textMuted }}>
                                {new Date(lead.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'ar' ? 'ar-SA' : 'fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF(lead);
                                  }}
                                  className="rounded-lg"
                                  title="Télécharger PDF"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLead(lead.id);
                                  }}
                                  className="text-red-400 hover:text-red-300 rounded-lg"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* LEAD DETAIL MODAL */}
          {selectedLead && activeTab === 'overview' && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedLead(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border"
                style={{
                  background: currentColors.cardBg,
                  borderColor: currentColors.borderColor
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 p-6 border-b" style={{
                  background: currentColors.headerBg,
                  borderColor: currentColors.borderColor
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: currentColors.textPrimary }}>
                        {selectedLead.name}
                      </h2>
                      <p className="text-sm" style={{ color: currentColors.textMuted }}>
                        {selectedLead.company} • Score: {selectedLead.fitScore}/100
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedLead(null)}
                      className="rounded-xl"
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div
                      className="p-6 rounded-xl border"
                      style={{
                        background: currentColors.bg,
                        borderColor: currentColors.borderColor
                      }}
                    >
                      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: currentColors.textPrimary }}>
                        <Users size={18} />
                        {t('admin.settings.profileInfo')}
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: t('admin.settings.fullName'), value: selectedLead.name },
                          { label: t('admin.email'), value: selectedLead.email },
                          { label: t('admin.leadManagement.columns.company'), value: selectedLead.company },
                          { label: t('contact.phone'), value: selectedLead.phone || 'Non fourni' },
                          { label: t('admin.leadManagement.columns.score'), value: `${selectedLead.fitScore}/100` }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium" style={{ color: currentColors.textMuted }}>
                              {item.label}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: currentColors.textPrimary }}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className="p-6 rounded-xl border"
                      style={{
                        background: currentColors.bg,
                        borderColor: currentColors.borderColor
                      }}
                    >
                      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: currentColors.textPrimary }}>
                        <FileText size={18} />
                        {t('admin.leadManagement.pdfGenerated')}
                      </h3>
                      <div
                        className="p-4 rounded-xl text-sm max-h-48 overflow-y-auto"
                        style={{
                          background: isDarkMode ? '#1A1A1A' : '#F8F9FA',
                          color: currentColors.textSecondary,
                          lineHeight: '1.6'
                        }}
                      >
                        {selectedLead.report}
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      background: currentColors.bg,
                      borderColor: currentColors.borderColor
                    }}
                  >
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: currentColors.textPrimary }}>
                      <Mail size={18} />
                      {t('admin.settings.history')}
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedLead.conversation.map((msg, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border-l-4"
                          style={{
                            background: msg.role === 'user'
                              ? isDarkMode ? '#00D9FF10' : '#E0F2FE'
                              : isDarkMode ? '#8B5CF610' : '#F3E8FF',
                            borderLeftColor: msg.role === 'user' ? '#00D9FF' : '#8B5CF6'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                background: msg.role === 'user' ? '#00D9FF' : '#8B5CF6',
                                color: '#FFFFFF'
                              }}
                            >
                              {msg.role === 'user' ? 'P' : 'AI'}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide" style={{
                              color: msg.role === 'user' ? '#00D9FF' : '#8B5CF6'
                            }}>
                              {msg.role === 'user' ? 'Prospect' : 'Assistant IA'}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: currentColors.textPrimary }}>
                            {msg.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* LEADS MANAGEMENT TAB */}
          {activeTab === 'leads' && (
            <LeadManagementAdvanced
              leads={leads}
              onLeadsUpdate={(updatedLeads) => setLeads(updatedLeads)}
              currentColors={currentColors}
              isDarkMode={isDarkMode}
            />
          )}

          {/* USERS MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <UserManagement
              currentColors={currentColors}
              isDarkMode={isDarkMode}
            />
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <BillingSystem />
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              leads={leads}
              currentColors={currentColors}
              isDarkMode={isDarkMode}
            />
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <SettingsPanel
              isDarkMode={isDarkMode}
              onLogout={handleLogout}
              currentColors={currentColors}
            />
          )}
        </div>
      </div >
    </div >
  );
};

export default Admin;