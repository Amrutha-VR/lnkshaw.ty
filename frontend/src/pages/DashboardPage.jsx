import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Copy, Trash2, BarChart3, ExternalLink,
  QrCode, Upload, ChevronRight, CheckCheck,
  MousePointerClick, Calendar
} from 'lucide-react';
import { useUrls, useAnalyticsOverview, useClipboard, useDebounce } from '../hooks/index.js';
import CreateUrlModal from '../components/dashboard/CreateUrlModal.jsx';
import { BulkUploadModal, QrCodeModal, EditUrlModal } from '../components/dashboard/Modals.jsx';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ label, value, isLoading }) => (
  <div className="border-3 border-ink bg-offwhite p-5">
    <div className="kicker mb-2">{label}</div>
    {isLoading
      ? <div className="skeleton h-8 w-20 mt-1" />
      : <div className="font-headline text-3xl font-700 text-ink"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          {value ?? '—'}
        </div>
    }
  </div>
);

const UrlRow = ({ url, onDelete, onCopy, isCopied, onQr, onEdit }) => {
  const appUrl   = import.meta.env.VITE_APP_URL || '';
  const shortUrl = `${appUrl}/${url.shortCode}`;
  return (
    <div className={`border-b border-rule last:border-b-0 py-4 px-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-rule/20 transition-colors ${url.isExpired ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {url.isExpired     && <span className="badge badge-red">expired</span>}
          {url.isCustomAlias && <span className="badge badge-outline">custom</span>}
          {url.title         && <span className="text-sm font-700 text-ink truncate">{url.title}</span>}
        </div>

        {/* Short URL */}
        <a href={shortUrl} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-sm font-700 text-accent hover:underline underline-offset-2 mb-0.5">
          {shortUrl.replace(/^https?:\/\//, '')}
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Original URL */}
        <p className="text-xs text-muted truncate max-w-sm">{url.originalUrl}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-muted font-600">
          <span className="flex items-center gap-1">
            <MousePointerClick className="w-3 h-3" /> {url.clickCount} clicks
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={() => onCopy(shortUrl, url._id)} title="Copy"
          className={`p-2 border-2 text-xs font-700 transition-colors duration-100
            ${isCopied(url._id)
              ? 'border-green-500 bg-green-50 text-green-600'
              : 'border-ink bg-paper hover:bg-ink hover:text-paper'}`}>
          {isCopied(url._id) ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button onClick={() => onQr(url)} title="QR Code"
          className="p-2 border-2 border-ink bg-paper hover:bg-ink hover:text-paper transition-colors">
          <QrCode className="w-3.5 h-3.5" />
        </button>

        <Link to={`/dashboard/analytics/${url.shortCode}`} title="Analytics"
          className="p-2 border-2 border-ink bg-paper hover:bg-ink hover:text-paper transition-colors">
          <BarChart3 className="w-3.5 h-3.5" />
        </Link>

        <button onClick={() => onEdit(url)} title="Edit"
          className="p-2 border-2 border-ink bg-paper hover:bg-ink hover:text-paper transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => { if (window.confirm(`Delete "/${url.shortCode}"?`)) onDelete(url._id); }}
          title="Delete"
          className="p-2 border-2 border-accent bg-paper text-accent hover:bg-accent hover:text-paper transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const UrlSkeleton = () => (
  <div className="border-b border-rule py-4 px-5 flex items-center gap-4">
    <div className="flex-1 space-y-2">
      <div className="skeleton h-4 w-36" />
      <div className="skeleton h-3 w-56" />
    </div>
    <div className="flex gap-1.5">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton w-8 h-8" />)}
    </div>
  </div>
);

export default function DashboardPage() {
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk]     = useState(false);
  const [qrUrl, setQrUrl]           = useState(null);
  const [editUrl, setEditUrl]       = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const { copy, isCopied } = useClipboard();
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { urls, pagination, isLoading, deleteUrl, addUrl, updateUrl, refetch } = useUrls({
    page, limit: 10, search: debouncedSearch,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* ── Header ── */}
      <div className="border-b-3 border-ink pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="kicker mb-1">Dashboard</div>
            <h1 className="font-headline text-3xl font-700 text-ink"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              My Links
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulk(true)} className="btn-secondary text-xs py-2 px-4">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bulk upload</span>
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary text-xs py-2 px-4">
              <Plus className="w-3.5 h-3.5" /> New link
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Total links"  value={overview?.totalUrls?.toLocaleString()}   isLoading={overviewLoading} />
        <StatCard label="Total clicks" value={overview?.totalClicks?.toLocaleString()} isLoading={overviewLoading} />
        <StatCard label="Top link"
          value={overview?.topUrls?.[0] ? `/${overview.topUrls[0].shortCode}` : '—'}
          isLoading={overviewLoading} />
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search links…"
          className="input-field pl-9 w-full" />
      </div>

      {/* ── URL table ── */}
      <div className="border-3 border-ink">
        {/* Table header */}
        <div className="border-b-3 border-ink px-5 py-2.5 bg-ink">
          <div className="kicker text-paper">All links</div>
        </div>

        {isLoading
          ? [...Array(4)].map((_, i) => <UrlSkeleton key={i} />)
          : urls.length === 0
            ? (
              <div className="py-16 text-center">
                <div className="kicker mb-3">No links found</div>
                <p className="text-muted text-sm font-deck italic mb-6"
                  style={{ fontFamily: "'Libre Baskerville', serif" }}>
                  {search ? 'Try a different search term.' : 'Create your first short link to get started.'}
                </p>
                {!search && (
                  <button onClick={() => setShowCreate(true)} className="btn-primary">
                    <Plus className="w-4 h-4" /> Create link
                  </button>
                )}
              </div>
            )
            : (
              <AnimatePresence mode="popLayout">
                {urls.map(url => (
                  <UrlRow key={url._id} url={url}
                    onDelete={deleteUrl} onCopy={copy}
                    isCopied={isCopied} onQr={setQrUrl} onEdit={setEditUrl} />
                ))}
              </AnimatePresence>
            )
        }
      </div>

      {/* ── Pagination ── */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}
            className="btn-secondary text-xs py-2 px-5 disabled:opacity-30">← Prev</button>
          <span className="kicker">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}
            className="btn-secondary text-xs py-2 px-5 disabled:opacity-30">Next →</button>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCreate && <CreateUrlModal key="create" onClose={() => setShowCreate(false)}
          onCreated={(u) => { addUrl({ ...u, isExpired: false }); setShowCreate(false); toast.success('Link created.'); }} />}
        {showBulk   && <BulkUploadModal key="bulk" onClose={() => setShowBulk(false)} onDone={refetch} />}
        {qrUrl      && <QrCodeModal key="qr" url={qrUrl} onClose={() => setQrUrl(null)} />}
        {editUrl    && <EditUrlModal key="edit" url={editUrl} onClose={() => setEditUrl(null)}
          onUpdated={(u) => { updateUrl(editUrl._id, u); setEditUrl(null); toast.success('Updated.'); }} />}
      </AnimatePresence>
    </div>
  );
}
