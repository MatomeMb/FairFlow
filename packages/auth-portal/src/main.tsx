import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { PortalRouter } from './router/PortalRouter';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <PortalRouter />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
