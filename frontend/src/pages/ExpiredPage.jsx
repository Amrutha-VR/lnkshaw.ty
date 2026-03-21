import { Link } from 'react-router-dom';

export default function ExpiredPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
      <div className="kicker mb-3">Link Expired</div>
      <h1 className="font-headline text-5xl font-700 text-ink mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}>
        This link has expired.
      </h1>
      <p className="font-deck italic text-muted mb-8"
        style={{ fontFamily: "'Libre Baskerville', serif" }}>
        The owner set an expiry date and it has passed.
      </p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  );
}
