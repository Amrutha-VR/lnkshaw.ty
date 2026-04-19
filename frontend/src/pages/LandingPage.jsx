import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 20 },
  animate:   { opacity: 1, y: 0 },
  transition:{ duration: 0.45, delay, ease: 'easeOut' },
});

const TICKER = 'URL SHORTENER · ANALYTICS · CUSTOM ALIASES · QR CODES · GEO TRACKING · EXPIRING LINKS · BULK UPLOAD · ';

const features = [
  { no: '01', title: 'Instant shortening',  body: 'Paste any URL. Get a clean short link in under a second. No bloat, no noise.' },
  { no: '02', title: 'Real-time analytics', body: 'Track clicks, countries, devices, and browsers. Live data, zero delay.' },
  { no: '03', title: 'Custom aliases',       body: 'lnkshawty.app/your-name. Brand your links your way.' },
  { no: '04', title: 'QR code generation',  body: 'Every link gets a QR code automatically. Download as PNG, done.' },
  { no: '05', title: 'Expiry control',       body: 'Set a deadline. After that, the link stops working. Useful for campaigns.' },
  { no: '06', title: 'Bulk upload',          body: 'Drop a CSV. Create 100 links at once. No clicking required.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper font-body">

      {/* ── Ticker tape ── */}
      <div className="bg-accent text-white py-1.5 ticker-wrap overflow-hidden">
        <div className="ticker-inner text-xs font-label font-700 tracking-widest">
          {TICKER.repeat(6)}
        </div>
      </div>

      {/* ── Masthead nav ── */}
      <header className="border-b-3 border-ink">
        <div className="max-w-7xl mx-auto px-6">
          {/* Top row */}
          <div className="flex items-center justify-between py-3 border-b border-rule">
            <span className="kicker">Est. 2024</span>
            <div className="flex items-center gap-4">
              <Link to="/login"   className="btn-ghost text-xs py-1.5 px-3">Sign in</Link>
              <Link to="/signup"  className="btn-primary text-xs py-1.5 px-4">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          {/* Masthead */}
          <div className="py-6 text-center border-b-3 border-ink">
            <h1 className="font-headline text-[clamp(2.5rem,8vw,6rem)] font-900 leading-none tracking-tight text-ink"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}>
              LnkShaw<span className="text-accent">.ty</span>
            </h1>
            <p className="font-deck text-sm italic text-muted mt-1"
              style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
              The intelligent URL shortener for people who care about their links.
            </p>
          </div>
          {/* Section labels */}
          <div className="grid grid-cols-3 divide-x divide-rule py-2 text-center">
            {['URL Shortener', 'Analytics', 'Free Forever'].map(s => (
              <div key={s} className="kicker py-1">{s}</div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b-3 border-ink">

          {/* Lead story */}
          <div className="lg:col-span-8 py-12 lg:pr-10 lg:border-r-3 lg:border-ink">
            <motion.div {...fadeUp(0)}>
              <div className="kicker mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-accent inline-block" />
                Breaking — your URLs are too long
              </div>
              <h2 className="font-headline text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] font-700 mb-6 text-ink"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Short links.<br />
                <span className="italic">Big analytics.</span><br />
                Zero noise.
              </h2>
              <p className="font-deck text-lg text-muted leading-relaxed max-w-xl mb-8"
                style={{ fontFamily: "'Libre Baskerville', serif" }}>
                LnkShaw.ty turns your sprawling URLs into clean, trackable links
                with real-time analytics, QR codes, and custom aliases — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="btn-primary px-8 py-3.5">
                  Start for free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-3.5">
                  Sign in
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Side column — stats */}
          <motion.div {...fadeUp(0.15)} className="lg:col-span-4 py-12 lg:pl-8 flex flex-col gap-6">
            <div className="kicker border-b border-rule pb-2">By the numbers</div>
            {[
              { n: '10K+',  l: 'Active users' },
              { n: '5M+',   l: 'Links created' },
              { n: '99.9%', l: 'Uptime' },
              { n: '190+',  l: 'Countries tracked' },
            ].map(({ n, l }) => (
              <div key={l} className="border-b border-rule pb-5">
                <div className="font-headline text-4xl font-700 text-ink"
                  style={{ fontFamily: "'Playfair Display', serif" }}>{n}</div>
                <div className="kicker mt-0.5">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Demo strip ── */}
        <motion.div {...fadeUp(0.2)} className="border-b-3 border-ink py-8">
          <div className="kicker mb-4">See it in action</div>
          <div className="bg-ink p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="kicker text-paper/50 mb-1">Before</div>
              <p className="font-mono text-sm text-rule truncate">
                https://www.example.com/this/is/a/very/long/url/that/nobody/wants/to-type
              </p>
            </div>
            <div className="text-accent font-headline text-2xl hidden sm:block">→</div>
            <div className="flex-1 min-w-0">
              <div className="kicker text-paper/50 mb-1">After</div>
              <p className="font-mono text-sm text-white font-700">lnkshaw.ty/my-link</p>
            </div>
          </div>
        </motion.div>

        {/* ── Features grid ── */}
        <div className="py-12 border-b-3 border-ink">
          <div className="kicker mb-6">What's inside</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-rule border border-rule">
            {features.map((f, i) => (
              <motion.div key={f.no} {...fadeUp(i * 0.07)}
                className="p-6 hover:bg-ink hover:text-paper group transition-colors duration-200 cursor-default">
                <div className="font-label text-xs font-700 tracking-widest text-muted group-hover:text-paper/50 mb-3"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  — {f.no}
                </div>
                <h3 className="font-headline text-lg font-700 mb-2 group-hover:text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {f.title}
                </h3>
                <p className="text-sm text-muted group-hover:text-paper/70 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="py-16 text-center border-b-3 border-ink">
          <div className="kicker mb-4">Ready to publish?</div>
          <h2 className="font-headline text-[clamp(1.8rem,4vw,3rem)] font-700 mb-4 text-ink"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Your links deserve better.
          </h2>
          <p className="text-muted font-deck italic mb-8"
            style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Free forever. No credit card. No nonsense.
          </p>
          <Link to="/signup" className="btn-primary px-12 py-4 text-base">
            Create your account <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-3 border-ink bg-ink text-paper py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-headline text-xl font-700"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            LnkShaw<span className="text-accent">.ty</span>
          </span>
         
        </div>
      </footer>
    </div>
  );
}
