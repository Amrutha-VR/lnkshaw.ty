/**
 * OAuthCallbackPage
 * Extracts JWT from URL hash after Google OAuth redirect
 * Cleans up the URL and redirects to dashboard
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function OAuthCallbackPage() {
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1)); // Remove leading '#'
    const token = params.get('token');

    if (token) {
      // Clean token from URL immediately (security: don't leave in history)
      window.history.replaceState(null, '', '/auth/callback');

      handleOAuthCallback(token)
        .then(() => {
          toast.success('Signed in with Google! ✨');
          navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          toast.error('Google sign-in failed');
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gold-pink mx-auto mb-4 animate-pulse-gold" />
        <p className="text-charcoal/60 font-body">Completing sign-in…</p>
      </div>
    </div>
  );
}
