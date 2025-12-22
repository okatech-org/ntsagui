import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Activity,
  Clock,
  RefreshCw,
  Wifi
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface LeadStatisticsRealtimeProps {
  currentColors: {
    bg: string;
    cardBg: string;
    borderColor: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
  };
  isDarkMode: boolean;
}

interface SimpleLead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  created_at: string | null;
}

const STATUS_COLORS = {
  new: "#3b82f6",
  contacted: "#f59e0b",
  qualified: "#8b5cf6",
  converted: "#10b981"
};

export const LeadStatisticsRealtime = ({
  currentColors,
  isDarkMode
}: LeadStatisticsRealtimeProps) => {
  const { t, language } = useLanguage();
  const [leads, setLeads] = useState<SimpleLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const isFrench = language === 'fr';
  const locale = isFrench ? fr : enUS;

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, email, company, status, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedLeads: SimpleLead[] = data.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        status: (lead.status as SimpleLead['status']) || 'new',
        created_at: lead.created_at
      }));
      setLeads(mappedLeads);
      setLastUpdate(new Date());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('leads-realtime-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  // Calculate stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    conversionRate: leads.length > 0 
      ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) 
      : "0"
  };

  // Generate trend data for last 14 days
  const getTrendData = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date()
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayLeads = leads.filter(lead => {
        if (!lead.created_at) return false;
        const leadDate = startOfDay(new Date(lead.created_at));
        return leadDate.getTime() === dayStart.getTime();
      });

      return {
        date: format(day, 'dd/MM', { locale }),
        fullDate: format(day, 'PPP', { locale }),
        total: dayLeads.length,
        new: dayLeads.filter(l => l.status === 'new').length,
        contacted: dayLeads.filter(l => l.status === 'contacted').length,
        qualified: dayLeads.filter(l => l.status === 'qualified').length,
        converted: dayLeads.filter(l => l.status === 'converted').length
      };
    });
  };

  // Status distribution for pie chart
  const getStatusDistribution = () => [
    { name: isFrench ? 'Nouveaux' : 'New', value: stats.new, color: STATUS_COLORS.new },
    { name: isFrench ? 'Contactés' : 'Contacted', value: stats.contacted, color: STATUS_COLORS.contacted },
    { name: isFrench ? 'Qualifiés' : 'Qualified', value: stats.qualified, color: STATUS_COLORS.qualified },
    { name: isFrench ? 'Convertis' : 'Converted', value: stats.converted, color: STATUS_COLORS.converted }
  ].filter(item => item.value > 0);

  // Weekly comparison data
  const getWeeklyComparison = () => {
    const thisWeek = leads.filter(lead => {
      if (!lead.created_at) return false;
      const leadDate = new Date(lead.created_at);
      return leadDate >= subDays(new Date(), 7);
    }).length;

    const lastWeek = leads.filter(lead => {
      if (!lead.created_at) return false;
      const leadDate = new Date(lead.created_at);
      return leadDate >= subDays(new Date(), 14) && leadDate < subDays(new Date(), 7);
    }).length;

    const change = lastWeek > 0 
      ? (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(0) 
      : thisWeek > 0 ? "100" : "0";

    return { thisWeek, lastWeek, change, trend: parseInt(change) >= 0 ? 'up' : 'down' };
  };

  const trendData = getTrendData();
  const statusDistribution = getStatusDistribution();
  const weeklyComparison = getWeeklyComparison();

  const StatCard = ({ icon: Icon, label, value, change, trend, color }: {
    icon: any;
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down';
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border relative overflow-hidden"
      style={{
        background: currentColors.cardBg,
        borderColor: currentColors.borderColor
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: `${color}20` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {change && trend && (
          <div className="flex items-center gap-1 text-xs font-semibold" style={{
            color: trend === 'up' ? '#10B981' : '#EF4444'
          }}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: currentColors.textPrimary }}>
        {value}
      </div>
      <p className="text-xs font-medium" style={{ color: currentColors.textMuted }}>
        {label}
      </p>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-3 rounded-lg border shadow-lg"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <p className="font-semibold mb-2" style={{ color: currentColors.textPrimary }}>
            {payload[0]?.payload?.fullDate || label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin" size={24} style={{ color: currentColors.accent }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: currentColors.textPrimary }}>
            {isFrench ? 'Statistiques en temps réel' : 'Real-time Statistics'}
          </h2>
          <p className="text-sm" style={{ color: currentColors.textMuted }}>
            {isFrench ? 'Dernière mise à jour: ' : 'Last update: '}
            {format(lastUpdate, 'HH:mm:ss', { locale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
          />
          <Wifi size={16} style={{ color: isConnected ? '#10B981' : '#EF4444' }} />
          <span className="text-xs font-medium" style={{ color: currentColors.textMuted }}>
            {isConnected 
              ? (isFrench ? 'Connecté' : 'Connected')
              : (isFrench ? 'Déconnecté' : 'Disconnected')
            }
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={isFrench ? 'Total Leads' : 'Total Leads'}
          value={stats.total}
          change={weeklyComparison.change}
          trend={weeklyComparison.trend as 'up' | 'down'}
          color="#3b82f6"
        />
        <StatCard
          icon={Target}
          label={isFrench ? 'Qualifiés' : 'Qualified'}
          value={stats.qualified}
          color="#8b5cf6"
        />
        <StatCard
          icon={Activity}
          label={isFrench ? 'Taux de conversion' : 'Conversion Rate'}
          value={`${stats.conversionRate}%`}
          color="#10b981"
        />
        <StatCard
          icon={Clock}
          label={isFrench ? 'Cette semaine' : 'This Week'}
          value={weeklyComparison.thisWeek}
          change={weeklyComparison.change}
          trend={weeklyComparison.trend as 'up' | 'down'}
          color="#f59e0b"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart */}
        <div
          className="lg:col-span-2 p-6 rounded-2xl border"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: currentColors.textPrimary }}>
            {isFrench ? 'Tendance des 14 derniers jours' : 'Last 14 Days Trend'}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={currentColors.borderColor} />
              <XAxis 
                dataKey="date" 
                stroke={currentColors.textMuted}
                tick={{ fill: currentColors.textMuted, fontSize: 12 }}
              />
              <YAxis 
                stroke={currentColors.textMuted}
                tick={{ fill: currentColors.textMuted, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                name={isFrench ? 'Total' : 'Total'}
                stroke="#3b82f6"
                fill="url(#colorTotal)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div
          className="p-6 rounded-2xl border"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: currentColors.textPrimary }}>
            {isFrench ? 'Répartition par statut' : 'Status Distribution'}
          </h3>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: currentColors.cardBg,
                    borderColor: currentColors.borderColor,
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p style={{ color: currentColors.textMuted }}>
                {isFrench ? 'Aucune donnée' : 'No data'}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar Chart */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: currentColors.cardBg,
          borderColor: currentColors.borderColor
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: currentColors.textPrimary }}>
          {isFrench ? 'Évolution par statut' : 'Status Evolution'}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={currentColors.borderColor} />
            <XAxis 
              dataKey="date" 
              stroke={currentColors.textMuted}
              tick={{ fill: currentColors.textMuted, fontSize: 12 }}
            />
            <YAxis 
              stroke={currentColors.textMuted}
              tick={{ fill: currentColors.textMuted, fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span style={{ color: currentColors.textSecondary }}>{value}</span>}
            />
            <Bar dataKey="new" name={isFrench ? 'Nouveaux' : 'New'} fill={STATUS_COLORS.new} radius={[4, 4, 0, 0]} />
            <Bar dataKey="contacted" name={isFrench ? 'Contactés' : 'Contacted'} fill={STATUS_COLORS.contacted} radius={[4, 4, 0, 0]} />
            <Bar dataKey="qualified" name={isFrench ? 'Qualifiés' : 'Qualified'} fill={STATUS_COLORS.qualified} radius={[4, 4, 0, 0]} />
            <Bar dataKey="converted" name={isFrench ? 'Convertis' : 'Converted'} fill={STATUS_COLORS.converted} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LeadStatisticsRealtime;
