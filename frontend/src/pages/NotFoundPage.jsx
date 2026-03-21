import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
      <div className="kicker mb-3">Error 404</div>
      <h1 className="font-headline text-[8rem] font-700 leading-none text-ink mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}>404</h1>
      <p className="font-deck italic text-muted text-lg mb-8"
        style={{ fontFamily: "'Libre Baskerville', serif" }}>
        This link doesn't exist or was deleted.
      </p>
      <div className="flex gap-3">
        <Link to="/"          className="btn-primary">Go home</Link>
        <Link to="/dashboard" className="btn-secondary">My links</Link>
      </div>
    </div>
  );
}
export default NotFoundPage;
