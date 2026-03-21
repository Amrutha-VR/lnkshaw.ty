/**
 * Modals.jsx — All dashboard modal components
 * QrCodeModal, EditUrlModal, BulkUploadModal
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, QrCode, Upload, FileText } from 'lucide-react';
import { urlService } from '../../services/urlService.js';

// ─── Shared Backdrop ─────────────────────────────────────────────────────────
const Backdrop = ({ children, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    {children}
  </motion.div>
);

const ModalBox = ({ children, className = '' }) => (
  <motion.div
    initial={{ scale: 0.92, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.92, opacity: 0 }}
    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    className={`card w-full ${className}`}
  >
    {children}
  </motion.div>
);

// ─── QR Code Modal ────────────────────────────────────────────────────────────
export function QrCodeModal({ url, onClose }) {
  const [qrCode, setQrCode]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    urlService.getQrCode(url._id)
      .then((res) => setQrCode(res.data.data.qrCode))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [url._id]);

  const download = () => {
    const a = document.createElement('a');
    a.href = qrCode;
    a.download = `qr-${url.shortCode}.png`;
    a.click();
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalBox className="max-w-sm p-6 text-center">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-gold-500" />
            <h3 className="font-display font-bold text-lg text-charcoal">QR Code</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-charcoal/50 font-mono mb-4">/{url.shortCode}</p>

        <div className="bg-gold-50 rounded-2xl p-4 flex items-center justify-center min-h-[180px] mb-4">
          {loading
            ? <div className="skeleton w-40 h-40 rounded-xl" />
            : qrCode
              ? <img src={qrCode} alt="QR Code" className="w-40 h-40 rounded-lg" />
              : <p className="text-sm text-charcoal/40">QR code unavailable</p>
          }
        </div>

        <button onClick={download} disabled={!qrCode} className="btn-primary w-full">
          <Download className="w-4 h-4" /> Download PNG
        </button>
      </ModalBox>
    </Backdrop>
  );
}

// ─── Edit URL Modal ───────────────────────────────────────────────────────────
export function EditUrlModal({ url, onClose, onUpdated }) {
  const [form, setForm]       = useState({
    originalUrl: url.originalUrl,
    title:       url.title || '',
    expiresAt:   url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await urlService.update(url._id, {
        originalUrl: form.originalUrl,
        title:       form.title,
        expiresAt:   form.expiresAt || null,
      });
      onUpdated(res.data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalBox className="max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-charcoal">Edit link</h3>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-blush-50 border border-blush-200 text-blush-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">
              Destination URL <span className="text-blush-500">*</span>
            </label>
            <input type="url" value={form.originalUrl} onChange={set('originalUrl')}
              className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Label</label>
            <input value={form.title} onChange={set('title')}
              className="input-field" placeholder="Optional label" maxLength={200} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">
              Expiry date <span className="text-charcoal/40 font-normal">(optional)</span>
            </label>
            <input type="datetime-local" value={form.expiresAt} onChange={set('expiresAt')}
              className="input-field" />
            {form.expiresAt && (
              <button type="button" onClick={() => setForm((p) => ({ ...p, expiresAt: '' }))}
                className="text-xs text-blush-500 mt-1 hover:underline">
                Remove expiry
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading
                ? <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                : 'Save changes ✨'}
            </button>
          </div>
        </form>
      </ModalBox>
    </Backdrop>
  );
}

// ─── Bulk Upload Modal ────────────────────────────────────────────────────────
export function BulkUploadModal({ onClose, onDone }) {
  const [file, setFile]           = useState(null);
  const [result, setResult]       = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      alert('Please upload a CSV file (.csv)');
      return;
    }
    if (f.size > 1024 * 1024) {
      alert('File size must be under 1MB');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    try {
      const res = await urlService.bulkUpload(file);
      setResult(res.data);
      onDone();
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || 'Upload failed. Please check your CSV format.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalBox className="max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-gold-500" />
            <h3 className="font-display font-bold text-xl text-charcoal">Bulk upload CSV</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CSV format guide */}
        <div className="bg-gold-50 border border-gold-200 rounded-2xl p-3 mb-4">
          <p className="text-xs font-semibold text-gold-700 mb-1.5">📋 CSV format (first row = header):</p>
          <pre className="text-xs font-mono text-charcoal/70 overflow-x-auto">
{`originalUrl,customAlias,title
https://example.com,my-link,My Blog
https://other.com,,Another Link`}
          </pre>
          <p className="text-xs text-charcoal/50 mt-1.5">Max 100 URLs · Max 1MB</p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-gold-400 bg-gold-100 scale-[1.02]'
              : file
                ? 'border-gold-400 bg-gold-50'
                : 'border-gold-200 hover:border-gold-300 hover:bg-gold-50'
            }`}
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />

          {file ? (
            <>
              <FileText className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gold-700">{file.name}</p>
              <p className="text-xs text-charcoal/40 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB · Click to change
              </p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-charcoal/30 mx-auto mb-2" />
              <p className="text-sm font-medium text-charcoal/60">
                Drop your CSV here or <span className="text-gold-600 font-semibold">browse</span>
              </p>
            </>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-3 rounded-2xl text-sm border
            ${result.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
            }`}>
            <p className="font-semibold">{result.message}</p>
            {result.data?.created?.length > 0 && (
              <p className="text-xs mt-1">✅ {result.data.created.length} URLs created successfully</p>
            )}
            {result.data?.errors?.length > 0 && (
              <p className="text-xs mt-0.5">❌ {result.data.errors.length} rows failed</p>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-secondary flex-1">
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button onClick={handleSubmit} disabled={!file || isLoading} className="btn-primary flex-1">
              {isLoading
                ? <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading…
                  </span>
                : <><Upload className="w-4 h-4" /> Upload CSV</>
              }
            </button>
          )}
        </div>
      </ModalBox>
    </Backdrop>
  );
}

// Default export for backward compatibility
export default QrCodeModal;
