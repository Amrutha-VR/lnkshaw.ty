import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { urlService } from '../../services/urlService.js';

export default function CreateUrlModal({ onClose, onCreated }) {
  const [form, setForm]           = useState({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await urlService.create({
        originalUrl: form.originalUrl,
        ...(form.customAlias && { customAlias: form.customAlias }),
        ...(form.title       && { title: form.title }),
        ...(form.expiresAt   && { expiresAt: form.expiresAt }),
      });
      onCreated(res.data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-paper border-3 border-ink w-full max-w-md"
        style={{ boxShadow: '6px 6px 0 #0a0a0a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-3 border-ink bg-ink">
          <div>
            <div className="kicker text-paper/50 text-xs">Create</div>
            <h2 className="font-headline text-xl font-bold text-paper"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              New short link
            </h2>
          </div>
          <button onClick={onClose} className="text-paper/60 hover:text-paper transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-5 p-3 border-l-4 border-accent bg-accent/5 flex items-center gap-2 text-sm text-accent font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Destination URL */}
            <div>
              <label className="kicker block mb-1.5">
                Destination URL <span className="text-accent">*</span>
              </label>
              <input type="url" value={form.originalUrl} onChange={set('originalUrl')}
                className="input-field w-full"
                placeholder="https://your-long-url.com/goes/here"
                required />
            </div>

            {/* Custom alias */}
            <div>
              <label className="kicker block mb-1.5">
                Custom alias <span className="text-muted normal-case" style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: '11px', letterSpacing: 0 }}>(optional)</span>
              </label>
              <div className="flex border-b-2 border-rule focus-within:border-ink transition-colors">
                <span className="py-3 pr-0 pl-0 text-sm font-bold text-muted whitespace-nowrap"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                  lnkshaw.ty/
                </span>
                <input value={form.customAlias} onChange={set('customAlias')}
                  className="flex-1 py-3 px-2 bg-transparent text-sm text-ink outline-none font-bold placeholder:text-muted/40 placeholder:font-normal"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  placeholder="my-link" maxLength={50} />
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="kicker block mb-1.5">
                Label <span className="text-muted normal-case" style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: '11px', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input value={form.title} onChange={set('title')}
                className="input-field w-full"
                placeholder="e.g. Campaign launch, Blog post…"
                maxLength={200} />
            </div>

            {/* Expiry */}
            <div>
              <label className="kicker block mb-1.5">
                Expiry date <span className="text-muted normal-case" style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: '11px', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input type="datetime-local" value={form.expiresAt} onChange={set('expiresAt')}
                min={minDate.toISOString().slice(0, 16)}
                className="input-field w-full" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-rule">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3">
                {isLoading
                  ? <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                      Creating…
                    </span>
                  : 'Create link'
                }
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
