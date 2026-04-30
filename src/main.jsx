import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/hooks/useAuth';
import { LanguageProvider } from './lib/i18n/LanguageContext';
import ErrorBoundary from './lib/ErrorBoundary';
import App from './App';
import './index.css';
import './phase11.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
