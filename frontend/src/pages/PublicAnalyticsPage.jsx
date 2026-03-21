/**
 * PublicAnalyticsPage
 * Shareable, no-auth analytics view for any short link
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { analyticsService } from '../services/urlService.js';
import { MousePointerClick, Globe, Link2, BarChart3, Smartphone, Monitor, Tablet } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#f59e0b', '#ec4899', '#10b981', '#6366f1', '#f97316'];

export default function PublicAnalyticsPage() {
  const { shortCode }         = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    analyticsService.getPublicAnalytics(shortCode)
      .then((res) => setData(res.data.data))
      .catch(() => setError('Analytics not found for this link.'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold-pink animate-pulse-gold" />
          <p className="text-charcoal/50 text-sm animate-pulse">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-charcoal/60 text-lg">{error}</p>
        <Link to="/" className="btn-primary">← Back home</Link>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gold-200 rounded-xl p-2.5 shadow-gold text-xs">
        <p className="font-semibold text-charcoal">{label}</p>
        <p className="text-gold-600 mt-0.5">{payload[0].value} clicks</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-white border-b border-gold-100 px-6 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gold-pink flex items-center justify-center">
            <Link2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-charcoal">LinkSnap</span>
        </Link>
        <span className="text-charcoal/20">·</span>
        <div className="flex items-center gap-1.5 text-sm text-charcoal/60">
          <BarChart3 className="w-3.5 h-3.5" />
          Public Analytics
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 text-gold-700 text-xs font-semibold mb-4">
            <BarChart3 className="w-3.5 h-3.5" /> Link Statistics
          </div>
          <h1 className="font-display text-4xl font-bold text-charcoal mb-2">
            <span className="gradient-text">/{data?.shortCode}</span>
          </h1>
          <p className="text-charcoal/50 text-sm">
            Created {data?.createdAt ? format(new Date(data.createdAt), 'MMMM d, yyyy') : '—'}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-6 text-center">
            <MousePointerClick className="w-7 h-7 text-gold-500 mx-auto mb-2" />
            <p className="font-display text-4xl font-bold text-charcoal">
              {data?.totalClicks?.toLocaleString() ?? 0}
            </p>
            <p className="text-sm text-charcoal/60 mt-1">Total Clicks</p>
          </div>
          <div className="card p-6 text-center">
            <Globe className="w-7 h-7 text-blush-500 mx-auto mb-2" />
            <p className="font-display text-4xl font-bold text-charcoal">
              {data?.countryBreakdown?.length ?? 0}
            </p>
            <p className="text-sm text-charcoal/60 mt-1">Countries</p>
          </div>
        </div>

        {/* Daily clicks chart */}
        <div className="card p-6 mb-6">
          <h3 className="font-display font-semibold text-lg text-charcoal mb-4">
            Clicks — last 30 days
          </h3>
          {data?.dailyClicks?.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.dailyClicks}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" strokeOpacity={0.4} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(new Date(d + 'T00:00:00'), 'MMM d')}
                  tick={{ fontSize: 10, fill: '#1a1625', opacity: 0.5 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#1a1625', opacity: 0.5 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="count"
                  stroke="#f59e0b" strokeWidth={2.5}
                  fill="url(#goldGrad)" dot={false}
                  activeDot={{ r: 4, fill: '#f59e0b' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-charcoal/30 text-sm">
              No click data yet
            </div>
          )}
        </div>

        {/* Device breakdown */}
        {data?.deviceBreakdown?.length > 0 && (
          <div className="card p-6 mb-6">
            <h3 className="font-display font-semibold text-lg text-charcoal mb-4">Devices</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={data.deviceBreakdown}
                    dataKey="value" nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={70} innerRadius={45}
                    paddingAngle={3}
                  >
                    {data.deviceBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {data.deviceBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-sm capitalize text-charcoal/70">{d.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-charcoal">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Country breakdown */}
        {data?.countryBreakdown?.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="font-display font-semibold text-lg text-charcoal mb-4">Top Countries</h3>
            <div className="space-y-3">
              {data.countryBreakdown.map((c, i) => {
                const max = data.countryBreakdown[0]?.count || 1;
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={c.country} className="flex items-center gap-3">
                    <span className="text-xs w-4 text-charcoal/40 font-mono">{i + 1}</span>
                    <span className="text-sm font-medium text-charcoal w-20 truncate">{c.country}</span>
                    <div className="flex-1 bg-gold-50 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gold-pink transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-charcoal/60 w-12 text-right">{c.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA footer */}
        <div className="text-center">
          <p className="text-sm text-charcoal/40 mb-3">
            Powered by <span className="text-gold-500 font-semibold">LinkSnap</span> ✨
          </p>
          <Link to="/signup" className="btn-primary text-sm py-2.5 px-6">
            Create your own short links
          </Link>
          <p className="text-xs text-charcoal/30 mt-4">
            Part of a hackathon by{' '}
            <a href="https://katomaran.com" target="_blank" rel="noreferrer"
              className="hover:underline">katomaran.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
