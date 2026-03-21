import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0a0a0a',
              color: '#f5f0e8',
              borderRadius: '0',
              border: '3px solid #0a0a0a',
              boxShadow: '4px 4px 0 #c8102e',
              padding: '12px 16px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            },
            success: { iconTheme: { primary: '#f5f0e8', secondary: '#0a0a0a' } },
            error:   { iconTheme: { primary: '#c8102e', secondary: '#f5f0e8' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
