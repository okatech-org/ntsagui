import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalyticsDashboardProps {
  leads: any[];
  currentColors: any;
  isDarkMode: boolean;
}

export const AnalyticsDashboard = ({
  leads,
  currentColors,
  isDarkMode
}: AnalyticsDashboardProps) => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const stats = {
    total: leads.length,
    converted: leads.filter(l => l.status === 'converted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    avgScore: leads.length > 0 ? (leads.reduce((sum, l) => sum + l.fitScore, 0) / leads.length).toFixed(1) : 0,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0,
    avgQualificationTime: 4.2,
    responseTime: 2.5
  };

  const trends = {
    week: { total: 12, converted: 2, trend: 'up' },
    month: { total: 48, converted: 8, trend: 'up' },
    quarter: { total: 145, converted: 24, trend: 'up' }
  };

  const currentTrend = trends[selectedPeriod];

  const renderSimpleLineChart = () => {
    const data = [20, 45, 30, 60, 55, 75, 80, 65, 90, 85, 95, 100];
    const max = Math.max(...data);
    const height = 150;
    const width = 500;
    const pointSpacing = width / (data.length - 1);

    const points = data.map((val, idx) => ({
      x: idx * pointSpacing,
      y: height - (val / max) * height
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg width="100%" height="200" viewBox={`0 0 ${width} 200`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${pathD} L ${width} 150 L 0 150 Z`} fill="url(#gradient)" />
        <path d={pathD} stroke="#00D9FF" strokeWidth="2" fill="none" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00D9FF" />
        ))}
      </svg>
    );
  };

  const KPICard = ({ icon: Icon, label, value, change, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6"
      style={{
        background: currentColors.cardBg,
        borderColor: currentColors.borderColor
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-3 rounded-xl"
          style={{ background: '#00D9FF20' }}
        >
          <Icon size={24} style={{ color: '#00D9FF' }} />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold" style={{
          color: trend === 'up' ? '#10B981' : '#EF4444'
        }}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </div>
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: currentColors.textMuted }}>
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color: currentColors.textPrimary }}>
        {value}
      </p>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex gap-3 justify-center">
        {(['week', 'month', 'quarter'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className="px-6 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: selectedPeriod === period ? '#00D9FF' : currentColors.cardBg,
              color: selectedPeriod === period ? '#000' : currentColors.textPrimary,
              border: `1px solid ${selectedPeriod === period ? '#00D9FF' : currentColors.borderColor}`
            }}
          >
            {period === 'week' ? t('admin.analytics.periods.week') : period === 'month' ? t('admin.analytics.periods.month') : t('admin.analytics.periods.quarter')}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={Activity}
          label={t('admin.analytics.totalConversions')}
          value={stats.converted}
          change="+12%"
          trend="up"
        />
        <KPICard
          icon={Target}
          label={t('admin.analytics.conversionRate')}
          value={`${stats.conversionRate}%`}
          change="+8%"
          trend="up"
        />
        <KPICard
          icon={Clock}
          label={t('admin.analytics.avgQualificationTime')}
          value={`${stats.avgQualificationTime}j`}
          change="-15%"
          trend="up"
        />
        <KPICard
          icon={Zap}
          label={t('admin.analytics.responseTime')}
          value={`${stats.responseTime}h`}
          change="-20%"
          trend="up"
        />
      </div>

      {/* Conversion Trend Chart */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: currentColors.cardBg,
          borderColor: currentColors.borderColor
        }}
      >
        <h3 className="text-xl font-bold mb-6" style={{ color: currentColors.textPrimary }}>
          {t('admin.analytics.conversionTrend')} ({selectedPeriod === 'week' ? t('admin.analytics.periods.week') : selectedPeriod === 'month' ? t('admin.analytics.periods.month') : t('admin.analytics.periods.quarter')})
        </h3>
        <div className="mb-4">
          {renderSimpleLineChart()}
        </div>
        <div className="grid grid-cols-2 gap-4 pt-6 border-t" style={{ borderColor: currentColors.borderColor }}>
          <div>
            <p className="text-sm" style={{ color: currentColors.textMuted }}>{t('admin.analytics.leadsGenerated')}</p>
            <p className="text-2xl font-bold mt-2" style={{ color: currentColors.textPrimary }}>
              {currentTrend.total}
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: currentColors.textMuted }}>{t('admin.leadManagement.converted')}</p>
            <p className="text-2xl font-bold mt-2" style={{ color: '#10B981' }}>
              {currentTrend.converted}
            </p>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Status */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <h3 className="text-xl font-bold mb-6" style={{ color: currentColors.textPrimary }}>
            {t('admin.analytics.statusDistribution')}
          </h3>
          <div className="space-y-4">
            {[
              { label: t('admin.leadManagement.new'), value: stats.total - stats.contacted - stats.qualified - stats.converted, color: '#00D9FF', bg: '#00D9FF20' },
              { label: t('admin.leadManagement.contacted'), value: stats.contacted, color: '#F59E0B', bg: '#F59E0B20' },
              { label: t('admin.leadManagement.qualified'), value: stats.qualified, color: '#8B5CF6', bg: '#8B5CF620' },
              { label: t('admin.leadManagement.converted'), value: stats.converted, color: '#10B981', bg: '#10B98120' }
            ].map((item, idx) => {
              const percentage = stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(1) : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: currentColors.textPrimary }} className="font-semibold">
                      {item.label}
                    </span>
                    <span style={{ color: item.color }} className="font-bold">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: currentColors.bg }}
                  >
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Quality Score */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <h3 className="text-xl font-bold mb-6" style={{ color: currentColors.textPrimary }}>
            {t('admin.analytics.scoreDistribution')}
          </h3>
          <div className="space-y-4">
            {[
              { label: `${t('admin.analytics.scoreExcellent')} (80-100)`, value: leads.filter(l => l.fitScore >= 80).length, color: '#10B981' },
              { label: `${t('admin.analytics.scoreGood')} (60-79)`, value: leads.filter(l => l.fitScore >= 60 && l.fitScore < 80).length, color: '#F59E0B' },
              { label: `${t('admin.analytics.scoreLow')} (<60)`, value: leads.filter(l => l.fitScore < 60).length, color: '#EF4444' }
            ].map((item, idx) => {
              const percentage = stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(1) : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: currentColors.textPrimary }} className="font-semibold">
                      {item.label}
                    </span>
                    <span style={{ color: item.color }} className="font-bold">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: currentColors.bg }}
                  >
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: currentColors.cardBg,
          borderColor: currentColors.borderColor
        }}
      >
        <h3 className="text-xl font-bold mb-4" style={{ color: currentColors.textPrimary }}>
          {t('admin.analytics.performanceInsights')}
        </h3>
        <div className="space-y-3">
          {[
            { icon: AlertCircle, text: `${t('admin.analytics.avgScore')}: ${stats.avgScore}/100` },
            { icon: TrendingUp, text: `${t('admin.analytics.conversionRate')}: ${stats.conversionRate}%` },
            { icon: Activity, text: `${stats.qualified} ${t('admin.analytics.qualifiedLeadsPeriod')}` },
            { icon: Zap, text: `${stats.converted} ${t('admin.analytics.conversionsMade')}` }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: currentColors.bg }}>
              <item.icon size={20} style={{ color: '#00D9FF' }} />
              <span style={{ color: currentColors.textPrimary }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
