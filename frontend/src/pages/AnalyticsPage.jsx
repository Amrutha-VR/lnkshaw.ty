import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MousePointerClick, Globe, Smartphone, Monitor,
  Tablet, Clock, TrendingUp, Share2, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useUrlAnalytics } from '../hooks/index.js';
import { formatDistanceToNow, format } from 'date-fns';

const COLORS = ['#f59e0b', '#ec4899', '#10b981', '#6366f1', '#f97316'];

const StatCard = ({ icon: Icon, label, value, sub, color = 'gold' }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
        ${color === 'gold' ? 'bg-gold-100' : color === 'pink' ? 'bg-blush-100' : 'bg-emerald-100'}`}>
        <Icon className={`w-5 h-5 ${color === 'gold' ? 'text-gold-600' : color === 'pink' ? 'text-blush-500' : 'text-emerald-500'}`} />
      </div>
    </div>
    <p className="font-display text-3xl font-bold text-charcoal">{value}</p>
    <p className="text-sm font-medium text-charcoal/70 mt-1">{label}</p>
    {sub && <p className="text-xs text-charcoal/40 mt-0.5">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gold-200 rounded-2xl p-3 shadow-gold text-sm">
      <p className="font-semibold text-charcoal mb-1">{label}</p>
      <p className="text-gold-600">{payload[0].value} clicks</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const { shortCode } = useParams();
  const { data, isLoading, error } = useUrlAnalytics(shortCode);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="skeleton h-8 w-32 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-3xl" />)}
        </div>
        <div className="skeleton h-64 rounded-3xl mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skeleton h-64 rounded-3xl" />
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-blush-500 mb-4">{error}</p>
        <Link to="/dashboard" className="btn-secondary">← Back to dashboard</Link>
      </div>
    );
  }

  const { url, analytics } = data || {};
  const appUrl = import.meta.env.VITE_APP_URL || '';

  const deviceIcon = (type) => ({
    mobile: Smartphone, tablet: Tablet, desktop: Monitor
  }[type] || Monitor);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold text-charcoal flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-gold-500" />
            Analytics
          </h1>
          {url && (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm font-bold text-gold-700">
                {appUrl}/{url.shortCode}
              </span>
              <span className="text-charcoal/30">→</span>
              <span className="text-xs text-charcoal/50 truncate max-w-xs">{url.originalUrl}</span>
            </div>
          )}
        </div>

        {/* Public analytics link */}
        <a href={`/analytics/public/${shortCode}`} target="_blank" rel="noreferrer"
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5">
          <Share2 className="w-4 h-4" /> Public page
        </a>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MousePointerClick} label="Total Clicks" value={analytics?.totalClicks ?? 0} color="gold" />
        <StatCard icon={TrendingUp} label="Last 30 days"
          value={analytics?.dailyClicks?.reduce((a, d) => a + d.count, 0) ?? 0} color="pink" />
        <StatCard icon={Clock} label="Last visited"
          value={url?.lastVisitedAt
            ? formatDistanceToNow(new Date(url.lastVisitedAt), { addSuffix: true })
            : 'Never'}
          color="green" />
        <StatCard icon={Globe} label="Countries"
          value={analytics?.countryBreakdown?.length ?? 0} color="gold" />
      </div>

      {/* Daily clicks chart */}
      <div className="card p-6 mb-6">
        <h2 className="font-display font-semibold text-lg text-charcoal mb-4">
          Daily clicks (last 30 days)
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={analytics?.dailyClicks || []}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" strokeOpacity={0.5} />
            <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'MMM d')}
              tick={{ fontSize: 11, fill: '#1a1625', opacity: 0.5 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#1a1625', opacity: 0.5 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2.5}
              fill="url(#goldGrad)" dot={false} activeDot={{ r: 5, fill: '#f59e0b' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Device + Browser breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Device pie chart */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Devices</h2>
          {analytics?.deviceBreakdown?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={analytics.deviceBreakdown} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={50}
                    paddingAngle={3} label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`}>
                    {analytics.deviceBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {analytics.deviceBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="capitalize text-charcoal/70">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-center text-charcoal/40 py-12">No data yet</p>}
        </div>

        {/* Browser bar chart */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Browsers</h2>
          {analytics?.browserBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.browserBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" strokeOpacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" radius={[0, 8, 8, 0]}>
                  {analytics.browserBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-charcoal/40 py-12">No data yet</p>}
        </div>
      </div>

      {/* Country breakdown */}
      <div className="card p-6 mb-6">
        <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Top Countries</h2>
        {analytics?.countryBreakdown?.length > 0 ? (
          <div className="space-y-3">
            {analytics.countryBreakdown.map((c, i) => {
              const max = analytics.countryBreakdown[0]?.count || 1;
              const pct = Math.round((c.count / max) * 100);
              return (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-sm w-6 text-charcoal/40 font-mono">{i + 1}</span>
                  <span className="text-sm font-medium text-charcoal w-24">{c.country}</span>
                  <div className="flex-1 bg-gold-50 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-gold-pink"
                      style={{ width: `${pct}%`, transition: 'width 1s ease-out' }} />
                  </div>
                  <span className="text-sm text-charcoal/60 w-16 text-right">{c.count} clicks</span>
                </div>
              );
            })}
          </div>
        ) : <p className="text-center text-charcoal/40 py-8">No location data yet</p>}
      </div>

      {/* Recent visits */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Recent visits</h2>
        {analytics?.recentVisits?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-100">
                  {['Time', 'Country', 'Device', 'Browser', 'Referrer'].map((h) => (
                    <th key={h} className="text-left pb-3 text-xs font-semibold text-charcoal/50 uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-50">
                {analytics.recentVisits.map((v, i) => (
                  <tr key={i} className="hover:bg-gold-50/50 transition-colors">
                    <td className="py-2.5 pr-4 text-charcoal/60 whitespace-nowrap">
                      {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                    </td>
                    <td className="py-2.5 pr-4 font-medium">{v.country}</td>
                    <td className="py-2.5 pr-4 capitalize">{v.deviceType}</td>
                    <td className="py-2.5 pr-4">{v.browser}</td>
                    <td className="py-2.5 text-charcoal/50 truncate max-w-[120px]">{v.referrer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-center text-charcoal/40 py-8">No visits recorded yet</p>}
      </div>
    </div>
  );
}
